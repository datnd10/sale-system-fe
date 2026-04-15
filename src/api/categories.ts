import apiClient from './axios';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const getCategories = (): Promise<Category[]> =>
  apiClient.get('/api/categories').then(res => res.data);

export const createCategory = (data: CreateCategoryDto): Promise<Category> =>
  apiClient.post('/api/categories', data).then(res => res.data);

export const updateCategory = (id: number, data: UpdateCategoryDto): Promise<Category> =>
  apiClient.put(`/api/categories/${id}`, data).then(res => res.data);

export const deleteCategory = (id: number): Promise<void> =>
  apiClient.delete(`/api/categories/${id}`).then(res => res.data);
