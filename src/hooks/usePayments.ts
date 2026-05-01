import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../utils/queryKeys';
import { getPayments, searchPayments, getPaymentsByCustomer } from '../api/payments';
import type { PaymentFilters } from '../types';

export const usePayments = (filters?: PaymentFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.payments(filters),
    queryFn: () => getPayments(filters),
  });

export const useSearchPayments = (filters: PaymentFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.paymentsSearch(filters),
    queryFn: () => searchPayments(filters),
  });

export const usePaymentsByCustomer = (customerId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.paymentsByCustomer(customerId),
    queryFn: () => getPaymentsByCustomer(customerId),
    enabled: !!customerId,
  });

// NOTE: useCreatePayment đã bị bỏ — thanh toán chỉ tạo qua đơn hàng loại PAYMENT
