import apiClient from './axios';
import type { RevenueStatistics, MonthlyRevenue, DebtSummary } from '../types';

export const getRevenueStatistics = (from: string, to: string): Promise<RevenueStatistics> =>
  apiClient.get('/api/statistics/revenue', { params: { from, to } }).then(res => res.data);

export const getMonthlyRevenue = (year: number): Promise<MonthlyRevenue[]> =>
  apiClient.get('/api/statistics/revenue/monthly', { params: { year } }).then(res => res.data);

export const getDebtSummary = (): Promise<DebtSummary[]> =>
  apiClient.get('/api/statistics/debts').then(res => res.data);
