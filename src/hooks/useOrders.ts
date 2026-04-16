import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { QUERY_KEYS } from '../utils/queryKeys';
import {
  getOrders,
  getOrderById,
  createOrder,
  deleteOrder,
  updateOrderNote,
  updateOrder,
} from '../api/orders';
import type { CreateOrderDto, OrderFilters } from '../types';
export const useOrders = (filters?: OrderFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.orders(filters),
    queryFn: () => getOrders(filters),
  });

export const useOrderById = (id: number) =>
  useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
      notification.success({ message: 'Tạo đơn hàng thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: 'Lỗi', description: error.message });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notification.success({ message: 'Xóa đơn hàng thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: 'Lỗi', description: error.message });
    },
  });
};

export const useUpdateOrderNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => updateOrderNote(id, note),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(variables.id) });
      notification.success({ message: 'Cập nhật ghi chú thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: 'Lỗi', description: error.message });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateOrderDto }) => updateOrder(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notification.success({ message: 'Cập nhật đơn hàng thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: 'Lỗi', description: error.message });
    },
  });
};
