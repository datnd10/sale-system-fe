import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { QUERY_KEYS } from '../utils/queryKeys';
import { getPayments, createPayment } from '../api/payments';
import type { PaymentFilters } from '../types';

export const usePayments = (filters?: PaymentFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.payments(filters),
    queryFn: () => getPayments(filters),
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notification.success({ message: 'Ghi nhận thanh toán thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: 'Lỗi', description: error.message });
    },
  });
};
