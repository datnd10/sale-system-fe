import axios from 'axios';
import type { ApiResponse } from '../types';
import { getToken, removeToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/sale-system',
  timeout: 10000,
});

// Request interceptor: đính kèm JWT token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap ApiResponse<T>
apiClient.interceptors.response.use(
  (response) => {
    const apiResponse: ApiResponse<unknown> = response.data;
    if (!apiResponse.success) {
      return Promise.reject(new Error(apiResponse.message));
    }
    return apiResponse.data as never;
  },
  (error) => {
    // Nếu 401 → token hết hạn hoặc không hợp lệ → logout
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
      return Promise.reject(new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'));
    }

    const message: string =
      error.response?.data?.message ||
      (error.response?.status === 404
        ? 'Không tìm thấy dữ liệu'
        : 'Lỗi hệ thống, vui lòng thử lại sau');
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
