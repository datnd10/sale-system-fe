# Design Document: Sale System Frontend

## Overview

Frontend ứng dụng quản lý bán vật liệu xây dựng (tôn, sắt, thép) dành cho nội bộ gia đình. Được xây dựng trên **Vite + React 19 + TypeScript**, giao tiếp với backend Spring Boot REST API tại `http://localhost:8080` qua Axios. Giao diện sử dụng **Ant Design** với chữ to (font size ≥ 16px), bố cục đơn giản, dễ thao tác cho người lớn tuổi.

Hệ thống gồm 7 màn hình chính: Dashboard, Danh mục, Sản phẩm, Khách hàng, Đơn hàng, Công nợ, Thanh toán.

**Nguyên tắc thiết kế:**
- Ưu tiên rõ ràng, dễ đọc hơn fancy
- Font size tối thiểu 16px toàn bộ giao diện
- Sidebar cố định bên trái, content area bên phải
- Phản hồi rõ ràng cho mọi thao tác (loading, success, error)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
│                                                                   │
│  ┌──────────────┐   ┌──────────────────────────────────────────┐ │
│  │   Routing    │   │              UI Layer                     │ │
│  │ React Router │   │  Pages / Components (Ant Design)          │ │
│  │     v7       │   └──────────────────────────────────────────┘ │
│  └──────────────┘                    │                            │
│                                      ▼                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   State Management Layer                      │ │
│  │              TanStack Query (server state)                    │ │
│  │         hooks/useCategories, useProducts, useOrders...        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                      │                            │
│                                      ▼                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      API Layer                                │ │
│  │         Axios instance + interceptors + api/* modules         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                      │                            │
└──────────────────────────────────────┼────────────────────────────┘
                                       │ HTTP
                                       ▼
                         ┌─────────────────────────┐
                         │  Spring Boot REST API    │
                         │  http://localhost:8080   │
                         └─────────────────────────┘
```

### Luồng dữ liệu

1. **User action** → Page/Component gọi TanStack Query hook
2. **TanStack Query** kiểm tra cache → nếu stale/miss, gọi API function
3. **API function** (trong `src/api/`) gọi Axios instance
4. **Axios interceptor** unwrap `ApiResponse<T>` → trả về `T` hoặc throw error
5. **TanStack Query** cập nhật cache, trigger re-render
6. **Component** nhận data/loading/error state và render tương ứng

---

## Components and Interfaces

### Cấu trúc thư mục

```
src/
├── api/                        # API layer
│   ├── axios.ts                # Axios instance + interceptors
│   ├── categories.ts           # Category API functions
│   ├── products.ts             # Product API functions
│   ├── customers.ts            # Customer API functions
│   ├── orders.ts               # Order API functions
│   ├── debts.ts                # Debt API functions
│   ├── payments.ts             # Payment API functions
│   └── statistics.ts           # Statistics API functions
│
├── hooks/                      # TanStack Query hooks
│   ├── useCategories.ts
│   ├── useProducts.ts
│   ├── useCustomers.ts
│   ├── useOrders.ts
│   ├── useDebts.ts
│   ├── usePayments.ts
│   └── useStatistics.ts
│
├── pages/                      # Page components (route-level)
│   ├── Dashboard/
│   │   └── index.tsx
│   ├── Categories/
│   │   └── index.tsx
│   ├── Products/
│   │   └── index.tsx
│   ├── Customers/
│   │   ├── index.tsx           # Danh sách
│   │   └── CustomerDetail.tsx  # Chi tiết
│   ├── Orders/
│   │   ├── index.tsx           # Danh sách
│   │   ├── OrderNew.tsx        # Tạo đơn hàng
│   │   └── OrderDetail.tsx     # Chi tiết
│   ├── Debts/
│   │   └── index.tsx
│   └── Payments/
│       └── index.tsx
│
├── components/                 # Shared/reusable components
│   ├── layout/
│   │   ├── AppLayout.tsx       # Sidebar + Content layout
│   │   └── SidebarNav.tsx      # Navigation sidebar
│   ├── common/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── EmptyState.tsx
│   └── forms/
│       ├── CategoryForm.tsx
│       ├── ProductForm.tsx
│       ├── CustomerForm.tsx
│       ├── PaymentForm.tsx
│       └── OrderItemRow.tsx    # Dòng sản phẩm trong form tạo đơn
│
├── utils/                      # Utility functions
│   ├── formatters.ts           # formatCurrency, formatDate, formatValue
│   └── queryKeys.ts            # TanStack Query key constants
│
├── types/                      # TypeScript type definitions
│   └── index.ts
│
├── App.tsx                     # Router setup
└── main.tsx                    # Entry point, QueryClient setup
```

### AppLayout & SidebarNav

`AppLayout` sử dụng Ant Design `Layout` với `Sider` cố định bên trái (width 220px) và `Content` bên phải.

```
┌──────────────────────────────────────────────────────┐
│  ┌────────────┐  ┌──────────────────────────────────┐ │
│  │  Sidebar   │  │         Content Area              │ │
│  │            │  │                                   │ │
│  │ 🏠 Dashboard│  │   <Outlet /> (React Router)       │ │
│  │ 📋 Danh mục│  │                                   │ │
│  │ 📦 Sản phẩm│  │                                   │ │
│  │ 👥 Khách hàng│ │                                   │ │
│  │ 📄 Đơn hàng│  │                                   │ │
│  │ 💰 Công nợ │  │                                   │ │
│  │ 💳 Thanh toán│ │                                   │ │
│  └────────────┘  └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

`SidebarNav` dùng Ant Design `Menu` với `selectedKeys` được tính từ `useLocation().pathname`.

### Routing (React Router v7)

```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<AppLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="categories" element={<Categories />} />
      <Route path="products" element={<Products />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:id" element={<CustomerDetail />} />
      <Route path="orders" element={<Orders />} />
      <Route path="orders/new" element={<OrderNew />} />
      <Route path="orders/:id" element={<OrderDetail />} />
      <Route path="debts" element={<Debts />} />
      <Route path="payments" element={<Payments />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### API Layer

**`src/api/axios.ts`** — Axios instance với interceptors:

```typescript
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

// Response interceptor: unwrap ApiResponse<T>
apiClient.interceptors.response.use(
  (response) => {
    const apiResponse: ApiResponse<unknown> = response.data;
    if (!apiResponse.success) {
      return Promise.reject(new Error(apiResponse.message));
    }
    return apiResponse.data; // trả về T trực tiếp
  },
  (error) => {
    // Network error hoặc HTTP error status
    const message =
      error.response?.data?.message ||
      (error.response?.status === 404 ? 'Không tìm thấy dữ liệu' : 'Lỗi hệ thống, vui lòng thử lại sau');
    return Promise.reject(new Error(message));
  }
);
```

**API modules** — mỗi file export các async functions:

```typescript
// src/api/categories.ts
export const getCategories = (): Promise<Category[]> =>
  apiClient.get('/api/categories');

export const createCategory = (data: CreateCategoryDto): Promise<Category> =>
  apiClient.post('/api/categories', data);

export const updateCategory = (id: number, data: UpdateCategoryDto): Promise<Category> =>
  apiClient.put(`/api/categories/${id}`, data);

export const deleteCategory = (id: number): Promise<void> =>
  apiClient.delete(`/api/categories/${id}`);
```

### TanStack Query Hooks

Mỗi hook file export query hooks và mutation hooks:

```typescript
// src/hooks/useCategories.ts
export const useCategories = () =>
  useQuery({ queryKey: QUERY_KEYS.categories, queryFn: getCategories });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      notification.success({ message: 'Thêm danh mục thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};
```

**Query Keys** (`src/utils/queryKeys.ts`):

```typescript
export const QUERY_KEYS = {
  categories: ['categories'] as const,
  products: (categoryId?: number) => ['products', categoryId] as const,
  customers: ['customers'] as const,
  customer: (id: number) => ['customers', id] as const,
  orders: (filters?: OrderFilters) => ['orders', filters] as const,
  order: (id: number) => ['orders', id] as const,
  debts: ['debts'] as const,
  debtsByCustomer: (customerId: number) => ['debts', 'customer', customerId] as const,
  payments: (filters?: PaymentFilters) => ['payments', filters] as const,
  statistics: {
    revenue: (from: string, to: string) => ['statistics', 'revenue', from, to] as const,
    monthly: (year: number) => ['statistics', 'monthly', year] as const,
    debts: ['statistics', 'debts'] as const,
  },
} as const;
```

### Utility Functions (`src/utils/formatters.ts`)

```typescript
// Định dạng tiền Việt Nam: 1500000 → "1.500.000 ₫"
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Định dạng ngày: Date | string → "25/12/2024"
export const formatDate = (date: Date | string | dayjs.Dayjs): string =>
  dayjs(date).format('DD/MM/YYYY');

// Hiển thị giá trị hoặc dấu gạch ngang nếu null/undefined
export const formatValue = (value: unknown): string =>
  value == null ? '—' : String(value);
```

---

## Data Models

### TypeScript Types (`src/types/index.ts`)

```typescript
// Wrapper response từ backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface Category {
  id: number;
  code: string;       // DM0000001
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  code: string;       // SP0000001
  name: string;
  categoryId: number;
  categoryName: string;
  unit: string;       // kg, tấm, cây, ...
  price: number;
  description?: string;
  active: boolean;
}

export interface Customer {
  id: number;
  code: string;       // KH0000001
  name: string;
  phone?: string;
  address?: string;
  hasDebt: boolean;
  totalDebt?: number; // chỉ có trong GET /customers/{id}
}

export interface Order {
  id: number;
  code: string;       // HD0000001
  customerId: number;
  customerName: string;
  orderDate: string;  // ISO date
  totalAmount: number;
  paidImmediately: number;
  remainingDebt: number;  // totalAmount - paidImmediately
  note?: string;
  active: boolean;
  items?: OrderItem[];    // chỉ có trong GET /orders/{id}
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  unit: string;
  count: number;
  length?: number;
  width?: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Debt {
  id: number;
  code: string;       // CN0000001
  customerId: number;
  customerName: string;
  customerPhone?: string;
  orderId: number;
  orderCode: string;
  originalAmount: number;
  remainingAmount: number;
  createdAt: string;
}

export interface Payment {
  id: number;
  code: string;       // TT0000001
  customerId: number;
  customerName: string;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
}

export interface RevenueStatistics {
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  totalDebt: number;
}

export interface MonthlyRevenue {
  month: number;
  revenue: number;
}

export interface DebtSummary {
  customerId: number;
  customerCode: string;
  customerName: string;
  customerPhone?: string;
  totalDebt: number;
}

// DTO cho form tạo/sửa
export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface CreateProductDto {
  name: string;
  categoryId: number;
  unit: string;
  price: number;
  description?: string;
}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  address?: string;
}

export interface CreateOrderDto {
  customerId: number;
  orderDate: string;
  paidImmediately: number;
  note?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: number;
  count: number;
  length?: number;
  width?: number;
  unitPrice: number;
}

export interface CreatePaymentDto {
  customerId: number;
  amount: number;
  paymentDate: string;
  note?: string;
}

// Filters
export interface OrderFilters {
  customerId?: number;
  from?: string;
  to?: string;
}

export interface PaymentFilters {
  from?: string;
  to?: string;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Active nav item matches current route

*For any* route in the application's route list, when the app is rendered at that route, the corresponding sidebar navigation item SHALL have the active/selected state, and no other nav item SHALL be active simultaneously.

**Validates: Requirements 1.3**

---

### Property 2: ApiResponse unwrapping preserves data

*For any* `ApiResponse<T>` where `success = true` and `data` contains an arbitrary payload, the Axios response interceptor SHALL return exactly the value of the `data` field — no more, no less.

**Validates: Requirements 2.6**

---

### Property 3: Failed ApiResponse triggers error with correct message

*For any* `ApiResponse` where `success = false` and `message` is an arbitrary non-empty string, the Axios response interceptor SHALL reject with an error whose message equals the `message` field of the response.

**Validates: Requirements 2.7**

---

### Property 4: Loading state renders loading indicator

*For any* data-fetching page component, when the TanStack Query hook returns `isLoading = true`, the component SHALL render a loading indicator (spinner or skeleton) and SHALL NOT render the data table/content.

**Validates: Requirements 2.3**

---

### Property 5: Error state renders error message from API

*For any* data-fetching page component, when the TanStack Query hook returns an error with an arbitrary message string, the component SHALL display that exact error message to the user.

**Validates: Requirements 2.4**

---

### Property 6: Successful mutation shows notification and invalidates cache

*For any* mutation hook (create/update/delete), when the mutation succeeds, the hook SHALL call `notification.success` and SHALL call `queryClient.invalidateQueries` with the relevant query key.

**Validates: Requirements 2.5**

---

### Property 7: formatCurrency produces valid VND format

*For any* non-negative number `n`, `formatCurrency(n)` SHALL return a string that contains the number formatted with dots as thousand separators and ends with the `₫` currency symbol, consistent with `vi-VN` locale.

**Validates: Requirements 3.7, 11.1**

---

### Property 8: formatDate produces DD/MM/YYYY format

*For any* valid date value (Date object, ISO string, or dayjs object), `formatDate(d)` SHALL return a string matching the pattern `DD/MM/YYYY` where DD is zero-padded day, MM is zero-padded month, and YYYY is 4-digit year.

**Validates: Requirements 11.2**

---

### Property 9: formatValue returns dash for null/undefined

*For any* value that is `null` or `undefined`, `formatValue(value)` SHALL return the string `"—"`. For any non-null, non-undefined value, `formatValue(value)` SHALL return a non-empty string.

**Validates: Requirements 11.5**

---

### Property 10: Order total equals sum of item subtotals

*For any* list of order items where each item has `quantity > 0` and `unitPrice > 0`, the computed `totalAmount` displayed in the order form SHALL equal the mathematical sum of all `quantity × unitPrice` values across all items.

**Validates: Requirements 7.8**

---

### Property 11: Payment amount validation rejects non-positive values

*For any* payment form submission where `amount ≤ 0`, the client-side form validation SHALL mark the amount field as invalid and SHALL NOT submit the form to the API.

**Validates: Requirements 9.8**

---

### Property 12: Order paid_immediately validation rejects overpayment

*For any* order form where `paidImmediately > totalAmount`, the client-side form validation SHALL mark the paid amount field as invalid and SHALL NOT submit the form to the API.

**Validates: Requirements 7.14**

---

### Property 13: Submit button disabled during submission

*For any* form component, when the form is in the `isSubmitting = true` state, the submit button SHALL have the `disabled` attribute set to `true`.

**Validates: Requirements 10.2**

---

### Property 14: Statistics API called with selected date range params

*For any* date range `[from, to]` selected by the user in the Dashboard date picker, the revenue statistics API SHALL be called with `from` and `to` query parameters matching exactly the selected dates in `YYYY-MM-DD` format.

**Validates: Requirements 3.6**

---

## Error Handling

### HTTP Error Mapping

| HTTP Status | Displayed Message |
|---|---|
| 400 | `message` từ ApiResponse |
| 404 | "Không tìm thấy dữ liệu" |
| 409 | `message` từ ApiResponse |
| 500 | "Lỗi hệ thống, vui lòng thử lại sau" |
| Network error | "Lỗi hệ thống, vui lòng thử lại sau" |

### Error Display Strategy

- **API errors** (query failures): hiển thị `<ErrorMessage>` component trong vùng content, thay thế bảng dữ liệu
- **Mutation errors** (create/update/delete): hiển thị Ant Design `notification.error` ở góc trên phải
- **Form validation errors**: hiển thị inline dưới từng field (Ant Design Form.Item `validateStatus`)
- **404 route**: redirect về `/` qua `<Navigate to="/" replace />`

### Form Validation Rules

| Field | Rule |
|---|---|
| Tên danh mục | Required, không được chỉ là whitespace |
| Tên sản phẩm | Required, không được chỉ là whitespace |
| Danh mục (product) | Required, phải chọn từ dropdown |
| Đơn vị tính | Required, không được chỉ là whitespace |
| Giá bán | Required, phải là số > 0 |
| Tên khách hàng | Required, không được chỉ là whitespace |
| Khách hàng (order/payment) | Required, phải chọn từ dropdown |
| OrderItem count | Required, phải là số > 0 |
| OrderItem unitPrice | Required, phải là số > 0 |
| paidImmediately | Optional, nếu nhập phải ≥ 0 và ≤ totalAmount |
| Payment amount | Required, phải là số > 0 |

---

## Testing Strategy

### Dual Testing Approach

Hệ thống sử dụng kết hợp:
1. **Unit tests** — kiểm tra utility functions, form validation logic, component rendering với các ví dụ cụ thể
2. **Property-based tests** — kiểm tra các invariant và universal properties với dữ liệu sinh ngẫu nhiên
3. **Integration tests** — kiểm tra luồng đầy đủ với mock API (MSW)

### Test Stack

- **Test runner**: [Vitest](https://vitest.dev/) — tích hợp tốt với Vite
- **Component testing**: [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
- **Property-based testing**: [fast-check](https://fast-check.io/) — PBT library cho JavaScript/TypeScript
- **API mocking**: [MSW (Mock Service Worker)](https://mswjs.io/) — mock HTTP requests
- **Assertions**: Vitest built-in (`expect`)

### Property-Based Testing

Thư viện: **fast-check** — PBT library cho JavaScript/TypeScript, hỗ trợ arbitrary generators phong phú.

Cấu hình: mỗi property test chạy tối thiểu **100 iterations** (fast-check default là 100).

Mỗi property test phải có comment tag theo format:
```
// Feature: sale-system-fe, Property {N}: {property_text}
```

**Properties cần implement:**

| Property | File | Mô tả |
|---|---|---|
| P1 | `AppLayout.test.tsx` | Active nav item matches current route |
| P2 | `axios.test.ts` | ApiResponse unwrapping preserves data |
| P3 | `axios.test.ts` | Failed ApiResponse triggers error with correct message |
| P4 | `pages/*.test.tsx` | Loading state renders loading indicator |
| P5 | `pages/*.test.tsx` | Error state renders error message from API |
| P6 | `hooks/*.test.ts` | Successful mutation shows notification and invalidates cache |
| P7 | `formatters.test.ts` | formatCurrency produces valid VND format |
| P8 | `formatters.test.ts` | formatDate produces DD/MM/YYYY format |
| P9 | `formatters.test.ts` | formatValue returns dash for null/undefined |
| P10 | `OrderNew.test.tsx` | Order total equals sum of item subtotals |
| P11 | `PaymentForm.test.tsx` | Payment amount validation rejects non-positive values |
| P12 | `OrderNew.test.tsx` | Order paid_immediately validation rejects overpayment |
| P13 | `forms/*.test.tsx` | Submit button disabled during submission |
| P14 | `Dashboard.test.tsx` | Statistics API called with selected date range params |

### Unit Tests

Tập trung vào:
- **Formatters**: `formatCurrency`, `formatDate`, `formatValue` với các ví dụ cụ thể (0, âm, rất lớn)
- **Form validation**: happy path và error cases cho từng form
- **Component rendering**: kiểm tra các trường hợp cụ thể (empty state, data loaded, error state)
- **Routing**: kiểm tra redirect khi truy cập route không tồn tại

### Integration Tests (với MSW)

- Luồng CRUD đầy đủ: tạo → hiển thị trong danh sách → sửa → xóa
- Luồng tạo đơn hàng: chọn khách hàng → thêm sản phẩm → tính tổng → submit
- Luồng thanh toán: chọn khách hàng → xem nợ → nhập số tiền → submit

### Test Coverage Target

- Utility functions (`formatters.ts`): 100% line coverage
- API layer (`api/*.ts`): ≥ 80% line coverage
- Hooks (`hooks/*.ts`): ≥ 70% line coverage
- Pages/Components: kiểm tra các state chính (loading, error, data, empty)
- Property tests: 100 iterations mỗi property
