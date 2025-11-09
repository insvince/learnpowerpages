/*
 * Core created by David Adams
 * Extended by Vince
 * Released under the MIT license
 */

// Store all MultiSelect instances by element id
const multipleSelectionElements = {};

const optionsSingleColumn = {
    placeholder: 'Select item(s)',
    max: null,
    search: true,
    selectAll: true,
    listAll: true,
    closeListOnItemSelect: false,
    name: null,
    width: null,
    height: null,
    dropdownWidth: null,
    dropdownHeight: null,
    data: [
        { value: '1', text: 'Option 1', selected: false },
        { value: '2', text: 'Option 2', selected: false },
        { value: '3', text: 'Option 3', selected: false },
        { value: '4', text: 'Option 4', selected: false },
        { value: '5', text: 'Option 5', selected: false },
        { value: '6', text: 'Option 6', selected: false },
        { value: '7', text: 'Option 7', selected: false },
    ],
    multiColumn: false,
    columns: [],
    onChange: function () {},
    onSelect: function () {},
    onUnselect: function () {},
    onSelectAll: function () {},
    onUnselectAll: function () {},
};

const optionsMultiColumn = {
    placeholder: 'Select region and nation',
    max: null,
    search: true,
    selectAll: true,
    listAll: true,
    closeListOnItemSelect: false,
    name: null,
    width: null,
    height: null,
    dropdownWidth: null,
    dropdownHeight: null,
    data: [
        { value: '1', region: 'Asia', nation: 'Vietnam', selected: false },
        { value: '2', region: 'Asia', nation: 'Thailand', selected: false },
        { value: '3', region: 'Europe', nation: 'France', selected: false },
        { value: '4', region: 'Europe', nation: 'Germany', selected: false },
        { value: '5', region: 'Europe', nation: 'Finland', selected: false },
        { value: '6', region: 'Europe', nation: 'Sweetzerland', selected: false },
        { value: '7', region: 'Europe', nation: 'England', selected: false },
    ],
    multiColumn: true,
    columns: [
        { key: 'region', label: 'Region' },
        { key: 'nation', label: 'Nation' },
    ],
    onChange: function () {},
    onSelect: function () {},
    onUnselect: function () {},
    onSelectAll: function () {},
    onUnselectAll: function () {},
};

class MultiSelect {
    /**
     * Initialize the MultiSelect component
     * @param {HTMLElement|string} element - The select element or selector
     * @param {Object} options - Configuration options
     */
    constructor(element, options = {}) {
        // Default options for the component
        const defaults = {
            placeholder: 'Select item(s)',
            max: null,
            search: true,
            selectAll: true,
            listAll: true,
            closeListOnItemSelect: false,
            name: null,
            width: null,
            height: null,
            dropdownWidth: null,
            dropdownHeight: null,
            data: [], // Array of objects with { value, text, selected, html }
            multiColumn: false, // Add this flag to enable multi-column mode
            columns: [], // Array of keys for columns, e.g. { key, label }
            onChange: function () {},
            onSelect: function () {},
            onUnselect: function () {},
            onSelectAll: function () {},
            onUnselectAll: function () {},
        };
        // Merge user options with defaults
        this.options = Object.assign(defaults, options);

        // Get the select element (by selector or direct reference)
        this.selectElement = typeof element === 'string' ? document.querySelector(element) : element;

        // Internal state
        this._isDisabled = false;

        // // Allow data-* attributes on the select element to override options
        // for (const prop in this.selectElement.dataset) {
        //     if (this.options[prop] !== undefined) {
        //         this.options[prop] = this.selectElement.dataset[prop];
        //     }
        // }

        // Set the name for the component (from attribute or generate unique)
        this.name = this.selectElement.getAttribute('name') ? this.selectElement.getAttribute('name') : 'multi-select-' + Math.floor(Math.random() * 1000000);

        // If no data provided, extract options from the select element
        if (!this.options.data.length) {
            let options = this.selectElement.querySelectorAll('option');
            for (let i = 0; i < options.length; i++) {
                this.options.data.push({
                    value: options[i].value,
                    text: options[i].innerHTML,
                    selected: options[i].selected,
                    html: options[i].getAttribute('data-html'),
                });
            }
        }

        // List of allowed properties from data-* attributes
        const allowedProps = {
            placeholder: 'placeholder',
            max: 'max',
            search: 'search',
            'select-all': 'selectAll',
            'list-all': 'listAll',
            'close-select': 'closeListOnItemSelect',
            width: 'width',
            height: 'height',
            'dropdown-width': 'dropdownWidth',
            'dropdown-height': 'dropdownHeight',
            multicolumn: 'multiColumn',
        };

        // Allow data-* attributes on the select element to override options
        for (const prop in this.selectElement.dataset) {
            if (allowedProps[prop]) {
                const mappedProp = allowedProps[prop];
                const value = this.selectElement.dataset[prop];
                if (value === 'true' || value === 'false') {
                    this.options[mappedProp] = value === 'true';
                } else if (!isNaN(value)) {
                    this.options[mappedProp] = parseFloat(value);
                } else {
                    this.options[mappedProp] = value;
                }
            }
        }

        // Build and replace the original select element with the custom component
        this.element = this._template();
        this.selectElement.replaceWith(this.element);

        // Update selected items in the UI
        this._updateSelected();

        // Attach event handlers for interaction
        this._eventHandlers();

        // Kiểm tra và đặt giá trị mặc định cho thuộc tính data
        if (!Array.isArray(this.options.data)) {
            console.error('Invalid data provided during initialization. Expected an array.');
            this.options.data = []; // Đặt giá trị mặc định nếu không hợp lệ
        }

        if (this.options.multiColumn && (!Array.isArray(this.options.columns) || this.options.columns.length === 0)) {
            console.error('Invalid columns provided for multi-column mode.');
            this.options.multiColumn = false; // Tắt chế độ multi-column nếu không hợp lệ
        }
    }

    /**
     * Build the HTML template for the custom multi-select component
     * Supports multi-column dropdown if options.multiColumn = true and options.columns is an array of keys
     * @returns {HTMLElement}
     */
    _template() {
        const { multiColumn, columns = [], data } = this.options;
        let optionsHTML = '';

        // Multi-column header row (optional)
        let optionsHeader = '';
        if (multiColumn && columns.length > 0) {
            optionsHeader = `
            <div class="multi-select-option-header">
            <span class="multi-select-option-header-spacing"></span>
                ${columns
                    .map(
                        (col) =>
                            `<span class="multi-select-option-col multi-select-option-col-${typeof col === 'string' ? col : col.key}">
                        ${typeof col === 'string' ? col.charAt(0).toUpperCase() + col.slice(1) : col.label}
                    </span>`
                    )
                    .join('')}
            </div>
        `;
        }

        // Render each option row
        for (let i = 0; i < data.length; i++) {
            const isSelected = this.selectedValues.includes(data[i].value);
            optionsHTML += `
            <div class="multi-select-option${isSelected ? ' multi-select-selected' : ''}" data-value="${data[i].value}">
                <span class="multi-select-option-radio"></span>
                ${
                    multiColumn && columns.length > 0
                        ? columns.map((col) => `<span class="multi-select-option-col multi-select-option-col-${col.key}">${data[i][col.key] || ''}</span>`).join('')
                        : `<span class="multi-select-option-text">${data[i].html ? data[i].html : data[i].text}</span>`
                }
            </div>
        `;
        }

        let selectAllHTML = '';
        if (this.options.selectAll === true || this.options.selectAll === 'true') {
            selectAllHTML = `<div class="multi-select-all">
                <span class="multi-select-option-radio"></span>
                <span class="multi-select-option-text">Select all</span>
            </div>`;
        }

        let template = `
        <div class="multi-select ${this.name}"${this.selectElement.id ? ' id="' + this.selectElement.id + '"' : ''} style="${this.width ? 'width:' + this.width + ';' : ''}${
            this.height ? 'height:' + this.height + ';' : ''
        }">
            ${this.selectedValues.map((value) => `<input type="hidden" name="${this.name}[]" value="${value}">`).join('')}
            <div class="multi-select-header" style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}">
                <span class="multi-select-header-placeholder">${this.placeholder}</span>
                <span class="multi-select-header-max">${this.options.max ? this.selectedValues.length + '/' + this.options.max : ''}</span>
            </div>
            <div class="multi-select-options" style="${this.options.dropdownWidth ? 'width:' + this.options.dropdownWidth + ';' : ''}${
            this.options.dropdownHeight ? 'height:' + this.options.dropdownHeight + ';' : ''
        }">
                ${this.options.search === true || this.options.search === 'true' ? '<input type="text" class="multi-select-search" placeholder="Search...">' : ''}
                ${optionsHeader}
                ${selectAllHTML}
                ${optionsHTML}
            </div>
        </div>
    `;
        let element = document.createElement('div');
        element.style.width = '100%';
        element.innerHTML = template;
        return element;
    }

    /**
     * Attach all event handlers for the component
     */
    _eventHandlers() {
        // Remove existing event listeners
        this.element.querySelectorAll('.multi-select-option').forEach((option) => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
        });

        // Add new event listeners
        const headerElement = this.element.querySelector('.multi-select-header');
        const { multiColumn, columns = [] } = this.options;
        // Handle option click (select/unselect)
        this.element.querySelectorAll('.multi-select-option').forEach((option) => {
            option.onclick = () => {
                if (this._isDisabled) return;
                let selected = true;
                if (!option.classList.contains('multi-select-selected')) {
                    // Select option
                    if (this.options.max && this.selectedValues.length >= this.options.max) {
                        // If max = 1 → switch to the newly selected option
                        if (this.options.max === 1) {
                            // Deselect all currently selected options
                            this.element.querySelectorAll('.multi-select-option.multi-select-selected').forEach((selectedOption) => {
                                selectedOption.classList.remove('multi-select-selected');
                                const value = selectedOption.dataset.value;

                                // Remove hidden input
                                const hiddenInput = this.element.querySelector(`input[value="${value}"]`);
                                if (hiddenInput) hiddenInput.remove();

                                // Update data source
                                const item = this.data.find((d) => d.value == value);
                                if (item) item.selected = false;

                                // Remove selected item from header
                                const headerOption = this.element.querySelector(`.multi-select-header-option[data-value="${value}"]`);
                                if (headerOption) headerOption.remove();
                            });

                            // Remove summary element (if any)
                            if (this.element.querySelector('.multi-select-header-more')) {
                                this.element.querySelector('.multi-select-header-more').remove();
                            }
                        } else {
                            // For other cases (max > 1), prevent selecting more
                            return;
                        }
                    }
                    this.element.querySelector('.multi-select').insertAdjacentHTML('afterbegin', `<input type="hidden" name="${this.name}[]" value="${option.dataset.value}">`);
                    this.data.find((data) => data.value == option.dataset.value).selected = true;
                    option.classList.add('multi-select-selected');

                    // Show selected items in header if enabled
                    if (this.options.listAll === true || this.options.listAll === 'true') {
                        if (headerElement.querySelector('.multi-select-header-more')) {
                            // If currently in summary state, just update the summary
                            this._updateHeaderSummaryByWidth(headerElement);
                        } else {
                            // Add new option to header
                            // Khi insert vào header
                            if (multiColumn && columns.length > 0) {
                                const display = columns
                                    .map((col) =>
                                        typeof col === 'string'
                                            ? option.querySelector(`.multi-select-option-col-${col}`)?.innerText || ''
                                            : option.querySelector(`.multi-select-option-col-${col.key}`)?.innerText || ''
                                    )
                                    .join(' | ');
                                headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option" data-value="${option.dataset.value}">${display}</span>`);
                            } else {
                                headerElement.insertAdjacentHTML(
                                    'afterbegin',
                                    `<span class="multi-select-header-option" data-value="${option.dataset.value}">${
                                        option.querySelector('.multi-select-option-text').innerHTML
                                    }</span>`
                                );
                            }
                            this._updateHeaderSummaryByWidth(headerElement);
                        }
                    }

                    // Update select all state
                    let selectAllButton = this.element.querySelector('.multi-select-all');
                    if (this.options.max && this.selectedValues.length === this.options.max) {
                        if (this.options.selectAll === true || this.options.selectAll === 'true') {
                            selectAllButton.classList.add('multi-select-selected');
                        }
                    } else if (this.selectedValues.length === this.options.data.length) {
                        if (this.options.selectAll === true || this.options.selectAll === 'true') {
                            selectAllButton.classList.add('multi-select-selected');
                        }
                    }
                } else {
                    // Unselect option
                    option.classList.remove('multi-select-selected');
                    this.element.querySelectorAll('.multi-select-header-option').forEach((headerOption) => {
                        if (headerOption.dataset.value == option.dataset.value) headerOption.remove();
                    });
                    this.element.querySelector(`input[value="${option.dataset.value}"]`).remove();
                    this.data.find((data) => data.value == option.dataset.value).selected = false;
                    selected = false;

                    // Update select all state
                    let selectAllButton = this.element.querySelector('.multi-select-all');
                    if (this.selectedValues.length !== this.options.data.length) {
                        if (this.options.selectAll === true || this.options.selectAll === 'true') {
                            selectAllButton.classList.remove('multi-select-selected');
                        }
                    }

                    // Dynamic width: update header
                    if (this.options.listAll === true || this.options.listAll === 'true') {
                        // Remove summary if exists
                        if (headerElement.querySelector('.multi-select-header-more')) {
                            headerElement.querySelector('.multi-select-header-more').remove();
                        }
                        // Show all selected options again
                        const arrays = Array.from(this.element.querySelectorAll('.multi-select-option')).filter((option) => option.classList.contains('multi-select-selected'));
                        arrays.forEach((itemOption) => {
                            const currentOption = headerElement.querySelector(`[data-value="${itemOption.dataset.value}"]`);
                            if (currentOption) return;
                            if (multiColumn && columns.length > 0) {
                                const display = columns
                                    .map((col) =>
                                        typeof col === 'string'
                                            ? itemOption.querySelector(`.multi-select-option-col-${col}`)?.innerText || ''
                                            : itemOption.querySelector(`.multi-select-option-col-${col.key}`)?.innerText || ''
                                    )
                                    .join(' | ');
                                headerElement.insertAdjacentHTML(
                                    'afterbegin',
                                    `<span class="multi-select-header-option" data-value="${itemOption.dataset.value}">${display}</span>`
                                );
                            } else {
                                // Insert single column option
                                headerElement.insertAdjacentHTML(
                                    'afterbegin',
                                    `<span class="multi-select-header-option" data-value="${itemOption.dataset.value}">${
                                        itemOption.querySelector('.multi-select-option-text').innerHTML
                                    }</span>`
                                );
                            }
                        });
                        this._updateHeaderSummaryByWidth(headerElement);
                    }
                }
                // If not listing all, show summary
                if (this.options.listAll === false || this.options.listAll === 'false') {
                    if (this.element.querySelector('.multi-select-header-option')) {
                        this.element.querySelector('.multi-select-header-option').remove();
                    }
                    headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option">${this.selectedValues.length} selected</span>`);
                }
                // Update placeholder and summary
                if (!this.element.querySelector('.multi-select-header-option')) {
                    if (this.element.querySelector('.multi-select-header-more')) {
                        this.element.querySelector('.multi-select-header-more').remove();
                    }
                    if (this.selectedValues.length > 0) {
                        headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-more">${this.selectedValues.length} selected</span>`);
                    } else {
                        headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-placeholder">${this.placeholder}</span>`);
                    }
                } else if (this.element.querySelector('.multi-select-header-placeholder')) {
                    this.element.querySelector('.multi-select-header-placeholder').remove();
                }
                // Update max counter
                if (this.options.max) {
                    this.element.querySelector('.multi-select-header-max').innerHTML = this.selectedValues.length + '/' + this.options.max;
                }
                // Reset search input
                if (this.options.search === true || this.options.search === 'true') {
                    this.element.querySelector('.multi-select-search').value = '';
                }
                // Show all options
                this.element.querySelectorAll('.multi-select-option').forEach((option) => (option.style.display = 'flex'));
                // Close dropdown if needed
                if (this.options.closeListOnItemSelect === true || this.options.closeListOnItemSelect === 'true') {
                    headerElement.classList.remove('multi-select-header-active');
                }
                // Fire callbacks
                const dataItem = this.data.find((data) => data.value == option.dataset.value);
                let displayText = '';
                if (multiColumn && columns.length > 0) {
                    displayText = columns.map((col) => (typeof col === 'string' ? dataItem[col] : dataItem[col.key])).join(' | ');
                } else {
                    displayText = option.querySelector('.multi-select-option-text').innerHTML;
                }
                this.options.onChange(option.dataset.value, displayText, option);
                if (selected) {
                    this.options.onSelect(option.dataset.value, displayText, option);
                } else {
                    this.options.onUnselect(option.dataset.value, displayText, option);
                }
            };
        });

        // Toggle dropdown on header click
        headerElement.onclick = () => {
            if (this._isDisabled) return;
            headerElement.classList.toggle('multi-select-header-active');
        };

        // Search filter
        if (this.options.search === true || this.options.search === 'true') {
            let search = this.element.querySelector('.multi-select-search');
            search.oninput = () => {
                this.element.querySelectorAll('.multi-select-option').forEach((option) => {
                    let text = '';
                    if (multiColumn && columns.length > 0) {
                        text = columns
                            .map((col) =>
                                typeof col === 'string'
                                    ? option.querySelector(`.multi-select-option-col-${col}`)?.innerText || ''
                                    : option.querySelector(`.multi-select-option-col-${col.key}`)?.innerText || ''
                            )
                            .join(' ');
                    } else {
                        text = option.querySelector('.multi-select-option-text').innerHTML;
                    }
                    option.style.display = text.toLowerCase().indexOf(search.value.trim().toLowerCase()) > -1 ? 'flex' : 'none';
                });
            };
        }

        // Select all handler
        if (this.options.selectAll === true || this.options.selectAll === 'true') {
            let selectAllButton = this.element.querySelector('.multi-select-all');
            selectAllButton.onclick = () => {
                if (this._isDisabled) return;
                let allSelected = selectAllButton.classList.contains('multi-select-selected');
                this.element.querySelectorAll('.multi-select-option').forEach((option) => {
                    let dataItem = this.data.find((data) => data.value == option.dataset.value);
                    if (dataItem && ((allSelected && dataItem.selected) || (!allSelected && !dataItem.selected))) {
                        option.click();
                    }
                });

                // Update select all button state
                if (allSelected) {
                    this.options.onUnselectAll(this.selectedValues, this.selectedItems);
                } else {
                    this.options.onSelectAll(this.selectedValues, this.selectedItems);
                }

                if (this.options.max && this.selectedValues.length === this.options.max) {
                    if (this.options.selectAll === true || this.options.selectAll === 'true') {
                        selectAllButton.classList.add('multi-select-selected');
                        return;
                    }
                } else if (this.selectedValues.length !== this.options.data.length) {
                    if (this.options.selectAll === true || this.options.selectAll === 'true') {
                        selectAllButton.classList.remove('multi-select-selected');
                    }
                } else if (this.selectedValues.length === this.options.data.length) {
                    if (this.options.selectAll === true || this.options.selectAll === 'true') {
                        selectAllButton.classList.add('multi-select-selected');
                    }
                }
            };
        }

        // Support label click to open dropdown
        if (this.selectElement.id && document.querySelector('label[for="' + this.selectElement.id + '"]')) {
            document.querySelector('label[for="' + this.selectElement.id + '"]').onclick = () => {
                if (this._isDisabled) return;
                headerElement.classList.toggle('multi-select-header-active');
            };
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            // Use a fallback class if this.name is empty
            const selector = this.name ? '.' + this.name : '.multi-select';
            if (!event.target.closest(selector) && !(this.selectElement.id && event.target.closest('label[for="' + this.selectElement.id + '"]'))) {
                headerElement.classList.remove('multi-select-header-active');
            }
        });
    }

    /**
     * Check the total width of all selected options in the header.
     * If the total width exceeds the visible header width (excluding padding and border),
     * remove all option tags and show a summary instead.
     * @param {HTMLElement} headerElement
     */
    _updateHeaderSummaryByWidth(headerElement) {
        // Remove old summary if exists
        if (headerElement.querySelector('.multi-select-header-more')) {
            headerElement.querySelector('.multi-select-header-more').remove();
        }
        // Calculate the visible width of the header (excluding padding and border)
        const style = window.getComputedStyle(headerElement);
        const headerWidth =
            headerElement.offsetWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);

        // Calculate the total width of all selected option tags
        const headerOptions = headerElement.querySelectorAll('.multi-select-header-option');
        let totalWidth = 0;
        const columnGap = 7; // The gap between each option tag
        headerOptions.forEach((opt) => (totalWidth += columnGap + opt.offsetWidth));

        // If total width exceeds header width (with a small margin), show summary instead
        if (totalWidth > headerWidth - 20) {
            headerOptions.forEach((opt) => opt.remove());
            headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-more">${this.selectedValues.length} selected</span>`);
        }
    }

    /**
     * Update the selected items in the UI
     */
    _updateSelected() {
        const header = this.element.querySelector('.multi-select-header');
        if (this.options.listAll === true || this.options.listAll === 'true') {
            this.element.querySelectorAll('.multi-select-option').forEach((option) => {
                if (option.classList.contains('multi-select-selected')) {
                    let display = '';
                    if (this.options.multiColumn && this.options.columns.length > 0) {
                        display = this.options.columns
                            .map((col) =>
                                typeof col === 'string'
                                    ? option.querySelector(`.multi-select-option-col-${col}`)?.innerText || ''
                                    : option.querySelector(`.multi-select-option-col-${col.key}`)?.innerText || ''
                            )
                            .join(' | ');
                    } else {
                        display = option.querySelector('.multi-select-option-text') ? option.querySelector('.multi-select-option-text').innerHTML : '';
                    }
                    header.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option" data-value="${option.dataset.value}">${display}</span>`);
                }
            });
            this._updateHeaderSummaryByWidth(header);
        }
        if (header.querySelector('.multi-select-header-option') || header.querySelector('.multi-select-header-more')) {
            if (header.querySelector('.multi-select-header-placeholder')) {
                header.querySelector('.multi-select-header-placeholder').remove();
            }
        }

        let selectAllButton = this.element.querySelector('.multi-select-all');
        if (this.options.max && this.selectedValues.length === this.options.max) {
            if (this.options.selectAll === true || this.options.selectAll === 'true') {
                selectAllButton.classList.add('multi-select-selected');
                return;
            }
        } else if (this.selectedValues.length !== this.options.data.length) {
            if (this.options.selectAll === true || this.options.selectAll === 'true') {
                selectAllButton.classList.remove('multi-select-selected');
            }
        } else if (this.selectedValues.length === this.options.data.length) {
            if (this.options.selectAll === true || this.options.selectAll === 'true') {
                selectAllButton.classList.add('multi-select-selected');
            }
        }
    }

    /**
     * Update options and re-render the component
     * @param {Object} newOptions - New options to merge
     */
    _updateOptions(newOptions = {}) {
        // Validate newOptions
        if (typeof newOptions !== 'object') {
            console.error('Invalid options provided. Expected an object.');
            return;
        }

        // Save previous selected values
        const prevSelected = this.selectedValues ? [...this.selectedValues] : [];

        // Merge options
        this.options = Object.assign(this.options, newOptions);

        // Validate and update data
        if (Array.isArray(newOptions.data)) {
            this.data = newOptions.data.map((item) => {
                if (!item.value || !item.text) {
                    console.warn('Invalid data item:', item);
                    return { value: '', text: '', selected: false };
                }
                return {
                    ...item,
                    selected: prevSelected.includes(item.value),
                };
            });
        } else if (newOptions.data !== undefined && !Array.isArray(newOptions.data)) {
            console.error('Invalid data provided. Expected an array.');
            return; // Dừng việc cập nhật nếu dữ liệu không hợp lệ
        }

        // Re-render only the options (optimize rendering)
        const optionsContainer = this.element.querySelector('.multi-select-options');
        if (optionsContainer) {
            optionsContainer.innerHTML = this._template().querySelector('.multi-select-options').innerHTML;
        }

        // Update selected items in the UI
        this._updateSelected();

        // Re-attach event handlers
        this._eventHandlers();

        this._checkState();
    }

    /**
     * (Unused) Disable options if max selected
     */
    _disableOptions() {
        this.element.querySelectorAll('.multi-select-option').forEach((option) => {
            // Optionally add logic to disable options when max is reached
        });
    }

    /**
     * Clear all selected options
     */
    _clearSelected() {
        let selected = this.element.querySelectorAll('.multi-select-selected:not(.multi-select-all)');
        if (selected) {
            selected.forEach((option) => {
                option.click();
            });
        }
    }

    /**
     * Disable the component (UI only)
     */
    _disable() {
        this._isDisabled = true;
        const header = this.element.querySelector('.multi-select-header');
        if (header.classList.contains('option-disabled')) return;
        header.classList.add('option-disabled');

        // Disable all options and select all
        this.element.querySelectorAll('.multi-select-option, .multi-select-all').forEach((opt) => {
            opt.classList.add('option-disabled');
            opt.style.pointerEvents = 'none';
        });

        // Disable search input if exists
        const search = this.element.querySelector('.multi-select-search');
        if (search) search.disabled = true;
    }

    /**
     * Enable the component (UI only)
     */
    _enable() {
        this._isDisabled = false;
        const header = this.element.querySelector('.multi-select-header');
        if (!header.classList.contains('option-disabled')) return;
        header.classList.remove('option-disabled');

        // Enable all options and select all
        this.element.querySelectorAll('.multi-select-option, .multi-select-all').forEach((opt) => {
            opt.classList.remove('option-disabled');
            opt.style.pointerEvents = '';
        });

        // Enable search input if exists
        const search = this.element.querySelector('.multi-select-search');
        if (search) search.disabled = false;
    }

    /**
     * Check the current state for debugging
     */
    _checkState() {
        console.log('Current options:', this.options);
        console.log('Current data:', this.data);
        console.log('Selected values:', this.selectedValues);
    }

    //#region Getters and Setters for properties
    get selectedValues() {
        return this.data.filter((data) => data.selected).map((data) => data.value);
    }

    get selectedItems() {
        return this.data.filter((data) => data.selected);
    }

    set data(value) {
        this.options.data = value;
    }

    get data() {
        return this.options.data;
    }

    set selectElement(value) {
        this.options.selectElement = value;
    }

    get selectElement() {
        return this.options.selectElement;
    }

    set element(value) {
        this.options.element = value;
    }

    get element() {
        return this.options.element;
    }

    set placeholder(value) {
        this.options.placeholder = value;
    }

    get placeholder() {
        return this.options.placeholder;
    }

    set name(value) {
        this.options.name = value;
    }

    get name() {
        return this.options.name;
    }

    set width(value) {
        this.options.width = value;
    }

    get width() {
        return this.options.width;
    }

    set height(value) {
        this.options.height = value;
    }

    get height() {
        return this.options.height;
    }
    //#endregion
}

// Initialize MultiSelect for all elements with [data-multi-select] attribute
document.querySelectorAll('[data-multi-select]').forEach((select, index) => {
    multipleSelectionElements[select.id] = {
        multipleSelection: new MultiSelect(select, {}),
    };
});
