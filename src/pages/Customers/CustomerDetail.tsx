import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Table, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCustomerById } from '../../hooks/useCustomers';
import { useDebtsByCustomer } from '../../hooks/useDebts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency, formatDate, formatValue } from '../../utils/formatters';
import { defaultPagination } from '../../utils/tableConfig';
import type { Debt } from '../../types';

const { Title, Text } = Typography;

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = Number(id);

  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useCustomerById(customerId);

  const {
    data: debtDetail,
    isLoading: isLoadingDebts,
    error: debtsError,
  } = useDebtsByCustomer(customerId);

  const isLoading = isLoadingCustomer || isLoadingDebts;
  const error = customerError || debtsError;

  const debts = debtDetail?.debts ?? [];
  const totalDebt = debtDetail?.totalRemaining ?? 0;

  const debtColumns: ColumnsType<Debt> = [
    {
      title: 'Mã nợ',
      dataIndex: 'debtCode',
      key: 'debtCode',
      width: 140,
    },
    {
      title: 'Mã đơn hàng',
      key: 'orderCode',
      width: 140,
      render: (_, record) =>
        record.orderId ? (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => navigate(`/orders/${record.orderId}`)}
          >
            {record.orderCode}
          </Button>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Số tiền gốc',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Còn lại',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: amount > 0 ? '#cf1322' : '#52c41a', fontWeight: 600 }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => formatDate(date),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <ErrorMessage
        message="Không thể tải thông tin khách hàng"
        description={(error as Error).message}
      />
    );
  }

  if (!customer) {
    return (
      <ErrorMessage
        message="Không tìm thấy khách hàng"
        description="Khách hàng không tồn tại hoặc đã bị xóa."
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate('/customers')}>
          Quay lại
        </Button>
      </div>

      <Title level={2} style={{ marginBottom: 24 }}>
        Chi tiết khách hàng
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions
          title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thông tin khách hàng</span>}
          bordered
          column={2}
          size="middle"
          labelStyle={{ fontSize: 15, fontWeight: 500 }}
          contentStyle={{ fontSize: 15 }}
        >
          <Descriptions.Item label="Mã khách hàng">{customer.code}</Descriptions.Item>
          <Descriptions.Item label="Tên khách hàng">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{formatValue(customer.phone)}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{formatValue(customer.address)}</Descriptions.Item>
          <Descriptions.Item label="Tổng công nợ hiện tại" span={2}>
            <Text
              style={{
                color: totalDebt > 0 ? '#cf1322' : '#52c41a',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {formatCurrency(totalDebt)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          Chi tiết công nợ
        </Title>
        <Table<Debt>
          dataSource={debts}
          columns={debtColumns}
          rowKey="debtId"
          pagination={defaultPagination}
          size="middle"
          style={{ fontSize: 16 }}
          locale={{ emptyText: 'Không có khoản nợ nào' }}
          summary={() => {
            if (debts.length === 0) return null;
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Tổng còn lại</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: totalDebt > 0 ? '#cf1322' : '#52c41a' }}>
                    {formatCurrency(totalDebt)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default CustomerDetail;
