import type {
  OrderFilters, PaymentFilters,
  CategorySearchParams, ProductSearchParams, CustomerSearchParams,
} from '../types';

export const QUERY_KEYS = {
  categories: ['categories'] as const,
  categoriesSearch: (params: CategorySearchParams) => ['categories', 'search', params] as const,

  products: (categoryId?: number) => ['products', categoryId] as const,
  productsSearch: (params: ProductSearchParams) => ['products', 'search', params] as const,

  customers: ['customers'] as const,
  customersSearch: (params: CustomerSearchParams) => ['customers', 'search', params] as const,
  customer: (id: number) => ['customers', id] as const,

  orders: (filters?: OrderFilters) => ['orders', filters] as const,
  ordersSearch: (filters: OrderFilters) => ['orders', 'search', filters] as const,
  order: (id: number) => ['orders', id] as const,

  // Debts — chỉ còn 2 keys (bỏ search/paged)
  debts: ['debts'] as const,
  debtByCustomer: (customerId: number) => ['debts', 'customer', customerId] as const,

  payments: (filters?: PaymentFilters) => ['payments', filters] as const,
  paymentsSearch: (filters: PaymentFilters) => ['payments', 'search', filters] as const,
  paymentsByCustomer: (customerId: number) => ['payments', 'customer', customerId] as const,

  statistics: {
    revenue: (from: string, to: string) => ['statistics', 'revenue', from, to] as const,
    monthly: (year: number) => ['statistics', 'monthly', year] as const,
    debts: ['statistics', 'debts'] as const,
  },
} as const;
