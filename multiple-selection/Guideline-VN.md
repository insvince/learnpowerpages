# Hướng dẫn sử dụng thư viện MultiSelect

## 1. Giới thiệu

-   MultiSelect là thư viện JavaScript thuần (vanilla JS) giúp tạo dropdown chọn nhiều giá trị, hỗ trợ cả dạng 1 cột và nhiều cột (multi-column), dễ dàng tùy biến và mở rộng.

---

## 2. Cài đặt & Sử dụng

### 2.1. Thêm file JS và CSS vào dự án

```html
<link rel="stylesheet" href="multi-select.css" />
<script src="MultiSelect.js"></script>
<script>
    const options = {
        placeholder: 'Chọn mục',
        data: [
            { value: '1', text: 'Tùy chọn 1' },
            { value: '2', text: 'Tùy chọn 2' },
        ],
        // Các option khác...
    };
    new MultiSelect('#your-element', options);
</script>
```

## 3. Cấu hình (Options)

| Tên option                    | Kiểu dữ liệu | Mặc định | Mô tả                                                      |
| ----------------------------- | ------------ | -------- | ---------------------------------------------------------- |
| placeholder                   | string       | ''       | Placeholder cho dropdown                                   |
| max                           | number/null  | null     | Số lượng tối đa có thể chọn                                |
| search                        | boolean      | true     | Hiển thị ô tìm kiếm trong dropdown                         |
| selectAll                     | boolean      | true     | Hiển thị nút "Chọn tất cả"                                 |
| listAll                       | boolean      | true     | Hiển thị tất cả lựa chọn đã chọn trên header               |
| closeListOnItemSelect         | boolean      | false    | Đóng dropdown sau khi chọn một mục                         |
| name                          | string       | ''       | Thuộc tính name cho input ẩn                               |
| width, height                 | string       | ''       | Chiều rộng, chiều cao dropdown                             |
| dropdownWidth, dropdownHeight | string       | ''       | Kích thước phần dropdown                                   |
| data                          | array        | []       | Mảng các object lựa chọn                                   |
| multiColumn                   | boolean      | false    | Bật chế độ nhiều cột                                       |
| columns                       | array        | []       | Định nghĩa các cột (mảng key hoặc object `{ key, label }`) |
| onChange                      | function     | () => {} | Callback khi thay đổi lựa chọn                             |
| onSelect                      | function     | () => {} | Callback khi chọn một mục                                  |
| onUnselect                    | function     | () => {} | Callback khi bỏ chọn một mục                               |

## 4. Ví dụ dữ liệu

### 4.1. Dạng 1 cột

```javascript
data: [
    { value: '1', text: 'Tùy chọn 1' },
    { value: '2', text: 'Tùy chọn 2' },
];
```

### 4.2. Dạng nhiều cột

```javascript
data: [
    { value: '1', kho: 'BUT-DUM001', site: 'BUT' },
    { value: '2', kho: 'BUT-TRN', site: 'BUT' }
],
multiColumn: true,
columns: [
    { key: 'kho', label: 'Kho' },
    { key: 'site', label: 'Site' }
]
```

## 5. Cập nhật options động

-   Sử dụng hàm `_updateOptions` để cập nhật lại cấu hình hoặc dữ liệu:

```javascript
instance._updateOptions({
    placeholder: 'Chọn lại',
    data: [
        /* ... */
    ],
});
```

---

**Chúc bạn sử dụng thư viện hiệu quả!**
