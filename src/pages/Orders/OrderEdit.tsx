import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Card, Col, DatePicker, Divider, Form,
  Input, InputNumber, Row, Select, Spin, Typography,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCustomers } from '../../hooks/useCustomers';
import { useOrderById, useUpdateOrder } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import OrderItemRow from '../../components/forms/OrderItemRow';
import { formatCurrency } from '../../utils/formatters';
import type { CreateOrderDto, CreateOrderItemDto } from '../../types';

const { Title } = Typography;

interface OrderFormValues {
  customerId: number;
  orderDate: dayjs.Dayjs;
  paidImmediately?: number;
  note?: string;
  items: CreateOrderItemDto[];
}

const OrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<OrderFormValues>();

  const { data: order, isLoading: orderLoading } = useOrderById(orderId);
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: allProducts } = useProducts();
  const updateOrder = useUpdateOrder();

  const items: CreateOrderItemDto[] = Form.useWatch('items', form) ?? [];

  const totalAmount = items.reduce((sum, item) => {
    if (!item) return sum;
    const count = Number(item.count) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const length = Number(item.length) || 0;
    const width = Number(item.width) || 0;
    const product = allProducts?.find((p) => p.id === item.productId);
    if (product?.unit === 'M2') return sum + count * length * width * unitPrice;
    if (product?.unit === 'MET') return sum + count * length * unitPrice;
    return sum + count * unitPrice;
  }, 0);

  const paidWatch: number = Number(Form.useWatch('paidImmediately', form)) || 0;
  const remainingThisOrder = Math.max(0, totalAmount - paidWatch);

  const handleProductChange = (index: number, _productId: number, unitPrice: number, width?: number) => {
    const currentItems = form.getFieldValue('items') as CreateOrderItemDto[];
    const updated = [...currentItems];
    updated[index] = { ...updated[index], unitPrice, ...(width !== undefined ? { width } : {}) };
    form.setFieldValue('items', updated);
  };

  const handleFinish = (values: OrderFormValues) => {
    const dto: CreateOrderDto = {
      customerId: values.customerId,
      orderDate: values.orderDate.format('YYYY-MM-DD'),
      paidImmediately: values.paidImmediately ?? 0,
      note: values.note,
      items: values.items.map((item) => ({
        productId: item.productId,
        count: item.count,
        length: item.length,
        width: item.width,
        unitPrice: item.unitPrice,
      })),
    };

    updateOrder.mutate({ id: orderId, data: dto }, {
      onSuccess: () => navigate(`/orders/${orderId}`),
    });
  };

  if (orderLoading) return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  if (!order) return null;

  // Build initial values from existing order
  const initialValues: OrderFormValues = {
    customerId: order.customerId,
    orderDate: dayjs(order.orderDate),
    paidImmediately: order.paidImmediately,
    note: order.note,
    items: (order.items ?? []).map((item) => ({
      productId: item.productId,
      count: item.count,
      length: item.length,
      width: item.width,
      unitPrice: item.unitPrice,
    })),
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate(`/orders/${orderId}`)}>
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>Sửa đơn hàng — {order.code}</Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
        autoComplete="off"
      >
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Khách hàng" name="customerId" rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
                <Select
                  placeholder="Chọn khách hàng"
                  size="large"
                  loading={customersLoading}
                  showSearch
                  optionFilterProp="label"
                  options={customers?.map((c) => ({ value: c.id, label: `${c.name}${c.phone ? ` — ${c.phone}` : ''}` }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Ngày đặt hàng" name="orderDate" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea placeholder="Ghi chú đơn hàng (tùy chọn)" rows={2} size="large" />
          </Form.Item>
        </Card>

        <Card title={<span style={{ fontSize: 16 }}>Danh sách sản phẩm</span>} style={{ marginBottom: 16 }}>
          <Form.List name="items" rules={[{ validator: async (_, items) => { if (!items || items.length === 0) return Promise.reject(new Error('Phải có ít nhất 1 sản phẩm')); } }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => {
                  const itemValues: Partial<CreateOrderItemDto> = (form.getFieldValue(['items', index]) as Partial<CreateOrderItemDto>) ?? {};
                  return (
                    <OrderItemRow
                      key={field.key}
                      index={index}
                      onRemove={() => remove(field.name)}
                      values={itemValues}
                      onProductChange={(productId, unitPrice, width) => handleProductChange(index, productId, unitPrice, width)}
                    />
                  );
                })}
                <Form.ErrorList errors={errors} />
                <Button type="dashed" onClick={() => add({ productId: undefined, count: 1, unitPrice: 0 })} icon={<PlusOutlined />} size="large" block style={{ marginTop: 8 }}>
                  Thêm sản phẩm
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card>
          <Row gutter={[16, 0]} align="middle">
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text style={{ fontSize: 16 }}>Tổng tiền đơn hàng: </Typography.Text>
                <Typography.Text strong style={{ fontSize: 20, color: '#1677ff' }}>{formatCurrency(totalAmount)}</Typography.Text>
              </div>
              <Form.Item
                label="Thanh toán ngay"
                name="paidImmediately"
                rules={[{ validator: (_, value) => {
                  const paid = value ?? 0;
                  if (paid < 0) return Promise.reject(new Error('Số tiền không được âm'));
                  if (paid > totalAmount) return Promise.reject(new Error('Không được vượt quá tổng tiền'));
                  return Promise.resolve();
                }}]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <InputNumber<number>
                  placeholder="0" size="large" min={0} max={totalAmount} style={{ width: '100%' }} suffix="₫"
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                  parser={(value) => { const c = (value ?? '').replace(/\./g, '').replace(/[^\d]/g, ''); return c ? parseInt(c, 10) : 0; }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ textAlign: 'right' }}>
                <div>
                  <Typography.Text style={{ fontSize: 17 }}>Tổng nợ: </Typography.Text>
                  <Typography.Text strong style={{ fontSize: 20, color: remainingThisOrder > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {formatCurrency(remainingThisOrder)}
                  </Typography.Text>
                </div>
              </div>
            </Col>
          </Row>
          <Divider />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button size="large" onClick={() => navigate(`/orders/${orderId}`)}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large" loading={updateOrder.isPending} disabled={updateOrder.isPending}>
              Lưu thay đổi
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default OrderEdit;
