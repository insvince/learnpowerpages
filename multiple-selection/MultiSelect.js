/*
 * Core created by David Adams
 * Extended by Vince
 * Released under the MIT license
 */

// Store all MultiSelect instances by element id
const multipleSelectionElements = {};

class MultiSelect {
    /**
     * Initialize the MultiSelect component
     * @param {HTMLElement|string} element - The select element or selector
     * @param {Object} options - Configuration options
     */
    constructor(element, options = {}) {
        // Default options for the component
        let defaults = {
            placeholder: 'Select item(s)',
            max: null, // Maximum number of selections allowed
            search: true, // Enable search input
            selectAll: true, // Enable select all option
            listAll: true, // Show all selected items in header
            closeListOnItemSelect: false, // Close dropdown on item select
            name: '',
            width: '',
            height: '',
            dropdownWidth: '',
            dropdownHeight: '',
            data: [], // Data for options
            onChange: function () {},
            onSelect: function () {},
            onUnselect: function () {},
        };
        // Merge user options with defaults
        this.options = Object.assign(defaults, options);

        // Get the select element (by selector or direct reference)
        this.selectElement = typeof element === 'string' ? document.querySelector(element) : element;

        // Allow data-* attributes on the select element to override options
        for (const prop in this.selectElement.dataset) {
            if (this.options[prop] !== undefined) {
                this.options[prop] = this.selectElement.dataset[prop];
            }
        }

        // Set the name for the component (from attribute or generate unique)
        this.name = this.selectElement.getAttribute('name')
            ? this.selectElement.getAttribute('name')
            : 'multi-select-' + Math.floor(Math.random() * 1000000);

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

        // Build and replace the original select element with the custom component
        this.element = this._template();
        this.selectElement.replaceWith(this.element);

        // Update selected items in the UI
        this._updateSelected();

        // Attach event handlers for interaction
        this._eventHandlers();
    }

    /**
     * Build the HTML template for the custom multi-select component
     * @returns {HTMLElement}
     */
    _template() {
        let optionsHTML = '';
        // Build each option
        for (let i = 0; i < this.data.length; i++) {
            optionsHTML += `
                <div class="multi-select-option${
                    this.selectedValues.includes(this.data[i].value) ? ' multi-select-selected' : ''
                }" data-value="${this.data[i].value}">
                    <span class="multi-select-option-radio"></span>
                    <span class="multi-select-option-text">${this.data[i].html ? this.data[i].html : this.data[i].text}</span>
                </div>
            `;
        }
        // Build select all option if enabled
        let selectAllHTML = '';
        if (this.options.selectAll === true || this.options.selectAll === 'true') {
            selectAllHTML = `<div class="multi-select-all">
                <span class="multi-select-option-radio"></span>
                <span class="multi-select-option-text">Select all</span>
            </div>`;
        }
        // Build the main template
        let template = `
            <div class="multi-select ${this.name}"${this.selectElement.id ? ' id="' + this.selectElement.id + '"' : ''} style="${
            this.width ? 'width:' + this.width + ';' : ''
        }${this.height ? 'height:' + this.height + ';' : ''}">
                ${this.selectedValues.map((value) => `<input type="hidden" name="${this.name}[]" value="${value}">`).join('')}
                <div class="multi-select-header" style="${this.width ? 'width:' + this.width + ';' : ''}${
            this.height ? 'height:' + this.height + ';' : ''
        }">
                    <span class="multi-select-header-placeholder">${this.placeholder}</span>
                    <span class="multi-select-header-max">${
                        this.options.max ? this.selectedValues.length + '/' + this.options.max : ''
                    }</span>
                </div>
                <div class="multi-select-options" style="${this.options.dropdownWidth ? 'width:' + this.options.dropdownWidth + ';' : ''}${
            this.options.dropdownHeight ? 'height:' + this.options.dropdownHeight + ';' : ''
        }">
                    ${
                        this.options.search === true || this.options.search === 'true'
                            ? '<input type="text" class="multi-select-search" placeholder="Search...">'
                            : ''
                    }
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
        let headerElement = this.element.querySelector('.multi-select-header');
        // Handle option click (select/unselect)
        this.element.querySelectorAll('.multi-select-option').forEach((option) => {
            option.onclick = () => {
                let selected = true;
                if (!option.classList.contains('multi-select-selected')) {
                    // Select option
                    if (this.options.max && this.selectedValues.length >= this.options.max) {
                        return;
                    }
                    this.element
                        .querySelector('.multi-select')
                        .insertAdjacentHTML('afterbegin', `<input type="hidden" name="${this.name}[]" value="${option.dataset.value}">`);
                    this.data.filter((data) => data.value == option.dataset.value)[0].selected = true;

                    option.classList.add('multi-select-selected');
                    // Show selected items in header if enabled
                    if (this.options.listAll === true || this.options.listAll === 'true') {
                        if (this.element.querySelector('.multi-select-header-option')) {
                            let opt = Array.from(this.element.querySelectorAll('.multi-select-header-option')).pop();
                            opt.insertAdjacentHTML(
                                'afterend',
                                `<span class="multi-select-header-option" data-value="${option.dataset.value}">${
                                    option.querySelector('.multi-select-option-text').innerHTML
                                }</span>`
                            );
                        } else {
                            headerElement.insertAdjacentHTML(
                                'afterbegin',
                                `<span class="multi-select-header-option" data-value="${option.dataset.value}">${
                                    option.querySelector('.multi-select-option-text').innerHTML
                                }</span>`
                            );
                        }

                        // If more than 3 selected, show summary
                        if (this.selectedValues.length > 3) {
                            if (this.element.querySelector('.multi-select-header-option')) {
                                this.element.querySelectorAll('.multi-select-header-option').forEach((option) => {
                                    option.remove();
                                });
                            }
                            if (this.element.querySelector('.multi-select-header-more')) {
                                this.element.querySelector('.multi-select-header-more').remove();
                            }
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
                    this.element
                        .querySelectorAll('.multi-select-header-option')
                        .forEach((headerOption) => (headerOption.dataset.value == option.dataset.value ? headerOption.remove() : ''));
                    this.element.querySelector(`input[value="${option.dataset.value}"]`).remove();
                    this.data.filter((data) => data.value == option.dataset.value)[0].selected = false;
                    selected = false;

                    // Update select all state
                    let selectAllButton = this.element.querySelector('.multi-select-all');
                    if (this.selectedValues.length !== this.options.data.length) {
                        if (this.options.selectAll === true || this.options.selectAll === 'true') {
                            selectAllButton.classList.remove('multi-select-selected');
                        }
                    }

                    // If less than 4 selected, show all selected in header
                    if (this.selectedValues.length < 4) {
                        if (this.element.querySelector('.multi-select-header-more')) {
                            this.element.querySelector('.multi-select-header-more').remove();
                        }
                        if (this.options.listAll === true || this.options.listAll === 'true') {
                            const arrays = Array.from(this.element.querySelectorAll('.multi-select-option')).filter((option) =>
                                option.classList.contains('multi-select-selected')
                            );
                            arrays.forEach((itemOption) => {
                                const currentOption = this.element
                                    .querySelector('.multi-select-header')
                                    .querySelector(`[data-value="${itemOption.dataset.value}"]`);
                                if (currentOption) return;
                                this.element
                                    .querySelector('.multi-select-header')
                                    .insertAdjacentHTML(
                                        'afterbegin',
                                        `<span class="multi-select-header-option" data-value="${itemOption.dataset.value}">${
                                            itemOption.querySelector('.multi-select-option-text').innerHTML
                                        }</span>`
                                    );
                            });
                        }
                    }
                }
                // If not listing all, show summary
                if (this.options.listAll === false || this.options.listAll === 'false') {
                    if (this.element.querySelector('.multi-select-header-option')) {
                        this.element.querySelector('.multi-select-header-option').remove();
                    }
                    headerElement.insertAdjacentHTML(
                        'afterbegin',
                        `<span class="multi-select-header-option">${this.selectedValues.length} selected</span>`
                    );
                }
                // Update placeholder and summary
                if (!this.element.querySelector('.multi-select-header-option')) {
                    if (this.element.querySelector('.multi-select-header-more')) {
                        this.element.querySelector('.multi-select-header-more').remove();
                    }
                    if (this.selectedValues.length > 0) {
                        headerElement.insertAdjacentHTML(
                            'afterbegin',
                            `<span class="multi-select-header-more">${this.selectedValues.length} selected</span>`
                        );
                    } else {
                        headerElement.insertAdjacentHTML(
                            'afterbegin',
                            `<span class="multi-select-header-placeholder">${this.placeholder}</span>`
                        );
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
                this.options.onChange(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                if (selected) {
                    this.options.onSelect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                } else {
                    this.options.onUnselect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                }
            };
        });
        // Toggle dropdown on header click
        headerElement.onclick = () => headerElement.classList.toggle('multi-select-header-active');
        // Search filter
        if (this.options.search === true || this.options.search === 'true') {
            let search = this.element.querySelector('.multi-select-search');
            search.oninput = () => {
                this.element.querySelectorAll('.multi-select-option').forEach((option) => {
                    option.style.display =
                        option.querySelector('.multi-select-option-text').innerHTML.toLowerCase().indexOf(search.value.toLowerCase()) > -1
                            ? 'flex'
                            : 'none';
                });
            };
        }
        // Select all handler
        if (this.options.selectAll === true || this.options.selectAll === 'true') {
            let selectAllButton = this.element.querySelector('.multi-select-all');
            selectAllButton.onclick = () => {
                let allSelected = selectAllButton.classList.contains('multi-select-selected');
                this.element.querySelectorAll('.multi-select-option').forEach((option) => {
                    let dataItem = this.data.find((data) => data.value == option.dataset.value);
                    if (dataItem && ((allSelected && dataItem.selected) || (!allSelected && !dataItem.selected))) {
                        option.click();
                    }
                });

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
                headerElement.classList.toggle('multi-select-header-active');
            };
        }
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.' + this.name) && !event.target.closest('label[for="' + this.selectElement.id + '"]')) {
                headerElement.classList.remove('multi-select-header-active');
            }
        });
    }

    /**
     * Update the selected items in the UI
     */
    _updateSelected() {
        if (this.options.listAll === true || this.options.listAll === 'true') {
            this.element.querySelectorAll('.multi-select-option').forEach((option) => {
                if (option.classList.contains('multi-select-selected')) {
                    this.element
                        .querySelector('.multi-select-header')
                        .insertAdjacentHTML(
                            'afterbegin',
                            `<span class="multi-select-header-option" data-value="${option.dataset.value}">${
                                option.querySelector('.multi-select-option-text').innerHTML
                            }</span>`
                        );
                }
            });

            if (this.selectedValues.length > 3) {
                this.element
                    .querySelector('.multi-select-header')
                    .insertAdjacentHTML(
                        'afterbegin',
                        `<span class="multi-select-header-option">${this.selectedValues.length} selected</span>`
                    );
            }
        } else {
            if (this.selectedValues.length > 0) {
                this.element
                    .querySelector('.multi-select-header')
                    .insertAdjacentHTML(
                        'afterbegin',
                        `<span class="multi-select-header-option">${this.selectedValues.length} selected</span>`
                    );
            }
        }
        if (this.element.querySelector('.multi-select-header-option')) {
            this.element.querySelector('.multi-select-header-placeholder').remove();
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
        this.options = Object.assign(this.options, newOptions);
        // If new data is provided, update the internal data
        if (newOptions.data) {
            this.data = newOptions.data;
        }
        // Clear and rebuild the component
        this.element.innerHTML = '';
        const newElement = this._template();
        this.element.replaceWith(newElement);
        this.element = newElement;
        this._updateSelected();
        this._eventHandlers();
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
        const header = this.element.querySelector('.multi-select-header');
        const isDisable = header.classList.contains('temp-disable');
        if (isDisable) return;
        header.classList.add('temp-disable');
    }

    /**
     * Enable the component (UI only)
     */
    _enable() {
        const header = this.element.querySelector('.multi-select-header');
        const isDisable = header.classList.contains('temp-disable');
        if (!isDisable) return;
        if (isDisable) header.classList.remove('temp-disable');
    }

    // --- Getters and Setters for properties ---

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
}

// Initialize MultiSelect for all elements with [data-multi-select] attribute
document.querySelectorAll('[data-multi-select]').forEach((select, index) => {
    multipleSelectionElements[select.id] = {
        id: index,
        element: select,
        multipleSelection: new MultiSelect(select, {}),
    };
});
