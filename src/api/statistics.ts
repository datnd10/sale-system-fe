import apiClient from './axios';
import type { RevenueStatistics, DebtSummary, MonthlyRevenueResponse } from '../types';

export const getRevenueStatistics = (from: string, to: string): Promise<RevenueStatistics> =>
  apiClient.get('/api/statistics/revenue', { params: { from, to } });

export const getMonthlyRevenue = (year: number): Promise<MonthlyRevenueResponse> =>
  apiClient.get('/api/statistics/revenue/monthly', { params: { year } });

export const getDebtSummary = (): Promise<DebtSummary[]> =>
  apiClient.get('/api/statistics/debts');
