import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, Col, DatePicker, Divider, Form,
  Input, InputNumber, Modal, Row, Select, Segmented, Typography,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined, ShoppingCartOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCustomers, useCustomerById } from '../../hooks/useCustomers';
import { useCreateOrder } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import OrderItemRow from '../../components/forms/OrderItemRow';
import { formatCurrency } from '../../utils/formatters';
import type { CreateOrderDto, CreateOrderItemDto, OrderType } from '../../types';

const { Title, Text } = Typography;

interface SaleFormValues {
  customerId: number;
  orderDate: dayjs.Dayjs;
  paidImmediately?: number;
  note?: string;
  items: CreateOrderItemDto[];
}

interface PaymentFormValues {
  customerId: number;
  orderDate: dayjs.Dayjs;
  amount: number;
  note?: string;
}

const OrderNew = () => {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<OrderType>('SALE');
  const [saleForm] = Form.useForm<SaleFormValues>();
  const [paymentForm] = Form.useForm<PaymentFormValues>();
  const [pendingDto, setPendingDto] = useState<CreateOrderDto | null>(null);

  const { data: customers, isLoading: customersLoading } = useCustomers();
  const createOrder = useCreateOrder();

  // Watch customerId từ form đang active
  const saleCustomerId: number | undefined = Form.useWatch('customerId', saleForm);
  const paymentCustomerId: number | undefined = Form.useWatch('customerId', paymentForm);
  const activeCustomerId = orderType === 'SALE' ? saleCustomerId : paymentCustomerId;

  const { data: selectedCustomer } = useCustomerById(activeCustomerId ?? 0);
  const { data: allProducts } = useProducts();

  // Tính total cho SALE
  const saleItems: CreateOrderItemDto[] = Form.useWatch('items', saleForm) ?? [];
  const totalAmount = saleItems.reduce((sum, item) => {
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

  const paidWatch: number = Number(Form.useWatch('paidImmediately', saleForm)) || 0;
  const amountWatch: number = Number(Form.useWatch('amount', paymentForm)) || 0;
  const remainingThisOrder = Math.max(0, totalAmount - paidWatch);
  const currentDebt = Number(selectedCustomer?.totalDebt) || 0;
  const totalDebtAfter = orderType === 'SALE'
    ? currentDebt + remainingThisOrder
    : Math.max(0, currentDebt - amountWatch);

  const handleProductChange = (index: number, _productId: number, unitPrice: number, width?: number) => {
    const currentItems = saleForm.getFieldValue('items') as CreateOrderItemDto[];
    const updated = [...currentItems];
    updated[index] = { ...updated[index], unitPrice, ...(width !== undefined ? { width } : {}) };
    saleForm.setFieldValue('items', updated);
  };

  const handleSaleFinish = (values: SaleFormValues) => {
    const dto: CreateOrderDto = {
      customerId: values.customerId,
      orderType: 'SALE',
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

  const handlePaymentFinish = (values: PaymentFormValues) => {
    const dto: CreateOrderDto = {
      customerId: values.customerId,
      orderType: 'PAYMENT',
      orderDate: values.orderDate.format('YYYY-MM-DD'),
      amount: values.amount,
      note: values.note,
    };
    setPendingDto(dto);
  };

  const handleConfirm = () => {
    if (!pendingDto) return;
    createOrder.mutate(pendingDto, {
      onSuccess: () => { setPendingDto(null); navigate('/orders'); },
      onError: () => { setPendingDto(null); },
    });
  };

  const customerOptions = customers?.map((c) => ({
    value: c.id,
    label: `${c.name}${c.phone ? ` — ${c.phone}` : ''}`,
  }));

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate('/orders')}>
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>Tạo đơn hàng</Title>
      </div>

      {/* Chọn loại đơn */}
      <Card style={{ marginBottom: 16 }}>
        <Segmented
          size="large"
          value={orderType}
          onChange={(val) => setOrderType(val as OrderType)}
          options={[
            { label: <span><ShoppingCartOutlined /> Bán hàng</span>, value: 'SALE' },
            { label: <span><WalletOutlined /> Trả nợ</span>, value: 'PAYMENT' },
          ]}
          style={{ marginBottom: 16 }}
        />

        {/* Hiển thị nợ hiện tại nếu đã chọn khách hàng */}
        {activeCustomerId && selectedCustomer && (
          <div style={{ padding: '8px 12px', background: '#f6f6f6', borderRadius: 6, display: 'inline-block' }}>
            <Text style={{ fontSize: 15 }}>Nợ hiện tại của <strong>{selectedCustomer.name}</strong>: </Text>
            <Text strong style={{ fontSize: 16, color: currentDebt > 0 ? '#cf1322' : '#52c41a' }}>
              {formatCurrency(currentDebt)}
            </Text>
          </div>
        )}
      </Card>

      {/* ── SALE FORM ── */}
      {orderType === 'SALE' && (
        <Form
          form={saleForm}
          layout="vertical"
          onFinish={handleSaleFinish}
          initialValues={{ orderDate: dayjs(), paidImmediately: 0, items: [{ productId: undefined, count: 1, unitPrice: 0 }] }}
          autoComplete="off"
        >
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Khách hàng" name="customerId" rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
                  <Select placeholder="Chọn khách hàng" size="large" loading={customersLoading} showSearch optionFilterProp="label" options={customerOptions} />
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
                    const itemValues: Partial<CreateOrderItemDto> = (saleForm.getFieldValue(['items', index]) as Partial<CreateOrderItemDto>) ?? {};
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
                  <Text style={{ fontSize: 16 }}>Tổng tiền đơn hàng: </Text>
                  <Text strong style={{ fontSize: 20, color: '#1677ff' }}>{formatCurrency(totalAmount)}</Text>
                </div>
                <Form.Item
                  label="Thanh toán ngay"
                  name="paidImmediately"
                  rules={[{ validator: (_, value) => {
                    const paid = value ?? 0;
                    if (paid < 0) return Promise.reject(new Error('Số tiền không được âm'));
                    if (paid > totalAmount) return Promise.reject(new Error('Không được vượt quá tổng tiền đơn hàng'));
                    return Promise.resolve();
                  }}]}
                  validateTrigger={['onChange', 'onBlur']}
                >
                  <InputNumber<number>
                    placeholder="0" size="large" min={0} max={totalAmount} style={{ width: '100%' }} suffix="₫"
                    formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                    parser={(v) => { const c = (v ?? '').replace(/\./g, '').replace(/[^\d]/g, ''); return c ? parseInt(c, 10) : 0; }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ textAlign: 'right' }}>
                  {activeCustomerId && (
                    <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #f0f0f0' }}>
                      <Text style={{ fontSize: 16 }}>Nợ cũ: </Text>
                      <Text strong style={{ fontSize: 18, color: currentDebt > 0 ? '#cf1322' : '#52c41a' }}>
                        {formatCurrency(currentDebt)}
                      </Text>
                    </div>
                  )}
                  <div>
                    <Text style={{ fontSize: 17 }}>Tổng nợ sau đơn: </Text>
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
              <Button type="primary" htmlType="submit" size="large" loading={createOrder.isPending}>
                Tạo đơn hàng
              </Button>
            </div>
          </Card>
        </Form>
      )}

      {/* ── PAYMENT FORM ── */}
      {orderType === 'PAYMENT' && (
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentFinish}
          initialValues={{ orderDate: dayjs() }}
          autoComplete="off"
        >
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Khách hàng" name="customerId" rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
                  <Select placeholder="Chọn khách hàng" size="large" loading={customersLoading} showSearch optionFilterProp="label" options={customerOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Ngày trả nợ" name="orderDate" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                  <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Số tiền trả nợ"
                  name="amount"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số tiền' },
                    { validator: (_, value) => {
                      if (!value || value <= 0) return Promise.reject(new Error('Số tiền phải lớn hơn 0'));
                      if (currentDebt > 0 && value > currentDebt) return Promise.reject(new Error(`Không được vượt quá tổng nợ (${new Intl.NumberFormat('vi-VN').format(currentDebt)} ₫)`));
                      return Promise.resolve();
                    }},
                  ]}
                >
                  <InputNumber<number>
                    placeholder="0" size="large" min={1} max={currentDebt > 0 ? currentDebt : undefined} style={{ width: '100%' }} suffix="₫"
                    formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                    parser={(v) => { const c = (v ?? '').replace(/\./g, '').replace(/[^\d]/g, ''); return c ? parseInt(c, 10) : 0; }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea placeholder="Ghi chú (tùy chọn)" rows={1} size="large" />
                </Form.Item>
              </Col>
            </Row>

            {/* Preview nợ sau khi trả */}
            {activeCustomerId && (
              <div style={{ padding: '12px 16px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 15 }}>Nợ hiện tại:</Text>
                  <Text strong style={{ fontSize: 15, color: '#cf1322' }}>{formatCurrency(currentDebt)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15 }}>Nợ sau khi trả:</Text>
                  <Text strong style={{ fontSize: 16, color: totalDebtAfter > 0 ? '#cf1322' : '#52c41a' }}>
                    {formatCurrency(totalDebtAfter)}
                  </Text>
                </div>
              </div>
            )}
          </Card>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button size="large" onClick={() => navigate('/orders')}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large" loading={createOrder.isPending} icon={<WalletOutlined />}>
              Ghi nhận trả nợ
            </Button>
          </div>
        </Form>
      )}

      {/* Confirm modal */}
      <Modal
        open={!!pendingDto}
        title={<span style={{ fontSize: 18 }}>{pendingDto?.orderType === 'PAYMENT' ? 'Xác nhận ghi nhận trả nợ' : 'Xác nhận tạo đơn hàng'}</span>}
        onOk={handleConfirm}
        onCancel={() => setPendingDto(null)}
        okText={pendingDto?.orderType === 'PAYMENT' ? 'Xác nhận trả nợ' : 'Xác nhận tạo đơn'}
        cancelText="Quay lại"
        okButtonProps={{ size: 'large', loading: createOrder.isPending }}
        cancelButtonProps={{ size: 'large' }}
      >
        <div style={{ fontSize: 16, lineHeight: 2 }}>
          {pendingDto?.orderType === 'SALE' ? (
            <>
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
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Nợ cũ:</Text>
                <Text strong style={{ color: currentDebt > 0 ? '#cf1322' : '#52c41a' }}>{formatCurrency(currentDebt)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Tổng nợ sau đơn:</Text>
                <Text strong style={{ fontSize: 18, color: totalDebtAfter > 0 ? '#cf1322' : '#52c41a' }}>{formatCurrency(totalDebtAfter)}</Text>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Số tiền trả nợ:</Text>
                <Text strong style={{ color: '#52c41a' }}>{formatCurrency(pendingDto?.amount ?? 0)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Nợ hiện tại:</Text>
                <Text strong style={{ color: '#cf1322' }}>{formatCurrency(currentDebt)}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Nợ sau khi trả:</Text>
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
