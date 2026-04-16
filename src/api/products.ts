import apiClient from './axios';
import type { Product, CreateProductDto, UpdateProductDto, PageResponse, ProductSearchParams } from '../types';

export const getProducts = (categoryId?: number): Promise<Product[]> =>
  apiClient.get('/api/products', {
    params: categoryId !== undefined ? { categoryId } : undefined,
  });

export const searchProducts = (params: ProductSearchParams): Promise<PageResponse<Product>> =>
  apiClient.get('/api/products/search', { params });

export const createProduct = (data: CreateProductDto): Promise<Product> =>
  apiClient.post('/api/products', data);

export const updateProduct = (id: number, data: UpdateProductDto): Promise<Product> =>
  apiClient.put(`/api/products/${id}`, data);

export const deleteProduct = (id: number): Promise<void> =>
  apiClient.delete(`/api/products/${id}`);
