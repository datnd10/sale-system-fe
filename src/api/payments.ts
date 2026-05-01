import apiClient from './axios';
import type { Payment, PaymentFilters, PageResponse } from '../types';

/** Lấy tất cả payment, lọc theo khoảng ngày */
export const getPayments = (filters?: PaymentFilters): Promise<Payment[]> => {
  const params: Record<string, string> = {};
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  return apiClient.get('/api/payments', { params });
};

/** Tìm kiếm payment có phân trang */
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

/** Lịch sử thanh toán của một khách hàng */
export const getPaymentsByCustomer = (customerId: number): Promise<Payment[]> =>
  apiClient.get(`/api/payments/customer/${customerId}`);

// NOTE: createPayment đã bị bỏ — thanh toán chỉ tạo qua đơn hàng loại PAYMENT
