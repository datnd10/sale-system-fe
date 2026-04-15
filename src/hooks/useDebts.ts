import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../utils/queryKeys';
import { getDebts, getDebtsByCustomer } from '../api/debts';

export const useDebts = () =>
  useQuery({ queryKey: QUERY_KEYS.debts, queryFn: getDebts });

export const useDebtsByCustomer = (customerId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.debtsByCustomer(customerId),
    queryFn: () => getDebtsByCustomer(customerId),
  });
