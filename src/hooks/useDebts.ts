import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../utils/queryKeys';
import { getDebts, searchDebts, getDebtsByCustomer } from '../api/debts';
import type { DebtFilters } from '../types';

export const useDebts = () =>
  useQuery({ queryKey: QUERY_KEYS.debts, queryFn: getDebts });

export const useSearchDebts = (filters: DebtFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.debtsSearch(filters),
    queryFn: () => searchDebts(filters),
  });

export const useDebtsByCustomer = (customerId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.debtsByCustomer(customerId),
    queryFn: () => getDebtsByCustomer(customerId),
    enabled: !!customerId,
  });
