import apiClient from './axios';
import type { Payment, CreatePaymentDto, PaymentFilters } from '../types';

export const getPayments = (filters?: PaymentFilters): Promise<Payment[]> => {
  const params: Record<string, string> = {};
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  return apiClient.get('/api/payments', { params });
};

export const createPayment = (data: CreatePaymentDto): Promise<Payment> =>
  apiClient.post('/api/payments', data);
