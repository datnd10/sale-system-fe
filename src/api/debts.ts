import apiClient from './axios';
import type { DebtSummary, CustomerDebtDetail, DebtFilters, PageResponse } from '../types';

export const getDebts = (): Promise<DebtSummary[]> =>
  apiClient.get('/api/debts');

export const searchDebts = (filters: DebtFilters): Promise<PageResponse<DebtSummary>> => {
  const params: Record<string, string | number> = {
    page: filters.page ?? 0,
    size: filters.size ?? 10,
    sort: filters.sort ?? 'totalRemaining',
    direction: filters.direction ?? 'DESC',
  };
  if (filters.customerName) params.customerName = filters.customerName;
  return apiClient.get('/api/debts/search', { params });
};

export const getDebtsByCustomer = (customerId: number): Promise<CustomerDebtDetail> =>
  apiClient.get(`/api/debts/customer/${customerId}`);
