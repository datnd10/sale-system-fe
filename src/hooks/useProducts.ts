import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { QUERY_KEYS } from '../utils/queryKeys';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products';
import type { UpdateProductDto } from '../types';

export const useProducts = (categoryId?: number) =>
  useQuery({
    queryKey: QUERY_KEYS.products(categoryId),
    queryFn: () => getProducts(categoryId),
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notification.success({ message: 'Thêm sản phẩm thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notification.success({ message: 'Cập nhật sản phẩm thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notification.success({ message: 'Xóa sản phẩm thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};
