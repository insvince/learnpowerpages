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
