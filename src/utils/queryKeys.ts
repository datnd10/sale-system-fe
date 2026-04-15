import type { OrderFilters, PaymentFilters } from '../types';

export const QUERY_KEYS = {
  // Categories
  categories: ['categories'] as const,

  // Products
  products: (categoryId?: number) => ['products', categoryId] as const,

  // Customers
  customers: ['customers'] as const,
  customer: (id: number) => ['customers', id] as const,

  // Orders
  orders: (filters?: OrderFilters) => ['orders', filters] as const,
  order: (id: number) => ['orders', id] as const,

  // Debts
  debts: ['debts'] as const,
  debtsByCustomer: (customerId: number) => ['debts', 'customer', customerId] as const,

  // Payments
  payments: (filters?: PaymentFilters) => ['payments', filters] as const,

  // Statistics
  statistics: {
    revenue: (from: string, to: string) => ['statistics', 'revenue', from, to] as const,
    monthly: (year: number) => ['statistics', 'monthly', year] as const,
    debts: ['statistics', 'debts'] as const,
  },
} as const;
