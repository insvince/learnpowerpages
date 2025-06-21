# MultiSelect Library Guideline

## 1. Introduction

-   MultiSelect is a pure JavaScript (vanilla JS) library for creating multi-select dropdowns, supporting both single-column and multi-column display, easy to customize and extend.

---

## 2. Installation & Usage

### 2.1. Include JS and CSS files in your project

```html
<link rel="stylesheet" href="multi-select.css" />
<script src="MultiSelect.js"></script>
<script>
    const options = {
        placeholder: 'Select item(s)',
        data: [
            { value: '1', text: 'Option 1' },
            { value: '2', text: 'Option 2' },
        ],
        // Other options...
    };
    new MultiSelect('#your-element', options);
</script>
```

---

## 3. Options Configuration

| Option Name                   | Type        | Default  | Description                                                |
| ----------------------------- | ----------- | -------- | ---------------------------------------------------------- |
| placeholder                   | string      | ''       | Placeholder text for the dropdown                          |
| max                           | number/null | null     | Maximum number of selectable items                         |
| search                        | boolean     | true     | Show search box in dropdown                                |
| selectAll                     | boolean     | true     | Show "Select all" option                                   |
| listAll                       | boolean     | true     | Show all selected items in the header                      |
| closeListOnItemSelect         | boolean     | false    | Close dropdown after selecting an item                     |
| name                          | string      | ''       | Name attribute for hidden input fields                     |
| width, height                 | string      | ''       | Width and height of the dropdown                           |
| dropdownWidth, dropdownHeight | string      | ''       | Width and height of the dropdown list                      |
| data                          | array       | []       | Array of option objects                                    |
| multiColumn                   | boolean     | false    | Enable multi-column display                                |
| columns                       | array       | []       | Define columns (array of keys or objects `{ key, label }`) |
| onChange                      | function    | () => {} | Callback when selection changes                            |
| onSelect                      | function    | () => {} | Callback when an item is selected                          |
| onUnselect                    | function    | () => {} | Callback when an item is unselected                        |

---

## 4. Data Examples

### 4.1. Single column

```javascript
data: [
    { value: '1', text: 'Option 1' },
    { value: '2', text: 'Option 2' },
];
```

### 4.2. Multi column

```javascript
data: [
    { value: '1', warehouse: 'BUT-DUM001', site: 'BUT' },
    { value: '2', warehouse: 'BUT-TRN', site: 'BUT' }
],
multiColumn: true,
columns: [
    { key: 'warehouse', label: 'Warehouse' },
    { key: 'site', label: 'Site' }
]
```

---

## 5. Dynamic Options Update

Use the `_updateOptions` method to update configuration or data:

```javascript
instance._updateOptions({
    placeholder: 'Select again',
    data: [
        /* ... */
    ],
});
```

---

**Enjoy using the!**
