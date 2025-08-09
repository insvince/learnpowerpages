if (typeof common == 'undefined') {
    common = {
        __namespace: true,
    };
}

if (typeof common.functions == 'undefined') {
    common.functions = {
        __namespace: true,
    };
}

common.functions = {
    //#region Refactoring 1. 2. 3. 4.
    // These functions are now replaced by the above createRecord, updateRecord, and deleteRecord
    executeRequest: async function (method, url, data = null, headers = {}) {
        if (!method || !url) throw new Error('Invalid method or URL for request');

        method = method.toUpperCase();
        try {
            const response = await new Promise((resolve, reject) => {
                webapi.safeAjax({
                    type: method,
                    url,
                    contentType: 'application/json',
                    headers,
                    data: data ? JSON.stringify(data) : undefined,
                    success: (data, textStatus, xhr) => resolve({ data, xhr }),
                    error: (xhr) => {
                        let message = 'Unknown error';
                        try {
                            const json = JSON.parse(xhr.responseText);
                            message = json.error?.message || JSON.stringify(json);
                        } catch {
                            message = xhr.responseText || 'Unknown error';
                        }
                        reject({
                            status: xhr.status,
                            statusText: xhr.statusText,
                            message,
                            raw: xhr,
                        });
                    },
                });
            });
            return response;
        } catch (err) {
            console.error('Request failed:', err);
            throw err;
        }
    },

    retrieveEntityRefactor: async function (url, pageSize) {
        let headers = { Prefer: 'odata.include-annotations=*' };
        if (pageSize) headers.Prefer += `,odata.maxpagesize=${pageSize}`;
        const result = await common.functions.executeRequest(REQUEST_METHOD.GET, url, null, headers);
        return { data: result.data, xhr: result.xhr, nextLink: result.data['@odata.nextLink'] || null };
    },

    createRecordRefactor: async function (record, entitySetName) {
        const result = await common.functions.executeRequest(REQUEST_METHOD.POST, `/_api/${entitySetName}`, record);
        return { data: result.data, id: result.xhr.getResponseHeader('entityid') || null };
    },

    updateRecordRefactor: function (record, entitySetName, id) {
        return common.functions.executeRequest(REQUEST_METHOD.PATCH, `/_api/${entitySetName}(${id})`, record);
    },

    deleteRecordRefactor: function (entitySetName, recordId) {
        return common.functions.executeRequest(REQUEST_METHOD.DELETE, `/_api/${entitySetName}(${recordId})`);
    },
    //#endregion

    //#region 5. Set field Value
    setFieldValue: function setFieldValue(schemaName, value, hasParent = false) {
        const field = hasParent ? parent.document.querySelector(`[id='${schemaName}']`) : document.querySelector(`[id='${schemaName}']`);

        if (field) {
            field.value = value ?? '';
            field.dispatchEvent(new Event('change'));
        }
    },
    //#endregion

    //#region 6. get key by object value
    getKeyByValue: function getKeyByValue(object, value) {
        return Object.keys(object).find((key) => object[key] === value);
    },
    //#endregion

    //#region 7. show loading process
    startLoading: function startLoading() {
        createSpinner(); // ensure the spinner exists
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex'; // show spinner
        }
        document.body.style.pointerEvents = 'none'; // disable all interactions
    },
    //#endregion

    //#region 8. hide loading process
    stopLoading: function stopLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none'; // hide spinner
        }
        document.body.style.pointerEvents = 'auto'; // enable interactions
    },
    //#endregion

    //#region open/close progress
    openProgress: function openProgress(selectorContain = '#mainContent', zIndexSpinner = 12, zIndexOverlay = 10) {
        // create the spinner div
        let spinner = $('<div>', {
            id: 'spinner',
            class: 'spinner',
            css: {
                border: '5px solid rgba(0, 0, 0, 0.1)',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
                margin: 'auto',
                position: 'absolute',
                top: '50%',
                left: '48%',
                zIndex: zIndexSpinner,
                transform: 'translate(-50%, -50%)',
            },
        });
        // create the overlay div
        let overlay = $('<div>', {
            id: 'overlay',
            class: 'overlay',
            css: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '102%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: zIndexOverlay,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            },
        });
        // append the divs to the body
        $(selectorContain).append(spinner, overlay);
        $('body').css('overflow', 'hidden');
    },

    closeProgress: function closeProgress() {
        $('#spinner').remove();
        $('#overlay').remove();
        $('body').css('overflow', 'auto');
    },
    //#endregion

    //#region 10. change cell color on click
    changeCellColorOnClick: function changeCellColorOnClick(cell) {
        cell.classList.add('flash');
        setTimeout(function () {
            cell.classList.remove('flash');
        }, 500);
    },
    //#endregion

    //#region 11. format date custom iso
    formatToCustomISO: function formatToCustomISO(date) {
        // get the timezone offset in minutes
        const timezoneOffset = date.getTimezoneOffset();
        // calculate the offset in milliseconds
        const offsetMilliseconds = timezoneOffset * 60000;
        // adjust the date to account for the timezone offset
        const adjustedDate = new Date(date.getTime() - offsetMilliseconds);
        // get the offset hours and minutes
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
        const offsetMinutes = Math.abs(timezoneOffset) % 60;
        const offsetSign = timezoneOffset > 0 ? '-' : '+';
        // set the time to midnight plus the offset hours
        adjustedDate.setHours(offsetSign === '+' ? offsetHours : -offsetHours, offsetMinutes, 0, 0);
        // convert the adjusted date to ISO string
        let isoString = adjustedDate.toISOString();
        // replace the time part with 'HH:MM:00.0000000'
        let customISOString = isoString.replace(
            /T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
            `T${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}:00.0000000`
        );
        return customISOString;
    },
    //#endregion

    //#region 12. wrapper api
    wrapperAPI: function () {
        (function (webapi, $) {
            function safeAjax(ajaxOptions) {
                var deferredAjax = $.Deferred();
                shell
                    .getTokenDeferred()
                    .done(function (token) {
                        // add headers for AJAX
                        if (!ajaxOptions.headers) {
                            $.extend(ajaxOptions, {
                                headers: {
                                    __RequestVerificationToken: token,
                                },
                            });
                        } else {
                            ajaxOptions.headers['__RequestVerificationToken'] = token;
                        }
                        $.ajax(ajaxOptions)
                            .done(function (data, textStatus, jqXHR) {
                                validateLoginSession(data, textStatus, jqXHR, deferredAjax.resolve);
                            })
                            .fail(deferredAjax.reject); //AJAX
                    })
                    .fail(function () {
                        deferredAjax.rejectWith(this, arguments); // on token failure pass the token AJAX and args
                    });
                return deferredAjax.promise();
            }
            webapi.safeAjax = safeAjax;
        })((window.webapi = window.webapi || {}), jQuery);
    },
    //#endregion

    //#region 13. Open confirmation dialog
    openConfirmDialog: function openConfirmDialog(confirmStrings, cancelCallback, confirmCallback) {
        let dialogId = 'confirmation-dialog';
        let buttons = {};

        if (confirmStrings.dialogType !== 2) {
            buttons[confirmStrings.cancelLabel || 'Cancel'] = function () {
                cancelCallback($(`#${dialogId}`));
                $(this).dialog('close');
            };
        }
        buttons[confirmStrings.confirmLabel || 'OK'] = function () {
            confirmCallback($(`#${dialogId}`));
            $(this).dialog('close');
        };
        common.functions.openDialog(dialogId, confirmStrings.title, confirmStrings.text, buttons);
    },

    openDialog: function openDialog(dialogId, title, message, buttons) {
        let dialogHTML = `<div id='${dialogId}'><p>${message}</p></div>`;

        $(dialogHTML)
            .appendTo('body')
            .dialog({
                modal: true,
                title: title,
                zIndex: 10000,
                autoOpen: true,
                width: '400px',
                resizable: false,
                buttons: buttons,
                create: function () {
                    let dialogStyles = {
                        'border-radius': '3px',
                        'box-shadow': '0 10px 30px rgba(0, 0, 0, 0.3)',
                        'font-family': 'Verdana',
                        overflow: 'hidden',
                    };
                    $(this).parent().css(dialogStyles);

                    let titleBarStyles = {
                        'font-size': '18px',
                        'background-color': '#007bff',
                        color: '#fff',
                        'font-weight': 'bold',
                        padding: '10px',
                        'border-radius': '5px 5px 0 0',
                        border: 'none',
                    };
                    $(this).parent().find('.ui-dialog-titlebar').css(titleBarStyles);

                    let contentStyles = {
                        color: '#333',
                        padding: '20px',
                    };
                    $(this).css(contentStyles);

                    $(this).find('p').css('font-size', '14px').css('font-size', '14px !important');

                    let buttonPaneStyles = {
                        'background-color': '#f9f9f9',
                        'border-top': '1px solid #ddd',
                    };
                    $(this).parent().find('.ui-dialog-buttonpane').css(buttonPaneStyles);

                    let buttonPane = $(this).parent().find('.ui-dialog-buttonpane button');

                    buttonPane
                        .eq(0)
                        .css({
                            'font-family': 'Verdana',
                            'background-color': '#ccc',
                            color: '#333',
                            border: 'none',
                            'border-radius': '6px',
                            padding: '8px 15px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                        })
                        .hover(
                            function () {
                                $(this).css('background-color', '#bbb');
                            },
                            function () {
                                $(this).css('background-color', '#ccc');
                            }
                        );

                    buttonPane
                        .eq(1)
                        .css({
                            'font-family': 'Verdana',
                            'background-color': '#007bff',
                            color: '#fff',
                            border: 'none',
                            'border-radius': '6px',
                            padding: '8px 15px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                        })
                        .hover(
                            function () {
                                $(this).css('background-color', '#0056b3');
                            },
                            function () {
                                $(this).css('background-color', '#007bff');
                            }
                        );

                    $(this).parent().find('.ui-dialog-titlebar-close').addClass('ui-button-icon ui-icon ui-icon-closethick').css({
                        border: 'none',
                        color: '#fff',
                        'border-radius': '50%',
                        width: '18px',
                        display: 'none',
                    });
                },
                close: function () {
                    $(this).remove();
                },
            });
    },
    //#endregion

    //#region 14. format date
    formatDate: function formatDate(dateValue) {
        if (dateValue.length < 3) return;
        // create a new date object from the string
        let date = new Date(dateValue);
        // extract the year, month, and day
        let year = date.getUTCFullYear();
        let month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // months are zero-based
        let day = date.getUTCDate().toString().padStart(2, '0');
        // format the date as yyyy/MM/dd
        let formattedDate = `${year}/${month}/${day}`;
        return formattedDate;
    },

    formatDateStringToQuery: function formatDateStringToQuery(dateStr) {
        const date = new Date(dateStr.replace(/\//g, '-'));
        return date.toISOString();
    },

    formatDateToDisplay: function formatDateToDisplay(date) {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        return `${year}/${month}/${day}`;
    },

    // get input date type in form of power pages
    getDatePicker: function getDatePicker(schemaName) {
        return $('#' + schemaName)
            .siblings('.datetimepicker')
            .data('DateTimePicker');
    },

    // disable input date type in form
    disableDatePicker: function disableDatePicker(schemaName) {
        let picker = common.functions.getDatePicker(schemaName);
        if (picker) {
            picker.disable();
        }
    },

    // enable input date type in form
    enableDatePicker: function enableDatePicker(schemaName) {
        var picker = common.functions.getDatePicker(schemaName);
        if (picker) {
            picker.enable();
        }
    },

    // init input date type and lock date in form
    initDates: function initDates(startDate, schemaName) {
        var fromDate = startDate || moment().startOf('day');
        var pickerFrom = common.functions.getDatePicker(schemaName);
        pickerFrom.minDate(fromDate); // Set minDate to today
    },

    // handle on change input date type in form
    dateOnChange: function dateOnChange(schemaName) {
        var pickerFrom = common.functions.getDatePicker(schemaName);
        var from = pickerFrom.date();
        pickerFrom.minDate(pickerFrom); // Ensure minDate is today
    },

    // handle on change input date type in form
    validatePickerDate: function validatePickerDate(schemaName) {
        $(`#${schemaName}`)
            .closest('.datetimepicker')
            .on('dp.change', function (e) {
                common.functions.dateOnChange(schemaName);
            });
        common.functions.initDates(null, schemaName);
    },

    // handle on out focus input date type in form
    validateInputChangeDate: function validateInputChangeDate(schemaName) {
        $(`#${schemaName}_datepicker_description`).on('blur', function () {
            var selectedDate = $(this).val();
            if (selectedDate) {
                var minDate = moment().startOf('day'); // Set minDate to the start of today
                console.log(selectedDate);
                if (!moment(selectedDate, 'YYYY/MM/DD', true).isValid() || moment(selectedDate, 'YYYY/MM/DD').isBefore(minDate)) {
                    alert('Please select a valid date that is today or in the future.');
                    $(this).val(''); // Clear the invalid date
                }
            }
        });
    },
    //#endregion

    //#region 15. diable input text/multiple text type
    disableArrTextFields: function disableArrTextFields(arr, isDisable = true) {
        // Only text field
        arr.forEach((field) => {
            $(field).prop('readonly', isDisable);
        });
    },

    // disable for option/others field
    disableArrNotTextFields: function disableArrNotTextFields(arr, isDisable = true) {
        arr.forEach((field) => {
            $(field).prop('disabled', isDisable);
        });
    },

    // set temp disable field when submission
    setTempDisable: function setTempDisable(fields, shouldDisable = true) {
        fields.forEach((field) => {
            if (shouldDisable) {
                $(field).addClass('temp-disable');
            } else {
                $(field).removeClass('temp-disable');
            }
        });
    },
    //#endregion

    //#region 18. get select field when query
    getSelectField: function getSelectField(arrField) {
        if (arrField.length > 0) {
            let lstField = '';
            arrField.forEach((element) => {
                lstField += element + ',';
            });
            return lstField.slice(0, -1);
        }
        return null;
    },
    //#endregion

    //#region 21. multiple selected component
    multipleSelectedComponent: function multipleSelectedComponent(data, attributeId, defaultValue) {
        // Populate select element dynamically
        const selectElement = $(`#${attributeId}`);
        common.functions.appendOptions(data, selectElement);
        if (defaultValue) {
            selectElement.val(defaultValue).trigger('change');
        }
        // Iiitialize select2
        selectElement.select2({
            theme: 'bootstrap-5',
            width: '100%',
            closeOnSelect: false, // Keep open after selecting
            allowClear: true, // Allow clearing the selection
            // dropdownCssClass: scrollResult, // Apply custom scrollable dropdown
            language: {
                noResults: function () {
                    return 'No option available'; // Custom message
                },
            },
            escapeMarkup: function (markup) {
                return markup; // Allow custom HTML in the message
            },
        });
        // close select2 on click outside
        $(document).on('mousedown', function (e) {
            if (!$(e.target).closest('.select2-container').length && !$(e.target).closest('#multiple-select-dynamic').length) {
                selectElement.select2('close');
            }
        });
        // close select2 on pressing ESC
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape') {
                selectElement.select2('close');
            }
        });
    },
    appendOptions: function appendOptions(data, selectElement) {
        if (data.length > 0) {
            data.forEach((item) => {
                const option = new Option(item, item, false, false);
                selectElement.append(option);
            });
            selectElement.trigger('change'); // Refresh Select2 UI
        } else {
            selectElement.empty(); // Clear all options
            selectElement.trigger('change'); // Refresh Select2 UI
        }
    },
    //#endregion

    //#region 22. multiple selected component for multiple column
    multipleSelectedComponentForMultipleColumn: function multipleSelectedComponentForMultipleColumn(data, attributeId, colName1, colName2) {
        // populate select element dynamically
        const selectElement = $(`#${attributeId}`);
        common.functions.appendOptionsForMultipleColumn(data, selectElement);
        // initialize select2
        selectElement.select2({
            theme: 'bootstrap-5',
            width: '100%',
            closeOnSelect: false, // keep open after selecting
            allowClear: true, // Allow clearing the selection
            language: {
                noResults: function () {
                    return 'No option available'; // custom message
                },
            },
            escapeMarkup: function (markup) {
                return markup; // allow custom html in the message
            },
            templateResult: common.functions.formatOptionForMultipleColumn,
            templateSelection: common.functions.formatSelectionForMultipleColumn,
            dropdownCssClass: 'bigdrop', // custom class for dropdown
            minimumResultsForSearch: Infinity,
        });
        // add header to the dropdown
        const header = `
            <div style="display: table; width: 100%; table-layout: fixed; background-color: #f9f9f9; border-bottom: 1px solid #ddd;">
                <span style="display: table-cell; padding: 5px; font-weight: bold;">${colName1}</span>
                <span style="display: table-cell; padding: 5px; font-weight: bold;">${colName2}</span>
            </div>
        `;
        selectElement.data('select2').$dropdown.find('.select2-results__options').before(header);
        // close select2 on click outside
        $(document).on('mousedown', function (e) {
            if (!$(e.target).closest('.select2-container').length && !$(e.target).closest('#multiple-select-dynamic').length) {
                selectElement.select2('close');
            }
        });
        // close select2 on pressing ESC
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape') {
                selectElement.select2('close');
            }
        });
    },

    // format multiple selection in option tag html
    formatSelectionForMultipleColumn: function formatSelectionForMultipleColumn(option) {
        if (!option.id) return option.text;
        const optionData = $(option.element).data();
        return `${optionData.column1}`;
    },

    // format multiple selection in option tag html
    formatOptionForMultipleColumn: function formatOptionForMultipleColumn(option) {
        if (!option.id) return option.text;
        const optionData = $(option.element).data();
        return `
            <div style="display: table; width: 100%; table-layout: fixed;">
                <span style="display: table-cell; padding: 5px;">${optionData.column1}</span>
                <span style="display: table-cell; padding: 5px;">${optionData.column2}</span>
            </div>
        `;
    },

    //
    appendOptionsForMultipleColumn: function appendOptionsForMultipleColumn(data, selectElement) {
        // add table rows
        if (data.length > 0) {
            data.forEach((item) => {
                const option = new Option('', item.column1, false, false);
                $(option).data({
                    column1: item.column1,
                    column2: item.column2,
                });
                option.innerHTML = `
                    <span>${item.column1}</span>
                    <span>${item.column2}</span>
                `;
                selectElement.append(option);
            });
            selectElement.trigger('change'); // refresh select2 ui
        } else {
            selectElement.empty(); // clear all options
            selectElement.trigger('change'); // refresh select2 ui
        }
    },
    //#endregion

    //#region 23. delete record table custom
    // recalculate columns width datatable when scale window
    recalculateColumnWidthsDatatable: function recalculateColumnWidthsDatatable() {
        $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
    },

    // clear all data in datatable - deleteRecordTableCustom
    RemoveRecordInCustomTable: function RemoveRecordInCustomTable() {
        table.clear();
        console.log('Delete successfully!');
    },
    //#endregion

    //#region 24. disable button
    disableElements: function disableElements(arr) {
        if (arr.length > 0) {
            arr.forEach((item) => {
                $(`#${item}`).prop('disabled', true);
            });
        }
    },
    //#endregion

    //#region 25. get value in form
    getValueField: function getValueField(logicalName) {
        let value = $(`#${logicalName}`).val();
        return value;
    },
    //#endregion

    //#region 26. Clear cache
    // function to get the token from the specified url
    getToken: function (url, callback) {
        // open progress indicator
        common.functions.openProgress();
        // fetch the content from the url
        fetch(url)
            .then((response) => {
                // check if the response is ok, otherwise throw an error
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then((text) => {
                // parse the response text as html
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                // extract the token value from the parsed html
                const tokenValue = doc.querySelector('input[name="AboutProductHandlerXSRFToken"]')?.value;
                console.log(tokenValue);
                // execute the callback function with the token value
                callback(tokenValue);
            })
            .catch((error) => {
                // log any errors and execute the callback with null
                console.error('Error:', error);
                callback(null);
            })
            .finally(() => {
                // close progress indicator
                common.functions.closeProgress();
            });
    },

    // send post request to clear cache
    sendPostRequest: function (action, data) {
        common.functions.openProgress(); // open progress indicator
        fetch(action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data),
        })
            .then((response) => {
                // check if the response is ok, otherwise throw an error
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then((result) => {
                // reload the page after a delay
                setTimeout(() => window.location.reload(), 2000);
            })
            .catch((error) => {
                // log any errors
                console.error('Eror:', error);
            })
            .finally(() => {
                // close progress indicator
                common.functions.closeProgress();
            });
    },

    // request microsoft to clear cache in proxy
    clearCache: function () {
        const tokenUrl = `${window.location.origin}/_services/about`; // get the token from the specified url
        common.functions.getToken(tokenUrl, (tokenValue) => {
            if (tokenValue) {
                const data = {
                    AboutProductHandlerXSRFToken: tokenValue,
                    clearCache: 'Clear cache',
                }; // send post request to clear cache
                common.functions.sendPostRequest(tokenUrl, data);
            } else {
                // log error if token retrieval fails
                console.error('Failed to retrieve token');
            }
        });
    },
    //#endregion

    //#region 27. set value datepicker is null
    setValDatePicker: function setValDatePicker(arrSchema, result) {
        arrSchema.forEach((item) => {
            let fieldValue = common.functions.getValueField(item);
            if (fieldValue === defaultDate) $(`#${item}_datepicker_description`).val(result);
        });
    },
    //#endregion

    //#region 28. build selected fields
    buildSelectedFields: function buildSelectedFields(fields = []) {
        // Join the array of fields into a comma-separated string
        return fields.join(',');
    },

    buildCRMINQueryString: function buildCRMINQueryString(schemaName, data) {
        // data = ["'伊藤忠プラスチックス株式会社'", "'伊藤忠プラスチックス株式会社'"]
        // or ["'eb707d5c-69d4-ef11-8ee9-002248e9071b'", "'eb707d5c-69d4-ef11-8ee9-002248e9071b'",]
        // data = '123213213'
        return `Microsoft.Dynamics.CRM.In(PropertyName='${schemaName}',PropertyValues=[${
            typeof data !== 'string' ? data.map((item) => `${item}`).join(', ') : `'${data}'`
        }])`;
    },
    //#endregion

    //#region 29. browse File
    browseFile: function browseFile() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx';

            input.onchange = (event) => {
                const files = event.target.files;
                if (files && files.length > 0) {
                    resolve(files[0]);
                } else {
                    return null;
                }
            };

            input.oncancel = (event) => {
                resolve(null);
            };

            input.click();
        });
    },
    //#endregion browse File

    //#region 30. toBase64
    toBase64: async function toBase64(file) {
        const fileContext = new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
        return fileContext;
    },
    //#endregion toBase64

    //#region 31. call Power automate
    triggerCallAutomate: async function callAutomate(powerAtomateFlowendPoint, version, spValue, svValue, sigValue, requestBody) {
        // Define the Power Automate flow endpoint (your HTTP trigger URL for the flow)
        var flowUrl = powerAtomateFlowendPoint; // Replace with your actual Power Automate flow URL
        var queryParams = {
            'api-version': version, // Replace with the correct version
            sp: spValue, // Replace with the correct SP value
            sv: svValue, // Replace with the correct SV value
            sig: sigValue, // Replace with the correct SIG value
        };
        // Create the query string from the queryParams object
        var queryString = $.param(queryParams);
        // Combine the flow URL and the query string
        var fullUrl = flowUrl + '?' + queryString;
        // Set up the AJAX options
        var ajaxOptions = {
            url: fullUrl, // The Power Automate flow URL with query parameters
            method: 'POST', // Use POST method for sending data
            contentType: 'application/json', // Sending JSON data
            data: JSON.stringify(requestBody), // Convert request body to JSON string
        };
        // Call the wrapperAPI's safeAjax function to send the request
        await webapi
            .safeAjax(ajaxOptions)
            .done(function (response) {
                // Handle the successful response here
                console.log('Power Automate flow triggered successfully:', response);
            })
            .fail(function (error) {
                // Handle any errors here
                console.error('Error triggering Power Automate flow:', error);
            });
    },
    //#endregion

    //#region 32.DOM selectors
    getClassSelector: function getClassSelector(className) {
        return '.' + className;
    },
    getIdSelector: function getIdSelector(id) {
        return '#' + id;
    },
    //#endregion

    //#region 33.Multiple selection
    // Initialize multi-select
    initMultipleSelection: function initMultipleSelection(
        idMultipleSelection,
        data,
        strPlaceHolder,
        isSearch,
        isSelectAll,
        isListAll,
        intMaxLength,
        isCloseListOnItemSelect,
        strName,
        strWidth,
        strHeight,
        strDropdownWidth,
        strDropdownHeight,
        onChangeCallback,
        onSelectCallback,
        onUnselectCallback,
        isReinit = false
    ) {
        /* Sameple data
        const data =
            [{
                text: '伊藤忠プラスチックス株式会社',
                value: '伊藤忠プラスチックス株式会社',
                selected: true/false,
            }]
        */
        const options = {
            placeholder: strPlaceHolder,
            search: isSearch,
            selectAll: isSelectAll,
            listAll: isListAll,
            max: intMaxLength,
            closeListOnItemSelect: isCloseListOnItemSelect,
            name: strName || '',
            width: strWidth || '',
            height: strHeight || '',
            dropdownWidth: strDropdownWidth || '',
            dropdownHeight: strDropdownHeight || '',
            onChange:
                onChangeCallback ||
                function (value, text, element) {
                    console.log('Change:', value, text, element);
                },
            onSelect:
                onSelectCallback ||
                function (value, text, element) {
                    console.log('Selected:', value, text, element);
                },
            onUnselect:
                onUnselectCallback ||
                function (value, text, element) {
                    console.log('Unselected:', value, text, element);
                },
        };

        if (isReinit) {
            multipleSelectionElements[idMultipleSelection].multipleSelection.data = data;
            multipleSelectionElements[idMultipleSelection].multipleSelection._updateSelected();
            return;
        }

        if (data.length > 0) {
            options.data = data;
        }

        return (multipleSelectionElements[idMultipleSelection] = {
            id: idMultipleSelection,
            element: null,
            multipleSelection: new MultiSelect(idMultipleSelection, options),
        });
    },
    // Please ensure that your portal has a JQuery version greater than 3.0.0 or disable this function to avoid errors.
    // Return arrays of selected options
    getMultipleSelectionValueJQuery: function getMultipleSelectionValueJQuery(idMultipleSelection) {
        const $elements = $(`#${idMultipleSelection}`);
        if (!$elements) return;
        return $elements
            .find('.multi-select-selected:not(.multi-select-all)')
            .map(function () {
                return $(this).data('value');
            })
            .get();
    },
    // Return arrays of selected options
    getMultipleSelectionValue: function getMultipleSelectionValue(idMultipleSelection) {
        const elements = document.querySelector(`#${idMultipleSelection}`);
        if (!elements) return;
        const selected = elements.querySelectorAll('.multi-select-selected:not(.multi-select-all)');
        return Array.from(selected).map((el) => el.getAttribute('data-value'));
    },
    // Based on the variable multipleSelectionElements to re-initialize it with JQuery
    reInitialMultipleSelection: function reInitialMultipleSelection(
        currentId,
        data,
        strPlaceHolder,
        onChangeCallback,
        onSelectCallback,
        onUnselectCallback
    ) {
        try {
            debugger;
            const $el = $(common.functions.getIdSelector(currentId));
            const $parent = $el.parent();
            const $group = $el.closest('.input-group');
            const options = multipleSelectionElements[common.functions.getIdSelector(currentId)].multipleSelection.options;
            if ($parent) {
                // Remove parent(div) of element with current id
                $parent.remove();
                // Add new select tag with current id
                $group.append(`<select class="form-select" style="height: 36px" id="${currentId}"></select>`);
                // Call init func
                common.functions.initMultipleSelection(
                    common.functions.getIdSelector(currentId),
                    data,
                    strPlaceHolder,
                    options.search,
                    options.selectAll,
                    options.listAll,
                    options.max,
                    options.closeListOnItemSelect,
                    'purchaseOrderStatus',
                    options.width,
                    options.height,
                    options.dropdownWidth,
                    options.dropdownHeight,
                    onChangeCallback ||
                        function (value, text, element) {
                            // console.log('Custom Change Handler:', value);
                        },
                    onSelectCallback ||
                        function (value, text, element) {
                            // console.log('Custom Select Handler:', value);
                        },
                    onUnselectCallback ||
                        function (value, text, element) {
                            // console.log('Custom Unselect Handler:', value);
                        }
                );
                // New multiple selection have been already
                console.log('New multiple selection: ' + multipleSelectionElements[currentId]);
            }
        } catch (error) {
            throw new Error('Have errors when reinit multiple selection with id: ' + currentId);
        }
    },
    // Return valid data for multiple selection module
    // Array => return ["value"] => [{value: array[0], text: array[0]}]
    // Object => return [{key1: "value", key2: "value"}] => [{value: object[key1], text: object[key2]}]
    initDataMultipleSelection: function initDataMultipleSelection(arrs, valueKey, displayKey) {
        let data = [];
        arrs.forEach((option) => {
            const valueKeyTemp = valueKey ? option[valueKey] : option;
            const displayKeyTemp = displayKey ? option[displayKey] : option;
            data.push({ value: valueKeyTemp, text: displayKeyTemp });
        });
        return data;
    },
    // Clear all selected of multiple selection
    clearSelectedOptions: function clearSelectedOptions() {
        document.querySelectorAll('.multi-select').forEach((select, index) => {
            multipleSelectionElements[`#${select.id}`].multipleSelection._clearSelected();
        });
    },
    //#endregion
};
