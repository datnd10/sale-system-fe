import apiClient from './axios';
import type { Customer, CreateCustomerDto, UpdateCustomerDto, PageResponse, CustomerSearchParams } from '../types';

export const getCustomers = (): Promise<Customer[]> =>
  apiClient.get('/api/customers');

export const searchCustomers = (params: CustomerSearchParams): Promise<PageResponse<Customer>> =>
  apiClient.get('/api/customers/search', { params });

export const getCustomerById = (id: number): Promise<Customer> =>
  apiClient.get(`/api/customers/${id}`);

export const createCustomer = (data: CreateCustomerDto): Promise<Customer> =>
  apiClient.post('/api/customers', data);

export const updateCustomer = (id: number, data: UpdateCustomerDto): Promise<Customer> =>
  apiClient.put(`/api/customers/${id}`, data);
