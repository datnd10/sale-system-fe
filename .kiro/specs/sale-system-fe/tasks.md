# Implementation Plan: Sale System Frontend

## Overview

Triển khai ứng dụng frontend quản lý bán vật liệu xây dựng theo thứ tự từ foundation (cài đặt, cấu hình, types, API layer) đến từng feature cụ thể (Dashboard, Danh mục, Sản phẩm, Khách hàng, Đơn hàng, Công nợ, Thanh toán). Mỗi bước build trên bước trước, kết thúc bằng wiring toàn bộ hệ thống.

## Tasks

- [ ] 1. Cài đặt dependencies và cấu hình dự án
  - Cài production dependencies: `antd @tanstack/react-query react-router-dom axios dayjs`
  - Cài dev dependencies: `vitest @testing-library/react @testing-library/user-event fast-check msw jsdom`
  - Cập nhật `vite.config.ts` để thêm cấu hình test (environment: jsdom, globals: true, setupFiles)
  - Tạo file `sr-00-c/test/setup.ts` để cấu hình MSW và testing-library cleanup
  - Cập nhật `tsconfig.app.json` để include types cho vitest globals
  - _Requirements: 1.2, 2.1, 2.2_

- [ ] 2. Định nghĩa TypeScript types và utility functions
  - [x] 2.1 Tạo `src/types/index.ts` với toàn bộ interfaces và DTOs
    - Định nghĩa: `ApiResponse<T>`, `Category`, `Product`, `Customer`, `Order`, `OrderItem`, `Debt`, `Payment`, `RevenueStatistics`, `MonthlyRevenue`, `DebtSummary`
    - Định nghĩa DTOs: `CreateCategoryDto`, `CreateProductDto`, `CreateCustomerDto`, `CreateOrderDto`, `CreateOrderItemDto`, `CreatePaymentDto`
    - Định nghĩa Filters: `OrderFilters`, `PaymentFilters`
    - _Requirements: 2.6, 11.3_

  - [x] 2.2 Tạo `src/utils/queryKeys.ts` với QUERY_KEYS constants
    - Định nghĩa tất cả query keys cho categories, products, customers, orders, debts, payments, statistics
    - _Requirements: 2.2_

  - [x] 2.3 Tạo `src/utils/formatters.ts` với các hàm định dạng
    - Implement `formatCurrency(amount: number): string` dùng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
    - Implement `formatDate(date: Date | string | Dayjs): string` dùng `dayjs(date).format('DD/MM/YYYY')`
    - Implement `formatValue(value: unknown): string` trả về `"—"` nếu null/undefined
    - _Requirements: 11.1, 11.2, 11.5_

  - [ ]* 2.4 Viết unit tests và property tests cho formatters
    - **Property 7: formatCurrency produces valid VND format** — dùng `fc.integer({ min: 0 })` kiểm tra output chứa `₫`
    - **Property 8: formatDate produces DD/MM/YYYY format** — dùng `fc.date()` kiểm tra output match `/^\d{2}\/\d{2}\/\d{4}$/`
    - **Property 9: formatValue returns dash for null/undefined** — kiểm tra `formatValue(null)` và `formatValue(undefined)` trả về `"—"`
    - Viết unit tests cho các edge case: `formatCurrency(0)`, `formatCurrency(1500000)`, `formatDate('2024-12-25')`, `formatValue('')`
    - _Requirements: 11.1, 11.2, 11.5_

- [ ] 3. Xây dựng API layer
  - [x] 3.1 Tạo `src/api/axios.ts` — Axios instance với interceptors
    - Tạo `apiClient` với `baseURL: 'http://localhost:8080'` và `timeout: 10000`
    - Implement response interceptor: unwrap `ApiResponse<T>` — nếu `success = true` trả về `data`, nếu `success = false` reject với `message`
    - Implement error interceptor: map HTTP 404 → "Không tìm thấy dữ liệu", các lỗi khác → "Lỗi hệ thống, vui lòng thử lại sau"
    - _Requirements: 2.1, 2.6, 2.7, 10.3, 10.4, 10.5_

  - [ ] 3.2 Viết property tests cho Axios interceptor
    - **Property 2: ApiResponse unwrapping preserves data** — dùng `fc.anything()` làm payload, kiểm tra interceptor trả về đúng `data`
    - **Property 3: Failed ApiResponse triggers error with correct message** — dùng `fc.string({ minLength: 1 })` làm message, kiểm tra error message khớp
    - _Requirements: 2.6, 2.7_

  - [x] 3.3 Tạo `src/api/categories.ts`, `src/api/products.ts`, `src/api/customers.ts`
    - `categories.ts`: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`
    - `products.ts`: `getProducts(categoryId?)`, `createProduct`, `updateProduct`, `deleteProduct`
    - `customers.ts`: `getCustomers`, `getCustomerById`, `createCustomer`, `updateCustomer`
    - _Requirements: 4.2, 4.4, 4.6, 4.8, 5.2, 5.3, 5.5, 5.7, 5.8, 6.2, 6.5, 6.7, 6.9_

  - [x] 3.4 Tạo `src/api/orders.ts`, `src/api/debts.ts`, `src/api/payments.ts`, `src/api/statistics.ts`
    - `orders.ts`: `getOrders(filters?)`, `getOrderById`, `createOrder`, `deleteOrder`, `updateOrderNote`
    - `debts.ts`: `getDebts`, `getDebtsByCustomer(customerId)`
    - `payments.ts`: `getPayments(filters?)`, `createPayment`
    - `statistics.ts`: `getRevenueStatistics(from, to)`, `getMonthlyRevenue(year)`, `getDebtSummary`
    - _Requirements: 7.2, 7.4, 7.9, 7.11, 7.12, 7.13, 8.2, 9.2, 9.7, 3.2, 3.3, 3.4_

- [x] 4. Xây dựng TanStack Query hooks
  - [x] 4.1 Tạo `src/hooks/useCategories.ts` và `src/hooks/useProducts.ts`
    - `useCategories`: query hook gọi `getCategories`
    - `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`: mutation hooks với `onSuccess` invalidate cache + `notification.success`, `onError` `notification.error`
    - `useProducts(categoryId?)`: query hook gọi `getProducts`
    - `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`: tương tự pattern trên
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 4.4, 4.6, 4.8, 5.5, 5.7, 5.8_

  - [x] 4.2 Tạo `src/hooks/useCustomers.ts`, `src/hooks/useOrders.ts`
    - `useCustomers`, `useCustomerById(id)`: query hooks
    - `useCreateCustomer`, `useUpdateCustomer`: mutation hooks
    - `useOrders(filters?)`, `useOrderById(id)`: query hooks
    - `useCreateOrder`, `useDeleteOrder`, `useUpdateOrderNote`: mutation hooks
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.5, 6.7, 7.9, 7.12, 7.13_

  - [x] 4.3 Tạo `src/hooks/useDebts.ts`, `src/hooks/usePayments.ts`, `src/hooks/useStatistics.ts`
    - `useDebts`, `useDebtsByCustomer(customerId)`: query hooks
    - `usePayments(filters?)`, `useCreatePayment`: query + mutation hooks
    - `useRevenueStatistics(from, to)`, `useMonthlyRevenue(year)`, `useDebtSummary`: query hooks
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 8.2, 9.2, 9.7, 3.2, 3.3, 3.4_

  - [ ]* 4.4 Viết property tests cho mutation hooks
    - **Property 6: Successful mutation shows notification and invalidates cache** — mock `queryClient.invalidateQueries` và `notification.success`, kiểm tra cả hai được gọi khi mutation thành công
    - Test với `useCreateCategory` làm representative case
    - _Requirements: 2.5_

- [x] 5. Xây dựng layout và routing
  - [x] 5.1 Tạo `src/components/common/LoadingSpinner.tsx`, `ErrorMessage.tsx`, `EmptyState.tsx`
    - `LoadingSpinner`: wrap Ant Design `Spin` với style căn giữa
    - `ErrorMessage`: hiển thị Ant Design `Alert` type="error" với message prop
    - `EmptyState`: hiển thị Ant Design `Empty` với description prop
    - _Requirements: 2.3, 2.4, 8.6_

  - [x] 5.2 Tạo `src/components/layout/SidebarNav.tsx` và `AppLayout.tsx`
    - `SidebarNav`: Ant Design `Menu` với 7 items (Dashboard, Danh mục, Sản phẩm, Khách hàng, Đơn hàng, Công nợ, Thanh toán), dùng `useLocation().pathname` để set `selectedKeys`
    - `AppLayout`: Ant Design `Layout` với `Sider` width=220px bên trái và `Content` + `<Outlet />` bên phải
    - Áp dụng global style: font-size tối thiểu 16px
    - _Requirements: 1.1, 1.3, 1.4, 1.6_

  - [ ]* 5.3 Viết property test cho SidebarNav active state
    - **Property 1: Active nav item matches current route** — với mỗi route trong danh sách routes, render `SidebarNav` tại route đó và kiểm tra đúng 1 menu item có `aria-selected="true"` hoặc class active
    - _Requirements: 1.3_

  - [x] 5.4 Cập nhật `src/App.tsx` với React Router v7 routes
    - Setup `BrowserRouter` + `Routes` với `AppLayout` làm layout wrapper
    - Định nghĩa tất cả routes: `/`, `/categories`, `/products`, `/customers`, `/customers/:id`, `/orders`, `/orders/new`, `/orders/:id`, `/debts`, `/payments`
    - Thêm catch-all route `*` redirect về `/`
    - _Requirements: 1.2, 1.5_

  - [x] 5.5 Cập nhật `src/main.tsx` với QueryClient setup
    - Tạo `QueryClient` với `defaultOptions` (staleTime, retry)
    - Wrap app với `QueryClientProvider`
    - _Requirements: 2.2_

- [x] 6. Checkpoint — Kiểm tra foundation
  - Đảm bảo app khởi động không lỗi, sidebar hiển thị đúng, routing hoạt động, tất cả tests pass. Hỏi người dùng nếu có vấn đề.

- [x] 7. Implement màn hình Dashboard
  - [x] 7.1 Tạo `src/pages/Dashboard/index.tsx`
    - Hiển thị 4 thẻ thống kê (Ant Design `Statistic` hoặc `Card`): tổng đơn hàng, tổng doanh thu, tổng đã thu, tổng còn nợ
    - Tích hợp `useRevenueStatistics(from, to)` với default range là tháng hiện tại
    - Hiển thị biểu đồ doanh thu 12 tháng dùng Ant Design `Table` hoặc danh sách đơn giản (tránh thêm chart library mới)
    - Hiển thị bảng top khách hàng nợ từ `useDebtSummary`
    - Thêm Ant Design `RangePicker` để chọn khoảng thời gian, khi thay đổi trigger refetch với params mới
    - Hiển thị `LoadingSpinner` khi loading, `ErrorMessage` khi lỗi
    - Format số tiền bằng `formatCurrency`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 7.2 Viết property test cho Dashboard date range
    - **Property 14: Statistics API called with selected date range params** — dùng `fc.date()` sinh ngẫu nhiên `from` và `to`, mock API, kiểm tra API được gọi với đúng params `YYYY-MM-DD`
    - _Requirements: 3.6_

- [x] 8. Implement màn hình Danh mục (Categories)
  - [x] 8.1 Tạo `src/components/forms/CategoryForm.tsx`
    - Ant Design `Form` với fields: Tên danh mục (required, không chỉ whitespace), Mô tả (optional)
    - Nhận props: `initialValues?`, `onFinish`, `isSubmitting`
    - Disable submit button khi `isSubmitting = true`
    - _Requirements: 4.3, 4.10, 10.1, 10.2_

  - [x] 8.2 Tạo `src/pages/Categories/index.tsx`
    - Ant Design `Table` với columns: Mã, Tên danh mục, Mô tả, Thao tác (Sửa, Xóa)
    - Nút "Thêm danh mục" mở `Modal` chứa `CategoryForm`
    - Nút "Sửa" mở `Modal` với `initialValues` điền sẵn
    - Nút "Xóa" hiển thị `Popconfirm` trước khi gọi `useDeleteCategory`
    - Tích hợp `useCategories`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`
    - Hiển thị `LoadingSpinner` khi loading, `ErrorMessage` khi lỗi
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 8.3 Viết property test cho submit button disabled state
    - **Property 13: Submit button disabled during submission** — render `CategoryForm` với `isSubmitting=true`, kiểm tra submit button có `disabled` attribute
    - _Requirements: 10.2_

- [x] 9. Implement màn hình Sản phẩm (Products)
  - [x] 9.1 Tạo `src/components/forms/ProductForm.tsx`
    - Ant Design `Form` với fields: Tên (required), Danh mục (required, Select dropdown từ `useCategories`), Đơn vị tính (required), Giá bán (required, > 0), Mô tả (optional)
    - Disable submit button khi `isSubmitting = true`
    - _Requirements: 5.4, 5.9, 10.1, 10.2_

  - [x] 9.2 Tạo `src/pages/Products/index.tsx`
    - Ant Design `Table` với columns: Mã, Tên sản phẩm, Danh mục, Đơn vị, Giá bán (format currency), Thao tác
    - Dropdown lọc theo danh mục (Select từ `useCategories`), khi thay đổi gọi `useProducts(categoryId)`
    - Modal thêm/sửa với `ProductForm`
    - Nút "Xóa" với `Popconfirm`
    - Hiển thị `LoadingSpinner` khi loading, `ErrorMessage` khi lỗi
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.10_

- [x] 10. Implement màn hình Khách hàng (Customers)
  - [x] 10.1 Tạo `src/components/forms/CustomerForm.tsx`
    - Ant Design `Form` với fields: Tên (required, không chỉ whitespace), Số điện thoại (optional), Địa chỉ (optional)
    - Disable submit button khi `isSubmitting = true`
    - _Requirements: 6.4, 6.12, 10.1, 10.2_

  - [x] 10.2 Tạo `src/pages/Customers/index.tsx`
    - Ant Design `Table` với columns: Mã, Tên, SĐT, Địa chỉ, Trạng thái nợ (Tag "Đang nợ" màu đỏ nếu `hasDebt=true`), Thao tác (Sửa, Xem chi tiết)
    - Modal thêm/sửa với `CustomerForm`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 10.3 Tạo `src/pages/Customers/CustomerDetail.tsx`
    - Gọi `useCustomerById(id)` và `useDebtsByCustomer(id)` song song
    - Hiển thị thông tin cơ bản khách hàng (Card)
    - Hiển thị tổng công nợ hiện tại (format currency, màu đỏ nếu > 0)
    - Hiển thị bảng danh sách các khoản nợ theo từng đơn hàng: Mã nợ, Mã đơn hàng, Số tiền gốc, Còn lại, Ngày tạo
    - Hiển thị `LoadingSpinner` khi loading, `ErrorMessage` khi lỗi
    - _Requirements: 6.9, 6.10_

- [x] 11. Implement màn hình Đơn hàng (Orders)
  - [x] 11.1 Tạo `src/components/forms/OrderItemRow.tsx`
    - Component cho một dòng OrderItem trong form tạo đơn
    - Fields: chọn sản phẩm (Select, tự động điền đơn giá khi chọn), số lượng (count, > 0), chiều dài (length, optional), chiều rộng (width, optional), đơn giá (unitPrice, có thể sửa)
    - Hiển thị thành tiền (subtotal = count × unitPrice) tự động tính theo thời gian thực
    - Nút xóa dòng
    - _Requirements: 7.7, 7.8_

  - [x] 11.2 Tạo `src/pages/Orders/OrderNew.tsx`
    - Form tạo đơn hàng: chọn khách hàng (required), ngày đặt (default hôm nay), danh sách `OrderItemRow` (thêm/xóa dòng), số tiền thanh toán ngay (optional, ≥ 0 và ≤ totalAmount), ghi chú
    - Tự động tính và hiển thị tổng tiền real-time khi thay đổi items
    - Validate: phải có ít nhất 1 item, count > 0, unitPrice > 0, paidImmediately ≤ totalAmount
    - Submit gọi `useCreateOrder`, thành công redirect về `/orders`
    - _Requirements: 7.5, 7.6, 7.7, 7.8, 7.9, 7.14_

  - [ ]* 11.3 Viết property tests cho OrderNew
    - **Property 10: Order total equals sum of item subtotals** — dùng `fc.array(fc.record({ count: fc.integer({min:1}), unitPrice: fc.integer({min:1}) }))` kiểm tra tổng tiền hiển thị = sum(count × unitPrice)
    - **Property 12: Order paid_immediately validation rejects overpayment** — dùng `fc.integer({min:1})` sinh `totalAmount`, sinh `paidImmediately > totalAmount`, kiểm tra form validation fail
    - _Requirements: 7.8, 7.14_

  - [x] 11.4 Tạo `src/pages/Orders/index.tsx`
    - Ant Design `Table` với columns: Mã đơn, Khách hàng, Ngày đặt (formatDate), Tổng tiền (formatCurrency), Đã thanh toán (formatCurrency), Còn nợ (formatCurrency), Thao tác (Xem chi tiết)
    - Bộ lọc: Select khách hàng + RangePicker ngày, khi thay đổi gọi `useOrders(filters)`
    - Nút "Tạo đơn hàng" navigate đến `/orders/new`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 11.5 Tạo `src/pages/Orders/OrderDetail.tsx`
    - Gọi `useOrderById(id)` để lấy chi tiết đơn hàng
    - Hiển thị thông tin đơn hàng (Card): mã, khách hàng, ngày, tổng tiền, đã thanh toán, còn nợ, ghi chú
    - Hiển thị bảng OrderItems: sản phẩm, đơn vị, số lượng, chiều dài, chiều rộng, đơn giá, thành tiền
    - Cho phép sửa ghi chú inline (Input + nút Lưu gọi `useUpdateOrderNote`)
    - Nút "Xóa đơn" với `Popconfirm`, gọi `useDeleteOrder`, thành công navigate về `/orders`
    - _Requirements: 7.10, 7.11, 7.12, 7.13_

- [x] 12. Implement màn hình Công nợ (Debts)
  - [x] 12.1 Tạo `src/pages/Debts/index.tsx`
    - Gọi `useDebts` để lấy danh sách tổng nợ theo khách hàng
    - Ant Design `Table` với columns: Mã KH, Tên khách hàng, SĐT, Tổng nợ còn lại (formatCurrency, màu đỏ nếu > 0), Thao tác (Xem chi tiết → navigate `/customers/{id}`)
    - Hiển thị tổng cộng nợ tất cả khách hàng ở phần summary
    - Hiển thị `EmptyState` với message "Không có khách hàng nào đang nợ" khi danh sách trống
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 13. Implement màn hình Thanh toán (Payments)
  - [x] 13.1 Tạo `src/components/forms/PaymentForm.tsx`
    - Ant Design `Form` với fields: chọn khách hàng (required, Select từ `useCustomers`), số tiền (required, > 0), ngày thanh toán (default hôm nay), ghi chú (optional)
    - Khi chọn khách hàng, hiển thị tổng nợ hiện tại của khách hàng đó (gọi `useCustomerById` hoặc lấy từ danh sách)
    - Disable submit button khi `isSubmitting = true`
    - _Requirements: 9.5, 9.6, 9.8, 10.1, 10.2_

  - [ ]* 13.2 Viết property test cho PaymentForm validation
    - **Property 11: Payment amount validation rejects non-positive values** — dùng `fc.integer({ max: 0 })` sinh amount ≤ 0, kiểm tra form validation fail và không submit
    - _Requirements: 9.8_

  - [x] 13.3 Tạo `src/pages/Payments/index.tsx`
    - Gọi `usePayments(filters)` với default range là tháng hiện tại
    - Ant Design `Table` với columns: Mã thanh toán, Khách hàng, Số tiền (formatCurrency), Ngày thanh toán (formatDate), Ghi chú
    - RangePicker để lọc theo khoảng thời gian
    - Hiển thị tổng số tiền đã thu trong khoảng thời gian đang lọc
    - Nút "Ghi nhận thanh toán" mở Modal chứa `PaymentForm`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 9.9, 9.10_

- [x] 14. Checkpoint — Kiểm tra toàn bộ features
  - Đảm bảo tất cả routes hoạt động, CRUD đầy đủ cho mỗi entity, format tiền/ngày đúng, tất cả tests pass. Hỏi người dùng nếu có vấn đề.

- [ ] 15. Viết integration tests với MSW
  - [ ]* 15.1 Tạo `src/test/handlers.ts` với MSW request handlers
    - Định nghĩa handlers cho tất cả API endpoints: categories, products, customers, orders, debts, payments, statistics
    - Tạo `src/test/server.ts` setup MSW server cho Vitest
    - _Requirements: 2.1, 2.2_

  - [ ]* 15.2 Viết integration tests cho luồng CRUD Categories và Products
    - Test luồng: tải danh sách → thêm mới → hiển thị trong bảng → sửa → xóa
    - Kiểm tra loading state, success notification, error handling
    - _Requirements: 4.2, 4.4, 4.6, 4.8, 5.2, 5.5, 5.7, 5.8_

  - [ ]* 15.3 Viết integration tests cho luồng tạo đơn hàng
    - Test luồng: chọn khách hàng → thêm sản phẩm → kiểm tra tổng tiền tự động tính → submit → redirect
    - _Requirements: 7.6, 7.7, 7.8, 7.9_

  - [ ]* 15.4 Viết integration tests cho luồng thanh toán
    - Test luồng: chọn khách hàng → xem tổng nợ hiển thị → nhập số tiền → submit → danh sách cập nhật
    - _Requirements: 9.5, 9.6, 9.7_

  - [ ]* 15.5 Viết property tests cho loading/error states
    - **Property 4: Loading state renders loading indicator** — với mỗi page component, khi hook trả về `isLoading=true`, kiểm tra loading indicator hiển thị và bảng dữ liệu không hiển thị
    - **Property 5: Error state renders error message from API** — dùng `fc.string({ minLength: 1 })` sinh error message, kiểm tra component hiển thị đúng message đó
    - _Requirements: 2.3, 2.4_

- [ ] 16. Final checkpoint — Đảm bảo tất cả tests pass
  - Chạy toàn bộ test suite, kiểm tra coverage targets (formatters 100%, API layer ≥ 80%, hooks ≥ 70%). Hỏi người dùng nếu có vấn đề.

## Notes

- Tasks đánh dấu `*` là optional, có thể bỏ qua để triển khai MVP nhanh hơn
- Mỗi task tham chiếu requirements cụ thể để đảm bảo traceability
- Checkpoint tasks đảm bảo kiểm tra incremental sau mỗi nhóm tính năng
- Property tests dùng fast-check với tối thiểu 100 iterations mỗi property
- Mỗi property test phải có comment: `// Feature: sale-system-fe, Property {N}: {property_text}`
- Không implement tasks đánh dấu `*` — chỉ implement khi được yêu cầu rõ ràng
