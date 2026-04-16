// Wrapper response từ backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// Paginated response từ backend
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Search params dùng chung cho các search endpoint
export interface SearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface CategorySearchParams extends SearchParams {
  name?: string;
}

export interface ProductSearchParams extends SearchParams {
  name?: string;
  categoryId?: number;
}

export interface CustomerSearchParams extends SearchParams {
  name?: string;
  phone?: string;
}

export interface Category {
  id: number;
  code: string; // DM0000001
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  code: string; // SP0000001
  name: string;
  categoryId: number;
  categoryName: string;
  unit: string; // kg, tấm, cây, ...
  price: number;
  description?: string;
  active: boolean;
}

export interface Customer {
  id: number;
  code: string; // KH0000001
  name: string;
  phone?: string;
  address?: string;
  hasDebt: boolean;
  totalDebt?: number; // chỉ có trong GET /customers/{id}
}

export interface Order {
  id: number;
  code: string; // HD0000001
  customerId: number;
  customerName: string;
  orderDate: string; // ISO date
  totalAmount: number;
  paidImmediately: number;
  remainingDebt: number; // totalAmount - paidImmediately
  note?: string;
  active: boolean;
  items?: OrderItem[]; // chỉ có trong GET /orders/{id}
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
  code: string; // CN0000001
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
  code: string; // TT0000001
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

// DTOs
export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
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

export interface UpdateProductDto {
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

export interface UpdateCustomerDto {
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
