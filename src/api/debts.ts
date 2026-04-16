import apiClient from './axios';
import type { Debt, DebtSummary } from '../types';

export const getDebts = (): Promise<DebtSummary[]> =>
  apiClient.get('/api/debts');

export const getDebtsByCustomer = (customerId: number): Promise<Debt[]> =>
  apiClient.get(`/api/debts/customer/${customerId}`);
