import apiClient from './axios';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

export const getProducts = (categoryId?: number): Promise<Product[]> =>
  apiClient.get('/api/products', {
    params: categoryId !== undefined ? { categoryId } : undefined,
  }).then(res => res.data);

export const createProduct = (data: CreateProductDto): Promise<Product> =>
  apiClient.post('/api/products', data).then(res => res.data);

export const updateProduct = (id: number, data: UpdateProductDto): Promise<Product> =>
  apiClient.put(`/api/products/${id}`, data).then(res => res.data);

export const deleteProduct = (id: number): Promise<void> =>
  apiClient.delete(`/api/products/${id}`).then(res => res.data);
