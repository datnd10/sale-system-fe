import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../utils/queryKeys';
import { getRevenueStatistics, getMonthlyRevenue, getDebtSummary } from '../api/statistics';

export const useRevenueStatistics = (from: string, to: string) =>
  useQuery({
    queryKey: QUERY_KEYS.statistics.revenue(from, to),
    queryFn: () => getRevenueStatistics(from, to),
  });

export const useMonthlyRevenue = (year: number) =>
  useQuery({
    queryKey: QUERY_KEYS.statistics.monthly(year),
    queryFn: () => getMonthlyRevenue(year),
  });

export const useDebtSummary = () =>
  useQuery({
    queryKey: QUERY_KEYS.statistics.debts,
    queryFn: getDebtSummary,
  });
