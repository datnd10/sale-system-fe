import { useNavigate } from 'react-router-dom';
import { Button, Space, Table, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDebts } from '../../hooks/useDebts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { defaultPagination } from '../../utils/tableConfig';
import { formatCurrency } from '../../utils/formatters';
import type { DebtSummary } from '../../types';

const { Title, Text } = Typography;

const Debts = () => {
  const navigate = useNavigate();
  const { data: debts, isLoading, error } = useDebts();

  const columns: ColumnsType<DebtSummary> = [
    {
      title: 'Mã KH',
      dataIndex: 'customerCode',
      key: 'customerCode',
      width: 140,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'SĐT',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      render: (phone?: string) => phone ?? '—',
    },
    {
      title: 'Tổng nợ còn lại',
      dataIndex: 'totalDebt',
      key: 'totalDebt',
      align: 'right',
      render: (totalDebt: number) => (
        <Text style={{ color: totalDebt > 0 ? '#ff4d4f' : undefined }}>
          {formatCurrency(totalDebt)}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="large"
            onClick={() => navigate(`/customers/${record.customerId}`)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Không thể tải danh sách công nợ"
        description={(error as Error).message}
      />
    );
  }

  const debtList = debts ?? [];

  if (debtList.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          Công nợ khách hàng
        </Title>
        <EmptyState description="Không có khách hàng nào đang nợ" />
      </div>
    );
  }

  const totalAllDebts = debtList.reduce((sum, item) => sum + item.totalDebt, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Công nợ khách hàng
      </Title>

      <Table<DebtSummary>
        dataSource={debtList}
        columns={columns}
        rowKey="customerId"
        pagination={defaultPagination}
        size="middle"
        style={{ fontSize: 16 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}>
              <Text strong>Tổng cộng</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <Text strong style={{ color: totalAllDebts > 0 ? '#ff4d4f' : undefined }}>
                {formatCurrency(totalAllDebts)}
              </Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} />
          </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default Debts;
