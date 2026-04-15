import apiClient from './axios';
import type { RevenueStatistics, MonthlyRevenue, DebtSummary } from '../types';

export const getRevenueStatistics = (from: string, to: string): Promise<RevenueStatistics> =>
  apiClient.get('/api/statistics/revenue', { params: { from, to } });

export const getMonthlyRevenue = (year: number): Promise<MonthlyRevenue[]> =>
  apiClient.get('/api/statistics/revenue/monthly', { params: { year } });

export const getDebtSummary = (): Promise<DebtSummary[]> =>
  apiClient.get('/api/statistics/debts');
