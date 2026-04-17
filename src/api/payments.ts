import apiClient from './axios';
import type { Payment, CreatePaymentDto, PaymentFilters, PageResponse } from '../types';

export const getPayments = (filters?: PaymentFilters): Promise<Payment[]> => {
  const params: Record<string, string> = {};
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  return apiClient.get('/api/payments', { params });
};

export const searchPayments = (filters: PaymentFilters): Promise<PageResponse<Payment>> => {
  const params: Record<string, string | number> = {
    page: filters.page ?? 0,
    size: filters.size ?? 10,
    sort: filters.sort ?? 'paymentDate',
    direction: filters.direction ?? 'DESC',
  };
  if (filters.customerName) params.customerName = filters.customerName;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  return apiClient.get('/api/payments/search', { params });
};

export const createPayment = (data: CreatePaymentDto): Promise<Payment> =>
  apiClient.post('/api/payments', data);
