import apiClient from './axios';
import type { Order, CreateOrderDto, OrderFilters, PageResponse } from '../types';

export const getOrders = (filters?: OrderFilters): Promise<Order[]> => {
  const params: Record<string, string | number> = {};
  if (filters?.customerId !== undefined) params.customerId = filters.customerId;
  if (filters?.orderType) params.orderType = filters.orderType;
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  return apiClient.get('/api/orders', { params });
};

export const searchOrders = (filters: OrderFilters): Promise<PageResponse<Order>> => {
  const params: Record<string, string | number> = {
    page: filters.page ?? 0,
    size: filters.size ?? 10,
    sort: filters.sort ?? 'orderDate',
    direction: filters.direction ?? 'DESC',
  };
  if (filters.customerId !== undefined) params.customerId = filters.customerId;
  if (filters.orderType) params.orderType = filters.orderType;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  return apiClient.get('/api/orders/search', { params });
};

export const getOrderById = (id: number): Promise<Order> =>
  apiClient.get(`/api/orders/${id}`);

export const createOrder = (data: CreateOrderDto): Promise<Order> =>
  apiClient.post('/api/orders', data);

export const updateOrder = (id: number, data: CreateOrderDto): Promise<Order> =>
  apiClient.put(`/api/orders/${id}`, data);

export const updateOrderNote = (id: number, note: string): Promise<Order> =>
  apiClient.patch(`/api/orders/${id}/note`, { note });

export const deleteOrder = (id: number): Promise<void> =>
  apiClient.delete(`/api/orders/${id}`);
