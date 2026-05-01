import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Table, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCustomerById } from '../../hooks/useCustomers';
import { useDebtByCustomer } from '../../hooks/useDebts';
import { usePaymentsByCustomer } from '../../hooks/usePayments';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency, formatDate, formatValue } from '../../utils/formatters';
import { defaultPagination } from '../../utils/tableConfig';
import type { Payment, Order, OrderType } from '../../types';
import { ORDER_TYPE_LABELS } from '../../types';

const { Title, Text } = Typography;

const orderTypeColor: Record<OrderType, string> = {
  SALE: 'blue',
  PAYMENT: 'green',
};

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = Number(id);

  const { data: customer, isLoading: loadingCustomer, error: customerError } = useCustomerById(customerId);
  const { data: debtInfo, isLoading: loadingDebt } = useDebtByCustomer(customerId);
  const { data: payments, isLoading: loadingPayments } = usePaymentsByCustomer(customerId);
  const { data: orders, isLoading: loadingOrders } = useOrders({ customerId });

  const isLoading = loadingCustomer || loadingDebt || loadingPayments || loadingOrders;
  const totalDebt = debtInfo?.totalDebt ?? customer?.totalDebt ?? 0;

  const paymentColumns: ColumnsType<Payment> = [
    { title: 'Mã TT', dataIndex: 'code', key: 'code', width: 140 },
    {
      title: 'Đơn hàng', key: 'orderCode', width: 140,
      render: (_, record) =>
        record.orderId ? (
          <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/orders/${record.orderId}`)}>
            {record.orderCode}
          </Button>
        ) : '—',
    },
    {
      title: 'Số tiền', dataIndex: 'amount', key: 'amount', align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Ngày', dataIndex: 'paymentDate', key: 'paymentDate', width: 130,
      render: (date: string) => formatDate(date),
    },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', render: (note?: string) => note ?? '—' },
  ];

  const orderColumns: ColumnsType<Order> = [
    { title: 'Mã đơn', dataIndex: 'code', key: 'code', width: 140,
      render: (code: string, record) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/orders/${record.id}`)}>
          {code}
        </Button>
      ),
    },
    {
      title: 'Loại', dataIndex: 'orderType', key: 'orderType', width: 110,
      render: (type: OrderType) => (
        <Tag color={orderTypeColor[type]}>{ORDER_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: 'Ngày', dataIndex: 'orderDate', key: 'orderDate', width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right',
      render: (amount: number, record) => (
        <Text strong style={{ color: record.orderType === 'PAYMENT' ? '#52c41a' : '#1677ff' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Đã trả ngay', dataIndex: 'paidImmediately', key: 'paidImmediately', align: 'right',
      render: (amount: number, record) =>
        record.orderType === 'SALE'
          ? <Text style={{ color: '#52c41a' }}>{formatCurrency(amount)}</Text>
          : <Text style={{ color: '#aaa' }}>—</Text>,
    },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', render: (note?: string) => note ?? '—' },
  ];

  if (isLoading) return <LoadingSpinner />;

  if (customerError) {
    return <ErrorMessage message="Không thể tải thông tin khách hàng" description={(customerError as Error).message} />;
  }

  if (!customer) {
    return <ErrorMessage message="Không tìm thấy khách hàng" description="Khách hàng không tồn tại hoặc đã bị xóa." />;
  }

  // Sắp xếp đơn hàng mới nhất trước (theo createdAt)
  const sortedOrders = [...(orders ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate('/customers')}>
          Quay lại
        </Button>
      </div>

      <Title level={2} style={{ marginBottom: 24 }}>Chi tiết khách hàng</Title>

      {/* Thông tin khách hàng */}
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
            <Text style={{ color: totalDebt > 0 ? '#cf1322' : '#52c41a', fontWeight: 600, fontSize: 16 }}>
              {formatCurrency(Number(totalDebt) || 0)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Lịch sử đơn hàng */}
      <Card
        style={{ marginBottom: 24 }}
        title={<span style={{ fontSize: 16, fontWeight: 600 }}>Lịch sử đơn hàng</span>}
        extra={
          <Button type="primary" onClick={() => navigate('/orders/new')}>
            + Tạo đơn hàng
          </Button>
        }
      >
        <Table<Order>
          dataSource={sortedOrders}
          columns={orderColumns}
          rowKey="id"
          pagination={defaultPagination}
          size="middle"
          style={{ fontSize: 16 }}
          locale={{ emptyText: 'Chưa có đơn hàng nào' }}
          summary={() => {
            const saleOrders = sortedOrders.filter((o) => o.orderType === 'SALE');
            if (saleOrders.length === 0) return null;
            const totalSale = saleOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Tổng doanh thu (đơn bán)</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: '#1677ff' }}>{formatCurrency(totalSale)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Lịch sử thanh toán */}
      <Card
        title={<span style={{ fontSize: 16, fontWeight: 600 }}>Lịch sử thanh toán</span>}
        extra={
          <Button type="primary" onClick={() => navigate('/orders/new')}>
            + Ghi nhận trả nợ
          </Button>
        }
      >
        <Table<Payment>
          dataSource={payments ?? []}
          columns={paymentColumns}
          rowKey="id"
          pagination={defaultPagination}
          size="middle"
          style={{ fontSize: 16 }}
          locale={{ emptyText: 'Chưa có thanh toán nào' }}
          summary={() => {
            const total = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
            if (!payments || payments.length === 0) return null;
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>Tổng đã thanh toán</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: '#52c41a' }}>{formatCurrency(total)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default CustomerDetail;
