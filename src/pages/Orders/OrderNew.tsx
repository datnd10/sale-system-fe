import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, Col, DatePicker, Divider, Form,
  Input, InputNumber, Modal, Row, Select, Typography,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCustomers, useCustomerById } from '../../hooks/useCustomers';
import { useCreateOrder } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import OrderItemRow from '../../components/forms/OrderItemRow';
import { formatCurrency } from '../../utils/formatters';
import type { CreateOrderDto, CreateOrderItemDto } from '../../types';

const { Title, Text } = Typography;

interface OrderFormValues {
  customerId: number;
  orderDate: dayjs.Dayjs;
  paidImmediately?: number;
  note?: string;
  items: CreateOrderItemDto[];
}

const OrderNew = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<OrderFormValues>();
  const [pendingDto, setPendingDto] = useState<CreateOrderDto | null>(null);

  const { data: customers, isLoading: customersLoading } = useCustomers();
  const createOrder = useCreateOrder();

  const selectedCustomerId: number | undefined = Form.useWatch('customerId', form);
  const { data: selectedCustomer } = useCustomerById(selectedCustomerId ?? 0);

  const items: CreateOrderItemDto[] = Form.useWatch('items', form) ?? [];
  const { data: allProducts } = useProducts();

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
  // Phần trả vượt quá đơn này sẽ trừ vào nợ cũ
  const extraPayment = Math.max(0, paidWatch - totalAmount);
  const oldDebt = Number(selectedCustomer?.totalDebt) || 0;
  const remainingOldDebt = Math.max(0, oldDebt - extraPayment);
  const totalDebtAfter = remainingThisOrder + remainingOldDebt;

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
    setPendingDto(dto);
  };

  const handleConfirmOrder = () => {
    if (!pendingDto) return;
    createOrder.mutate(pendingDto, {
      onSuccess: () => { setPendingDto(null); navigate('/orders'); },
      onError: () => { setPendingDto(null); },
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate('/orders')}>
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>Tạo đơn hàng</Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ orderDate: dayjs(), paidImmediately: 0, items: [{ productId: undefined, count: 1, unitPrice: 0 }] }}
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
                <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
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

        {/* Payment summary */}
        <Card>
          <Row gutter={[16, 0]} align="middle">
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16 }}>Tổng tiền đơn hàng: </Text>
                <Text strong style={{ fontSize: 20, color: '#1677ff' }}>{formatCurrency(totalAmount)}</Text>
              </div>
              <Form.Item
                label="Thanh toán ngay"
                name="paidImmediately"
                // extra={oldDebt > 0 ? `Có thể trả thêm nợ cũ, tối đa ${formatCurrency(totalAmount + oldDebt)}` : undefined}
                rules={[{
                  validator: (_, value) => {
                    const paid = value ?? 0;
                    if (paid < 0) return Promise.reject(new Error('Số tiền không được âm'));
                    if (paid > totalAmount + oldDebt) return Promise.reject(new Error(`Không được vượt quá tổng tiền + nợ cũ (${formatCurrency(totalAmount + oldDebt)})`));
                    return Promise.resolve();
                  },
                }]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <InputNumber<number>
                  placeholder="0"
                  size="large"
                  min={0}
                  style={{ width: '100%' }}
                  suffix="₫"
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                  parser={(value) => { const c = (value ?? '').replace(/\./g, '').replace(/[^\d]/g, ''); return c ? parseInt(c, 10) : 0; }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ textAlign: 'right' }}>
                {/* Nợ cũ — luôn hiện khi đã chọn khách hàng */}
                {selectedCustomerId && (
                  <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #f0f0f0' }}>
                    <Text style={{ fontSize: 16 }}>Nợ cũ còn lại: </Text>
                    <Text strong style={{ fontSize: 18, color: remainingOldDebt > 0 ? '#cf1322' : '#52c41a' }}>
                      {formatCurrency(remainingOldDebt)}
                    </Text>
                  </div>
                )}
                <div>
                  <Text style={{ fontSize: 17 }}>Tổng nợ: </Text>
                  <Text strong style={{ fontSize: 20, color: totalDebtAfter > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {formatCurrency(totalDebtAfter)}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button size="large" onClick={() => navigate('/orders')}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large" loading={createOrder.isPending} disabled={createOrder.isPending}>
              Tạo đơn hàng
            </Button>
          </div>
        </Card>
      </Form>

      {/* Confirm modal */}
      <Modal
        open={!!pendingDto}
        title={<span style={{ fontSize: 18 }}>Xác nhận tạo đơn hàng</span>}
        onOk={handleConfirmOrder}
        onCancel={() => setPendingDto(null)}
        okText="Xác nhận tạo đơn"
        cancelText="Quay lại"
        okButtonProps={{ size: 'large', loading: createOrder.isPending }}
        cancelButtonProps={{ size: 'large' }}
      >
        <div style={{ fontSize: 16, lineHeight: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Tổng tiền đơn hàng:</Text>
            <Text strong style={{ color: '#1677ff' }}>{formatCurrency(totalAmount)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Thanh toán ngay:</Text>
            <Text strong style={{ color: '#52c41a' }}>{formatCurrency(pendingDto?.paidImmediately ?? 0)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Còn nợ đơn này:</Text>
            <Text strong style={{ color: remainingThisOrder > 0 ? '#ff4d4f' : '#52c41a' }}>{formatCurrency(remainingThisOrder)}</Text>
          </div>
          {oldDebt > 0 && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Nợ cũ còn lại:</Text>
                <Text strong style={{ color: remainingOldDebt > 0 ? '#cf1322' : '#52c41a' }}>{formatCurrency(remainingOldDebt)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Tổng nợ sau đơn:</Text>
                <Text strong style={{ fontSize: 18, color: totalDebtAfter > 0 ? '#cf1322' : '#52c41a' }}>{formatCurrency(totalDebtAfter)}</Text>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderNew;
