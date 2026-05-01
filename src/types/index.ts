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

// Search params dùng chung
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

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProductUnit = 'KG' | 'TAN' | 'CAY' | 'MET' | 'CAI' | 'M2';

export const PRODUCT_UNIT_OPTIONS: { value: ProductUnit; label: string; description: string }[] = [
  // { value: 'KG',  label: 'kg',  description: 'Kilogram' },
  // { value: 'TAN', label: 'tấn', description: 'Tấn' },
  // { value: 'CAY', label: 'cây', description: 'Cây / thanh' },
  { value: 'MET', label: 'm',   description: 'Mét' },
  { value: 'CAI', label: 'cái', description: 'Cái' },
  { value: 'M2',  label: 'm²',  description: 'Mét vuông' },
];

/** Loại đơn hàng — khớp với BE enum OrderType */
export type OrderType = 'SALE' | 'PAYMENT';

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  SALE: 'Bán hàng',
  PAYMENT: 'Trả nợ',
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
  unit: ProductUnit;
  price: number;
  width?: number;
  description?: string;
  active: boolean;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone?: string;
  address?: string;
  hasDebt: boolean;
  /** Tổng nợ hiện tại — chỉ có trong GET /customers/{id} */
  totalDebt?: number;
}

export interface Order {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  /** SALE = bán hàng, PAYMENT = trả nợ */
  orderType: OrderType;
  orderDate: string;
  totalAmount: number;
  paidImmediately: number;
  note?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  /** Chỉ có trong GET /orders/{id}, chỉ có với SALE */
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productUnit: ProductUnit;
  count: number;
  length?: number;
  width?: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  /** ID đơn hàng tạo ra payment này */
  orderId?: number;
  orderCode?: string;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface RevenueStatistics {
  totalOrders: number;
  totalRevenue: number;
  /** Tổng đã thu = Σ Payment.amount */
  totalCollected: number;
  totalDebt: number;
}

/** Response từ /api/statistics/debts */
export interface DebtSummary {
  customerId: number;
  customerCode: string;
  customerName: string;
  remainingDebt: number;
}

/** Response từ /api/statistics/revenue/monthly */
export interface MonthlyRevenueResponse {
  year: number;
  monthlyRevenue: number[];
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

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

export interface UpdateProductDto extends CreateProductDto {}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerDto extends CreateCustomerDto {}

export interface CreateOrderItemDto {
  productId: number;
  count: number;
  length?: number;
  width?: number;
  unitPrice: number;
}

/** DTO tạo đơn hàng — dùng cho cả SALE và PAYMENT */
export interface CreateOrderDto {
  customerId: number;
  orderType: OrderType;
  orderDate: string;
  note?: string;
  /** Chỉ dùng cho SALE */
  items?: CreateOrderItemDto[];
  /** Chỉ dùng cho SALE — số tiền trả ngay khi mua */
  paidImmediately?: number;
  /** Chỉ dùng cho PAYMENT — số tiền trả nợ */
  amount?: number;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface OrderFilters extends SearchParams {
  customerId?: number;
  orderType?: OrderType;
  from?: string;
  to?: string;
}

export interface PaymentFilters extends SearchParams {
  from?: string;
  to?: string;
  customerName?: string;
}

export interface DebtFilters extends SearchParams {
  customerName?: string;
}
