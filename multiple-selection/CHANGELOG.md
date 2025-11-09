# CHANGELOG

## Quy tắc cập nhật (Update Rules)

-   Sử dụng [Semantic Versioning (SemVer)](https://semver.org/lang/vi/) với định dạng **X.Y.Z**:

    -   **X (Major):** Thay đổi lớn, phá vỡ tương thích ngược (breaking changes).
    -   **Y (Minor):** Thêm tính năng mới, không phá vỡ tương thích ngược.
    -   **Z (Patch):** Sửa lỗi, tối ưu nhỏ, không thay đổi API.

-   Mỗi lần cập nhật phải ghi rõ thay đổi vào file CHANGELOG này, phân loại theo Added/Changed/Removed/Fix nếu cần.

-   Khi thay đổi cấu trúc options hoặc API, phải tăng major version và ghi chú rõ ràng.

-   Khi thêm tính năng mới, tăng minor version.

-   Khi sửa lỗi hoặc tối ưu nhỏ, tăng patch version.

---

## [1.0.0] - 2025-06-21

### Added

-   Khởi tạo thư viện MultiSelect cho JavaScript thuần (vanilla JS).
-   Hỗ trợ hiển thị dạng single column (1 cột) với cấu hình đơn giản.
-   Hỗ trợ hiển thị multi-column (nhiều cột) với cấu hình `columns` (có thể truyền key hoặc object `{ key, label }`).
-   Tùy chọn: placeholder, max, search, selectAll, listAll, closeListOnItemSelect, name, width, height, dropdownWidth, dropdownHeight.
-   Callback: `onChange`, `onSelect`, `onUnselect`.
-   Tự động render lại khi gọi `_updateOptions`.
-   Hỗ trợ CSS cơ bản cho multi-column.

### Changed

-   Update lỗi hiển thị option đã chọn với hiển thị multi-column với cấu hình `columns`.

### Removed

-   Không có (phiên bản đầu tiên).

**Author:** Vince  
**Email:** phuochuy1328@email.com

## [1.1.0] - 2025-09-11 (**Y (Minor):**, **Z (Patch):**)

### Added

-   Điều chỉnh kích thước và vị trí của biểu tượng radio cho phù hợp hơn.
-   Cập nhật chiều cao và bo góc của ô input khi hiển thị multiple.
-   Bổ sung callback mới: onSelectAll, onUnselectAll.
-   Thêm phương thức _checkState để kiểm tra trạng thái của component (bao gồm: options {}, data [{}], selectedValues []).

### Changed

-   Constructor & Template:
    +   Cho phép đọc các thuộc tính khởi tạo từ HTML attributes [data-*] của phần tử [data-multi-select].
Hỗ trợ các cấu hình:
    [name] = text
    [data-placeholder] = text
    [data-max] = null | number
    [data-search] = boolean
    [data-select-all] = boolean
    [data-list-all] = boolean
    [data-close-select] = boolean
    [data-width] = null | number
    [data-height] = null | number
    [data-dropdown-width] = null | number
    [data-dropdown-height] = null | number
    [data-multicolumn] = boolean

-   Event Handlers:
    +   Cập nhật logic trong _eventHandlers để đồng bộ thêm xử lý cho onSelectAll và onUnselectAll.

-   Behavior Update (max = 1):
    +   Khi max được đặt là 1, việc chọn một option mới sẽ tự động bỏ chọn option cũ và chọn option mới thay thế, thay vì chặn thao tác chọn thêm.
    +   Nếu click lại vào cùng option đang được chọn, option đó sẽ bị bỏ chọn.
    +   Với các trường hợp max > 1, hành vi cũ được giữ nguyên — đạt giới hạn thì không cho chọn thêm.

### Removed

<!-- Chưa có -->

**Author:** Vince  
**Email:** phuochuy1328@email.com
