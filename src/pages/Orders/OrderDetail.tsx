import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Card, Col, Descriptions, Input, Popconfirm,
  Row, Space, Table, Tag, Typography,
} from 'antd';
import {
  ArrowLeftOutlined, DeleteOutlined, EditOutlined,
  PrinterOutlined, SaveOutlined,
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import type { ColumnsType } from 'antd/es/table';
import { useOrderById, useDeleteOrder, useUpdateOrderNote } from '../../hooks/useOrders';
import { useCustomerById } from '../../hooks/useCustomers';
import { useDebtByCustomer } from '../../hooks/useDebts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency, formatDate, formatValue } from '../../utils/formatters';
import OrderPrint from '../../components/print/OrderPrint';
import type { OrderItem, OrderType } from '../../types';
import { ORDER_TYPE_LABELS } from '../../types';

const { Title, Text } = Typography;

const orderTypeColor: Record<OrderType, string> = {
  SALE: 'blue',
  PAYMENT: 'green',
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);

  const { data: order, isLoading, error } = useOrderById(orderId);
  const { data: customer } = useCustomerById(order?.customerId ?? 0);
  const { data: debtInfo } = useDebtByCustomer(order?.customerId ?? 0);
  const deleteOrder = useDeleteOrder();
  const updateNote = useUpdateOrderNote();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Hoa-don-${order?.code ?? ''}`,
  });

  const [noteValue, setNoteValue] = useState<string | undefined>(undefined);
  const isEditingNote = noteValue !== undefined;

  const handleSaveNote = () => {
    if (noteValue === undefined) return;
    updateNote.mutate({ id: orderId, note: noteValue }, { onSuccess: () => setNoteValue(undefined) });
  };

  const handleDelete = () => {
    deleteOrder.mutate(orderId, { onSuccess: () => navigate('/orders') });
  };

  const itemColumns: ColumnsType<OrderItem> = [
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Đơn vị', dataIndex: 'productUnit', key: 'productUnit', width: 90 },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 100, align: 'right' },
    {
      title: 'Chiều dài', dataIndex: 'length', key: 'length', width: 110, align: 'right',
      render: (v?: number) => formatValue(v),
    },
    {
      title: 'Chiều rộng', dataIndex: 'width', key: 'width', width: 110, align: 'right',
      render: (v?: number) => formatValue(v),
    },
    {
      title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', width: 150, align: 'right',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Thành tiền', dataIndex: 'subtotal', key: 'subtotal', width: 160, align: 'right',
      render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>,
    },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error || !order) {
    return <ErrorMessage message="Không thể tải chi tiết đơn hàng" description={error ? (error as Error).message : 'Không tìm thấy đơn hàng'} />;
  }

  const isPayment = order.orderType === 'PAYMENT';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate('/orders')}>
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết đơn — {order.code}
          </Title>
          <Tag color={orderTypeColor[order.orderType]} style={{ fontSize: 14 }}>
            {ORDER_TYPE_LABELS[order.orderType]}
          </Tag>
        </Space>

        <Space>
          {!isPayment && (
            <>
              <Button icon={<EditOutlined />} size="large" onClick={() => navigate(`/orders/${orderId}/edit`)}>
                Sửa đơn
              </Button>
              <Button icon={<PrinterOutlined />} size="large" onClick={() => handlePrint()}>
                In hóa đơn
              </Button>
            </>
          )}
          <Popconfirm
            title="Xóa đơn hàng"
            description="Bạn có chắc muốn xóa đơn hàng này không?"
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="large" loading={deleteOrder.isPending}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={16}>
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              size="middle"
              labelStyle={{ fontSize: 16, fontWeight: 500 }}
              contentStyle={{ fontSize: 16 }}
            >
              <Descriptions.Item label="Mã đơn">{order.code}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{order.customerName}</Descriptions.Item>
              <Descriptions.Item label="Ngày">{formatDate(order.orderDate)}</Descriptions.Item>
              <Descriptions.Item label="Loại đơn">
                <Tag color={orderTypeColor[order.orderType]}>{ORDER_TYPE_LABELS[order.orderType]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={isPayment ? 'Số tiền trả nợ' : 'Tổng tiền'}>
                <Text strong style={{ fontSize: 16, color: isPayment ? '#52c41a' : '#1677ff' }}>
                  {formatCurrency(order.totalAmount)}
                </Text>
              </Descriptions.Item>
              {!isPayment && (
                <Descriptions.Item label="Đã thanh toán ngay">
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    {formatCurrency(order.paidImmediately)}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>

          <Col xs={24} md={8}>
            <Text strong style={{ fontSize: 16 }}>Ghi chú</Text>
            {isEditingNote ? (
              <div style={{ marginTop: 8 }}>
                <Input.TextArea value={noteValue} onChange={(e) => setNoteValue(e.target.value)} rows={3} size="large" autoFocus />
                <Space style={{ marginTop: 8 }}>
                  <Button type="primary" icon={<SaveOutlined />} size="large" loading={updateNote.isPending} onClick={handleSaveNote}>Lưu</Button>
                  <Button size="large" onClick={() => setNoteValue(undefined)}>Hủy</Button>
                </Space>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <div style={{ minHeight: 40, padding: '8px 0', fontSize: 16, color: order.note ? undefined : '#bfbfbf' }}>
                  {order.note ?? 'Chưa có ghi chú'}
                </div>
                <Button size="large" onClick={() => setNoteValue(order.note ?? '')}>Sửa ghi chú</Button>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* Chỉ hiện bảng sản phẩm với đơn SALE */}
      {!isPayment && (
        <Card title={<span style={{ fontSize: 16 }}>Danh sách sản phẩm</span>}>
          <Table<OrderItem>
            dataSource={order.items ?? []}
            columns={itemColumns}
            rowKey="id"
            pagination={false}
            size="middle"
            style={{ fontSize: 16 }}
            locale={{ emptyText: 'Không có sản phẩm nào' }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6} align="right">
                  <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{formatCurrency(order.totalAmount)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      )}

      {/* Hidden print area — chỉ với SALE */}
      {!isPayment && (
        <div style={{ display: 'none' }}>
          <div id="order-print-area" ref={printRef}>
            <OrderPrint
              order={order}
              items={order.items ?? []}
              customerPhone={customer?.phone}
              customerAddress={customer?.address}
              currentDebt={debtInfo?.totalDebt ?? customer?.totalDebt}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
