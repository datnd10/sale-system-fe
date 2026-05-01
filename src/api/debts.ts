import apiClient from './axios';
import type { DebtSummary, Customer } from '../types';

/** Danh sách khách hàng còn nợ, sắp xếp giảm dần */
export const getDebts = (): Promise<DebtSummary[]> =>
  apiClient.get('/api/debts');

/** Công nợ chi tiết của một khách hàng (trả về CustomerResponse với totalDebt) */
export const getDebtByCustomer = (customerId: number): Promise<Customer> =>
  apiClient.get(`/api/debts/customer/${customerId}`);

// NOTE: /api/debts/search đã bị bỏ — dùng /api/debts thay thế
