import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Space, Table, Typography } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useSearchDebts } from '../../hooks/useDebts';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import type { DebtSummaryPaged, DebtFilters } from '../../types';

const { Title, Text } = Typography;
const DEFAULT_PAGE_SIZE = 10;

const Debts = () => {
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState('');
  const [filters, setFilters] = useState<DebtFilters>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: 'totalRemaining',
    direction: 'DESC',
  });

  const { data: pageData, isLoading, error } = useSearchDebts(filters);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, customerName: nameInput.trim() || undefined, page: 0 }));
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setFilters((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
    }));
  };

  const columns: ColumnsType<DebtSummaryPaged> = [
    { title: 'Mã KH', dataIndex: 'customerCode', key: 'customerCode', width: 140 },
    { title: 'Tên khách hàng', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone',
      render: (phone?: string) => phone ?? '—',
    },
    {
      title: 'Tổng nợ còn lại', dataIndex: 'totalRemaining', key: 'totalRemaining', align: 'right',
      render: (totalRemaining: number) => (
        <Text style={{ color: totalRemaining > 0 ? '#ff4d4f' : undefined }}>
          {formatCurrency(Number(totalRemaining) || 0)}
        </Text>
      ),
    },
    {
      title: 'Thao tác', key: 'actions', width: 160,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} size="large" onClick={() => navigate(`/customers/${record.customerId}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (error) {
    return <ErrorMessage message="Không thể tải danh sách công nợ" description={(error as Error).message} />;
  }

  const debtList = pageData?.content ?? [];
  const totalAllDebts = debtList.reduce((sum, item) => sum + (Number(item.totalRemaining) || 0), 0);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>Công nợ khách hàng</Title>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên khách hàng..."
          prefix={<SearchOutlined />}
          size="large"
          allowClear
          style={{ width: 280 }}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button type="primary" icon={<SearchOutlined />} size="large" onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </Space>

      {!isLoading && debtList.length === 0 && !filters.customerName ? (
        <EmptyState description="Không có khách hàng nào đang nợ" />
      ) : (
        <Table<DebtSummaryPaged>
          dataSource={debtList}
          columns={columns}
          rowKey="customerId"
          loading={isLoading}
          size="middle"
          style={{ fontSize: 16 }}
          locale={{ emptyText: filters.customerName ? 'Không tìm thấy khách hàng nào' : 'Không có khách hàng nào đang nợ' }}
          pagination={{
            current: (filters.page ?? 0) + 1,
            pageSize: filters.size ?? DEFAULT_PAGE_SIZE,
            total: pageData?.totalElements ?? 0,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi`,
          }}
          onChange={handleTableChange}
          summary={() => {
            if (debtList.length === 0) return null;
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Tổng cộng (trang này)</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: totalAllDebts > 0 ? '#ff4d4f' : undefined }}>
                    {formatCurrency(totalAllDebts)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            );
          }}
        />
      )}
    </div>
  );
};

export default Debts;
