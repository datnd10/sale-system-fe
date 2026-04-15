import apiClient from './axios';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const getCategories = (): Promise<Category[]> =>
  apiClient.get('/api/categories');

export const createCategory = (data: CreateCategoryDto): Promise<Category> =>
  apiClient.post('/api/categories', data);

export const updateCategory = (id: number, data: UpdateCategoryDto): Promise<Category> =>
  apiClient.put(`/api/categories/${id}`, data);

export const deleteCategory = (id: number): Promise<void> =>
  apiClient.delete(`/api/categories/${id}`);
