# Requirements Document

## Introduction

Hệ thống frontend quản lý bán vật liệu xây dựng (tôn, sắt, thép) dành cho nội bộ gia đình sử dụng. Được xây dựng trên Vite + React 19 + TypeScript, giao tiếp với backend Spring Boot REST API qua Axios. Giao diện sử dụng Ant Design với chữ to, bố cục đơn giản, dễ thao tác cho người lớn tuổi. Hệ thống bao gồm 7 màn hình chính: Dashboard, Danh mục, Sản phẩm, Khách hàng, Đơn hàng, Công nợ và Thanh toán.

## Glossary

- **App**: Ứng dụng frontend React quản lý bán vật liệu xây dựng
- **API**: Backend REST API Spring Boot tại `http://localhost:8080`
- **ApiResponse**: Định dạng response thống nhất từ backend: `{ success: boolean, data: T, message: string, timestamp: string }`
- **Category**: Danh mục mặt hàng (ví dụ: Tôn, Sắt, Thép)
- **Product**: Sản phẩm cụ thể thuộc một danh mục, có tên, đơn vị tính và giá bán
- **Customer**: Khách hàng mua hàng, có thể phát sinh công nợ
- **Order**: Đơn hàng ghi nhận giao dịch bán hàng
- **OrderItem**: Dòng chi tiết trong đơn hàng (sản phẩm, số lượng, đơn giá)
- **Debt**: Công nợ còn lại của khách hàng chưa thanh toán
- **Payment**: Giao dịch thanh toán của khách hàng
- **TanStack Query**: Thư viện quản lý server state, cache và đồng bộ dữ liệu từ API
- **Display Code**: Mã hiển thị tự sinh từ backend (ví dụ: `KH0000001`, `HD0000001`)

---

## Requirements

### Requirement 1: Cấu trúc ứng dụng và điều hướng

**User Story:** As a người dùng, I want to điều hướng giữa các màn hình dễ dàng, so that tôi có thể truy cập nhanh vào bất kỳ chức năng nào.

#### Acceptance Criteria

1. THE App SHALL hiển thị sidebar navigation cố định với các mục: Dashboard, Danh mục, Sản phẩm, Khách hàng, Đơn hàng, Công nợ, Thanh toán.
2. THE App SHALL sử dụng React Router v7 để điều hướng giữa các màn hình mà không reload trang.
3. THE App SHALL highlight mục navigation đang active tương ứng với route hiện tại.
4. THE App SHALL sử dụng font size tối thiểu 16px cho toàn bộ giao diện để dễ đọc.
5. WHEN người dùng truy cập route không tồn tại, THE App SHALL chuyển hướng về trang Dashboard.
6. THE App SHALL hiển thị layout với sidebar bên trái và content area bên phải trên màn hình desktop.

---

### Requirement 2: Xử lý API và trạng thái tải dữ liệu

**User Story:** As a người dùng, I want to thấy phản hồi rõ ràng khi hệ thống đang tải hoặc có lỗi, so that tôi biết ứng dụng đang hoạt động bình thường.

#### Acceptance Criteria

1. THE App SHALL sử dụng Axios với base URL `http://localhost:8080` để gọi tất cả API.
2. THE App SHALL sử dụng TanStack Query để quản lý server state, cache và tự động refetch.
3. WHEN một API request đang xử lý, THE App SHALL hiển thị loading indicator (spinner hoặc skeleton) trên vùng dữ liệu tương ứng.
4. WHEN một API request thất bại, THE App SHALL hiển thị thông báo lỗi rõ ràng lấy từ trường `message` trong ApiResponse.
5. WHEN một thao tác tạo/sửa/xóa thành công, THE App SHALL hiển thị thông báo thành công (Ant Design notification) và tự động làm mới dữ liệu liên quan.
6. THE App SHALL unwrap dữ liệu từ trường `data` trong ApiResponse trước khi truyền vào component.
7. IF backend trả về `success: false`, THEN THE App SHALL xử lý như lỗi và hiển thị `message` từ response.

---

### Requirement 3: Màn hình Dashboard

**User Story:** As a chủ cửa hàng, I want to xem tổng quan tình hình kinh doanh ngay khi mở ứng dụng, so that tôi nắm được doanh thu và công nợ hiện tại.

#### Acceptance Criteria

1. THE App SHALL hiển thị Dashboard tại route `/` với các thẻ thống kê tổng quan.
2. THE App SHALL gọi `GET /api/statistics/revenue?from=&to=` với khoảng thời gian mặc định là tháng hiện tại để hiển thị: tổng số đơn hàng, tổng doanh thu, tổng đã thu, tổng còn nợ.
3. THE App SHALL gọi `GET /api/statistics/revenue/monthly?year=` với năm hiện tại để hiển thị biểu đồ doanh thu 12 tháng.
4. THE App SHALL gọi `GET /api/statistics/debts` để hiển thị danh sách top khách hàng còn nợ nhiều nhất.
5. THE App SHALL cho phép người dùng chọn khoảng thời gian (date range picker) để lọc thống kê doanh thu.
6. WHEN người dùng thay đổi khoảng thời gian, THE App SHALL tự động gọi lại API thống kê với tham số mới.
7. THE App SHALL hiển thị số tiền theo định dạng tiền Việt Nam (ví dụ: `1.500.000 ₫`).

---

### Requirement 4: Màn hình Danh mục (Category)

**User Story:** As a chủ cửa hàng, I want to quản lý danh mục mặt hàng, so that tôi có thể phân loại sản phẩm theo nhóm.

#### Acceptance Criteria

1. THE App SHALL hiển thị màn hình Danh mục tại route `/categories` với bảng danh sách Category.
2. THE App SHALL gọi `GET /api/categories` để tải danh sách Category và hiển thị các cột: Mã (code), Tên danh mục, Mô tả, Thao tác.
3. THE App SHALL hiển thị nút "Thêm danh mục" mở modal form với các trường: Tên danh mục (bắt buộc), Mô tả (tùy chọn).
4. WHEN người dùng submit form thêm mới, THE App SHALL gọi `POST /api/categories` và hiển thị kết quả.
5. THE App SHALL hiển thị nút "Sửa" trên mỗi dòng, mở modal form điền sẵn dữ liệu hiện tại.
6. WHEN người dùng submit form sửa, THE App SHALL gọi `PUT /api/categories/{id}` và cập nhật danh sách.
7. THE App SHALL hiển thị nút "Xóa" trên mỗi dòng với hộp thoại xác nhận trước khi xóa.
8. WHEN người dùng xác nhận xóa, THE App SHALL gọi `DELETE /api/categories/{id}` và cập nhật danh sách.
9. IF backend trả về lỗi 409 (tên trùng hoặc có sản phẩm liên kết), THEN THE App SHALL hiển thị thông báo lỗi cụ thể từ trường `message`.
10. THE App SHALL validate form phía client: tên danh mục không được để trống trước khi gửi request.

---

### Requirement 5: Màn hình Sản phẩm (Product)

**User Story:** As a chủ cửa hàng, I want to quản lý thông tin sản phẩm, so that tôi có thể theo dõi giá bán và phân loại hàng hóa.

#### Acceptance Criteria

1. THE App SHALL hiển thị màn hình Sản phẩm tại route `/products` với bảng danh sách Product.
2. THE App SHALL gọi `GET /api/products` để tải danh sách và hiển thị các cột: Mã (code), Tên sản phẩm, Danh mục, Đơn vị, Giá bán, Thao tác.
3. THE App SHALL hiển thị dropdown lọc theo Danh mục; WHEN người dùng chọn danh mục, THE App SHALL gọi `GET /api/products?categoryId={id}` để lọc kết quả.
4. THE App SHALL hiển thị nút "Thêm sản phẩm" mở modal form với các trường: Tên (bắt buộc), Danh mục (bắt buộc, dropdown), Đơn vị tính (bắt buộc), Giá bán (bắt buộc, số dương), Mô tả (tùy chọn).
5. WHEN người dùng submit form thêm mới, THE App SHALL gọi `POST /api/products` và cập nhật danh sách.
6. THE App SHALL hiển thị nút "Sửa" mở modal form điền sẵn dữ liệu, cho phép cập nhật tất cả trường.
7. WHEN người dùng submit form sửa, THE App SHALL gọi `PUT /api/products/{id}` và cập nhật danh sách.
8. THE App SHALL hiển thị nút "Xóa" với hộp thoại xác nhận trước khi gọi `DELETE /api/products/{id}`.
9. THE App SHALL validate form phía client: tên không trống, danh mục được chọn, đơn vị không trống, giá bán lớn hơn 0.
10. THE App SHALL hiển thị giá bán theo định dạng tiền Việt Nam trong bảng danh sách.

---

### Requirement 6: Màn hình Khách hàng (Customer)

**User Story:** As a chủ cửa hàng, I want to quản lý thông tin khách hàng và xem công nợ của từng người, so that tôi biết ai đang nợ và liên hệ được.

#### Acceptance Criteria

1. THE App SHALL hiển thị màn hình Khách hàng tại route `/customers` với bảng danh sách Customer.
2. THE App SHALL gọi `GET /api/customers` để tải danh sách và hiển thị các cột: Mã (code), Tên khách hàng, Số điện thoại, Địa chỉ, Trạng thái nợ (has_debt), Thao tác.
3. THE App SHALL hiển thị badge/tag "Đang nợ" màu đỏ cho khách hàng có `has_debt = true`.
4. THE App SHALL hiển thị nút "Thêm khách hàng" mở modal form với các trường: Tên (bắt buộc), Số điện thoại (tùy chọn), Địa chỉ (tùy chọn).
5. WHEN người dùng submit form thêm mới, THE App SHALL gọi `POST /api/customers` và cập nhật danh sách.
6. THE App SHALL hiển thị nút "Sửa" mở modal form điền sẵn dữ liệu để cập nhật thông tin khách hàng.
7. WHEN người dùng submit form sửa, THE App SHALL gọi `PUT /api/customers/{id}` và cập nhật danh sách.
8. THE App SHALL hiển thị nút "Xem chi tiết" điều hướng đến route `/customers/{id}`.
9. THE App SHALL hiển thị màn hình chi tiết khách hàng tại route `/customers/{id}` bằng cách gọi `GET /api/customers/{id}` và `GET /api/debts/customer/{customerId}`.
10. THE App SHALL hiển thị trong màn hình chi tiết: thông tin cơ bản, tổng công nợ hiện tại, danh sách các khoản nợ theo từng đơn hàng.
11. IF backend trả về lỗi 409 (số điện thoại trùng), THEN THE App SHALL hiển thị thông báo lỗi cụ thể.
12. THE App SHALL validate form phía client: tên không được để trống.

---

### Requirement 7: Màn hình Đơn hàng (Order)

**User Story:** As a chủ cửa hàng, I want to tạo đơn hàng mới và xem lịch sử đơn hàng, so that tôi có thể ghi nhận giao dịch bán hàng chính xác.

#### Acceptance Criteria

1. THE App SHALL hiển thị màn hình Đơn hàng tại route `/orders` với bảng danh sách Order.
2. THE App SHALL gọi `GET /api/orders` để tải danh sách và hiển thị các cột: Mã đơn (code), Khách hàng, Ngày đặt, Tổng tiền, Đã thanh toán, Còn nợ, Thao tác.
3. THE App SHALL hiển thị bộ lọc: dropdown chọn khách hàng và date range picker chọn khoảng thời gian.
4. WHEN người dùng áp dụng bộ lọc, THE App SHALL gọi `GET /api/orders?customerId=&from=&to=` với tham số tương ứng.
5. THE App SHALL hiển thị nút "Tạo đơn hàng" điều hướng đến route `/orders/new`.
6. THE App SHALL hiển thị màn hình tạo đơn hàng tại route `/orders/new` với form gồm: chọn khách hàng (bắt buộc), ngày đặt hàng (mặc định hôm nay), danh sách sản phẩm (thêm/xóa dòng), số tiền thanh toán ngay, ghi chú.
7. THE App SHALL cho phép thêm nhiều OrderItem trong form tạo đơn, mỗi item gồm: chọn sản phẩm (dropdown), số lượng (count), chiều dài (length, nếu cần), chiều rộng (width, nếu cần), đơn giá (tự động điền từ giá sản phẩm, có thể sửa).
8. THE App SHALL tự động tính và hiển thị thành tiền (subtotal) cho từng dòng và tổng tiền đơn hàng theo thời gian thực khi người dùng nhập liệu.
9. WHEN người dùng submit form tạo đơn, THE App SHALL gọi `POST /api/orders` và chuyển hướng về danh sách đơn hàng khi thành công.
10. THE App SHALL hiển thị nút "Xem chi tiết" điều hướng đến route `/orders/{id}`.
11. THE App SHALL hiển thị màn hình chi tiết đơn hàng tại route `/orders/{id}` bằng cách gọi `GET /api/orders/{id}`, hiển thị đầy đủ thông tin đơn hàng và danh sách OrderItem.
12. THE App SHALL hiển thị nút "Xóa đơn" trên màn hình chi tiết với hộp thoại xác nhận, gọi `DELETE /api/orders/{id}` khi xác nhận.
13. THE App SHALL cho phép cập nhật ghi chú đơn hàng bằng cách gọi `PATCH /api/orders/{id}/note`.
14. THE App SHALL validate form phía client: phải chọn khách hàng, phải có ít nhất 1 OrderItem, số lượng phải lớn hơn 0, số tiền thanh toán ngay không được vượt quá tổng tiền.

---

### Requirement 8: Màn hình Công nợ (Debt)

**User Story:** As a chủ cửa hàng, I want to xem tổng quan công nợ của tất cả khách hàng, so that tôi biết ai đang nợ bao nhiêu và ưu tiên thu hồi.

#### Acceptance Criteria

1. THE App SHALL hiển thị màn hình Công nợ tại route `/debts` với bảng danh sách tổng nợ theo khách hàng.
2. THE App SHALL gọi `GET /api/debts` để tải danh sách và hiển thị các cột: Mã khách hàng, Tên khách hàng, Số điện thoại, Tổng nợ còn lại.
3. THE App SHALL hiển thị tổng cộng nợ của tất cả khách hàng ở cuối bảng hoặc phần tóm tắt.
4. THE App SHALL hiển thị nút "Xem chi tiết" trên mỗi dòng, điều hướng đến route `/customers/{id}` để xem chi tiết công nợ theo từng đơn hàng.
5. THE App SHALL hiển thị số tiền nợ theo định dạng tiền Việt Nam, tô màu đỏ cho các khoản nợ lớn hơn 0.
6. WHEN danh sách công nợ trống, THE App SHALL hiển thị thông báo "Không có khách hàng nào đang nợ".

---

### Requirement 9: Màn hình Thanh toán (Payment)

**User Story:** As a chủ cửa hàng, I want to ghi nhận thanh toán của khách hàng và xem lịch sử, so that tôi có thể cập nhật công nợ chính xác.

#### Acceptance Criteria

1. THE App SHALL hiển thị màn hình Thanh toán tại route `/payments` với bảng lịch sử thanh toán và nút ghi nhận thanh toán mới.
2. THE App SHALL gọi `GET /api/payments?from=&to=` với khoảng thời gian mặc định là tháng hiện tại để tải lịch sử thanh toán.
3. THE App SHALL hiển thị bảng lịch sử với các cột: Mã thanh toán (code), Khách hàng, Số tiền, Ngày thanh toán, Ghi chú.
4. THE App SHALL hiển thị date range picker để lọc lịch sử thanh toán theo khoảng thời gian.
5. THE App SHALL hiển thị nút "Ghi nhận thanh toán" mở modal form với các trường: chọn khách hàng (bắt buộc, có hiển thị tổng nợ hiện tại), số tiền (bắt buộc, số dương), ngày thanh toán (mặc định hôm nay), ghi chú (tùy chọn).
6. WHEN người dùng chọn khách hàng trong form thanh toán, THE App SHALL hiển thị tổng nợ hiện tại của khách hàng đó để tham khảo.
7. WHEN người dùng submit form thanh toán, THE App SHALL gọi `POST /api/payments` và làm mới danh sách thanh toán.
8. THE App SHALL validate form phía client: phải chọn khách hàng, số tiền phải lớn hơn 0.
9. THE App SHALL hiển thị tổng số tiền đã thu trong khoảng thời gian đang lọc ở phần tóm tắt.
10. THE App SHALL hiển thị số tiền theo định dạng tiền Việt Nam.

---

### Requirement 10: Validation và xử lý lỗi phía client

**User Story:** As a người dùng, I want to nhận phản hồi ngay lập tức khi nhập sai dữ liệu, so that tôi có thể sửa trước khi gửi lên server.

#### Acceptance Criteria

1. THE App SHALL hiển thị thông báo lỗi validation ngay dưới trường nhập liệu khi người dùng rời khỏi trường đó (on blur) hoặc khi submit form.
2. THE App SHALL vô hiệu hóa nút submit khi form đang trong trạng thái submitting để tránh gửi trùng.
3. WHEN server trả về lỗi 400 hoặc 409, THE App SHALL hiển thị thông báo lỗi từ trường `message` của ApiResponse dưới dạng Ant Design notification màu đỏ.
4. WHEN server trả về lỗi 404, THE App SHALL hiển thị thông báo "Không tìm thấy dữ liệu".
5. WHEN server trả về lỗi 500 hoặc mạng bị lỗi, THE App SHALL hiển thị thông báo "Lỗi hệ thống, vui lòng thử lại sau".
6. THE App SHALL reset form về trạng thái ban đầu sau khi thao tác thành công.

---

### Requirement 11: Định dạng hiển thị dữ liệu

**User Story:** As a người dùng, I want to xem dữ liệu được định dạng rõ ràng và nhất quán, so that tôi dễ đọc và không nhầm lẫn.

#### Acceptance Criteria

1. THE App SHALL hiển thị tất cả số tiền theo định dạng `#.###.### ₫` (ví dụ: `1.500.000 ₫`) sử dụng `Intl.NumberFormat` với locale `vi-VN`.
2. THE App SHALL hiển thị tất cả ngày tháng theo định dạng `DD/MM/YYYY` sử dụng dayjs.
3. THE App SHALL hiển thị Display Code (ví dụ: `KH0000001`) ở những nơi cần nhận diện bản ghi.
4. THE App SHALL hiển thị số lượng sản phẩm kèm đơn vị tính (ví dụ: `10 kg`, `5 tấm`).
5. WHEN một trường dữ liệu không có giá trị (null hoặc undefined), THE App SHALL hiển thị dấu gạch ngang `—` thay vì để trống.
