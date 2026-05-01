import type { TablePaginationConfig } from 'antd';

/**
 * Cấu hình pagination dùng chung cho tất cả Table trong ứng dụng.
 * - Cho phép chọn số bản ghi mỗi trang: 10, 20, 50, 100
 * - Hiển thị tổng số bản ghi
 * - Hiển thị ô nhảy trang nhanh khi có nhiều trang
 */
export const defaultPagination: TablePaginationConfig = {
  defaultPageSize: 20,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) =>
    `${range[0]}–${range[1]} / ${total} bản ghi`,
  size: 'small' as const,
};
