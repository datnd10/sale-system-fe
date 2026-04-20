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
  unit: string;       // enum key: KG, TAN, CAY, MET, CAI, M2
  price: number;
  width?: number;     // chiều rộng mặc định (tùy chọn)
  description?: string;
  active: boolean;
}

// Enum ProductUnit — phải khớp với BE
export type ProductUnit = 'KG' | 'TAN' | 'CAY' | 'MET' | 'CAI' | 'M2';

export const PRODUCT_UNIT_OPTIONS: { value: ProductUnit; label: string; description: string }[] = [
  { value: 'KG',  label: 'kg',  description: 'Kilogram' },
  { value: 'TAN', label: 'tấn', description: 'Tấn' },
  { value: 'CAY', label: 'cây', description: 'Cây / thanh' },
  { value: 'MET', label: 'm',   description: 'Mét' },
  { value: 'CAI', label: 'cái', description: 'Cái' },
  { value: 'M2',  label: 'm²',  description: 'Mét vuông' },
];

export interface Customer {
  id: number;
  code: string; // KH0000001
  name: string;
  phone?: string;
  address?: string;
  hasDebt: boolean;
  totalDebt?: number; // tổng nợ còn lại, có trong GET /customers/{id}
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
  productUnit: string; // enum key: KG, TAN, CAY, MET, CAI, M2
  unit: string;
  count: number;
  length?: number;
  width?: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Debt {
  debtId: number;
  debtCode: string;
  orderId?: number;
  orderCode?: string;
  originalAmount: number;
  remainingAmount: number;
  createdAt: string;
}

export interface CustomerDebtDetail {
  customerId: number;
  customerCode: string;
  customerName: string;
  totalRemaining: number;
  debts: Debt[];
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

// Response từ /api/statistics/debts
export interface DebtSummary {
  customerId: number;
  customerCode: string;
  customerName: string;
  remainingDebt: number; // field từ /api/statistics/debts
}

// Response từ /api/debts/search (phân trang)
export interface DebtSummaryPaged {
  customerId: number;
  customerCode: string;
  customerName: string;
  customerPhone?: string;
  totalRemaining: number;
}

// Response từ /api/statistics/revenue/monthly
export interface MonthlyRevenueResponse {
  year: number;
  monthlyRevenue: number[]; // 12 phần tử, index 0 = tháng 1
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
  unit: ProductUnit;
  price: number;
  width?: number;
  description?: string;
}

export interface UpdateProductDto {
  name: string;
  categoryId: number;
  unit: ProductUnit;
  price: number;
  width?: number;
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
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PaymentFilters {
  from?: string;
  to?: string;
  customerName?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface DebtFilters {
  customerName?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}
