import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../utils/queryKeys';
import { getDebts, getDebtByCustomer } from '../api/debts';

export const useDebts = () =>
  useQuery({ queryKey: QUERY_KEYS.debts, queryFn: getDebts });

export const useDebtByCustomer = (customerId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.debtByCustomer(customerId),
    queryFn: () => getDebtByCustomer(customerId),
    enabled: !!customerId,
  });
