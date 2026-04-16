import apiClient from './axios';
import type { DebtSummary, CustomerDebtDetail } from '../types';

export const getDebts = (): Promise<DebtSummary[]> =>
  apiClient.get('/api/debts');

export const getDebtsByCustomer = (customerId: number): Promise<CustomerDebtDetail> =>
  apiClient.get(`/api/debts/customer/${customerId}`);
