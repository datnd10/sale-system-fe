import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { QUERY_KEYS } from '../utils/queryKeys';
import {
  getCustomers,
  searchCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '../api/customers';
import type { CreateCustomerDto, CustomerSearchParams, UpdateCustomerDto } from '../types';

export const useCustomers = () =>
  useQuery({ queryKey: QUERY_KEYS.customers, queryFn: getCustomers });

export const useSearchCustomers = (params: CustomerSearchParams) =>
  useQuery({
    queryKey: QUERY_KEYS.customersSearch(params),
    queryFn: () => searchCustomers(params),
  });

export const useCustomerById = (id: number) =>
  useQuery({ queryKey: QUERY_KEYS.customer(id), queryFn: () => getCustomerById(id) });

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      queryClient.invalidateQueries({ queryKey: ['customers', 'search'] });
      notification.success({ message: 'Thêm khách hàng thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerDto }) =>
      updateCustomer(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      queryClient.invalidateQueries({ queryKey: ['customers', 'search'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customer(variables.id) });
      notification.success({ message: 'Cập nhật khách hàng thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};
