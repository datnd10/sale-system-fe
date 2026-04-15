import axios from 'axios';
import type { ApiResponse } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/sale-system',
  timeout: 10000,
});

// Response interceptor: unwrap ApiResponse<T>
apiClient.interceptors.response.use(
  (response) => {
    console.log(response);
    
    const apiResponse: ApiResponse<unknown> = response.data;
    if (!apiResponse.success) {
      return Promise.reject(new Error(apiResponse.message));
    }
    response.data = apiResponse.data;
    return response;
  },
  (error) => {
    // Network error or HTTP error status
    const message =
      error.response?.data?.message ||
      (error.response?.status === 404
        ? 'Không tìm thấy dữ liệu'
        : 'Lỗi hệ thống, vui lòng thử lại sau');
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
