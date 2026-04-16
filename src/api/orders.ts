import apiClient from './axios';
import type { Order, CreateOrderDto, OrderFilters } from '../types';

export const getOrders = (filters?: OrderFilters): Promise<Order[]> => {
  const params: Record<string, string | number> = {};
  if (filters?.customerId !== undefined) params.customerId = filters.customerId;
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  return apiClient.get('/api/orders', { params });
};

export const getOrderById = (id: number): Promise<Order> =>
  apiClient.get(`/api/orders/${id}`);

export const createOrder = (data: CreateOrderDto): Promise<Order> =>
  apiClient.post('/api/orders', data);

export const deleteOrder = (id: number): Promise<void> =>
  apiClient.delete(`/api/orders/${id}`);

export const updateOrderNote = (id: number, note: string): Promise<Order> =>
  apiClient.patch(`/api/orders/${id}/note`, { note });

export const updateOrder = (id: number, data: CreateOrderDto): Promise<Order> =>
  apiClient.put(`/api/orders/${id}`, data);
