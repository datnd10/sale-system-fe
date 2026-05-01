import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Space, Table, Typography } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDebts } from '../../hooks/useDebts';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import type { DebtSummary } from '../../types';

const { Title, Text } = Typography;

const Debts = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: allDebts, isLoading, error } = useDebts();

  // Filter client-side (danh sách thường không quá lớn)
  const filtered = (allDebts ?? []).filter((d) =>
    !search.trim() || d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalAllDebts = filtered.reduce((sum, item) => sum + (Number(item.remainingDebt) || 0), 0);

  const columns: ColumnsType<DebtSummary> = [
    { title: 'Mã KH', dataIndex: 'customerCode', key: 'customerCode', width: 140 },
    { title: 'Tên khách hàng', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'Tổng nợ còn lại', dataIndex: 'remainingDebt', key: 'remainingDebt', align: 'right',
      render: (debt: number) => (
        <Text strong style={{ color: debt > 0 ? '#ff4d4f' : undefined }}>
          {formatCurrency(Number(debt) || 0)}
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Công nợ khách hàng</Title>
        <Button type="primary" size="large" onClick={() => navigate('/orders/new')}>
          + Ghi nhận trả nợ
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên khách hàng..."
          prefix={<SearchOutlined />}
          size="large"
          allowClear
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Space>

      {!isLoading && filtered.length === 0 && !search ? (
        <EmptyState description="Không có khách hàng nào đang nợ" />
      ) : (
        <Table<DebtSummary>
          dataSource={filtered}
          columns={columns}
          rowKey="customerId"
          loading={isLoading}
          size="middle"
          style={{ fontSize: 16 }}
          locale={{ emptyText: search ? 'Không tìm thấy khách hàng nào' : 'Không có khách hàng nào đang nợ' }}
          pagination={{ pageSize: 20, hideOnSinglePage: true, showTotal: (total) => `${total} khách hàng` }}
          summary={() => {
            if (filtered.length === 0) return null;
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>Tổng cộng</Text>
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
