import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { QUERY_KEYS } from '../utils/queryKeys';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categories';
import type { UpdateCategoryDto } from '../types';

export const useCategories = () =>
  useQuery({ queryKey: QUERY_KEYS.categories, queryFn: getCategories });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      notification.success({ message: 'Thêm danh mục thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      notification.success({ message: 'Cập nhật danh mục thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      notification.success({ message: 'Xóa danh mục thành công' });
    },
    onError: (error: Error) => {
      notification.error({ message: error.message });
    },
  });
};
