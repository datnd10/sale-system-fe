import apiClient from './axios';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '../types';

export const getCustomers = (): Promise<Customer[]> =>
  apiClient.get('/api/customers').then(res => res.data);

export const getCustomerById = (id: number): Promise<Customer> =>
  apiClient.get(`/api/customers/${id}`).then(res => res.data);

export const createCustomer = (data: CreateCustomerDto): Promise<Customer> =>
  apiClient.post('/api/customers', data).then(res => res.data);

export const updateCustomer = (id: number, data: UpdateCustomerDto): Promise<Customer> =>
  apiClient.put(`/api/customers/${id}`, data).then(res => res.data);
