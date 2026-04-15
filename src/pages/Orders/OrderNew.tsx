import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCustomers } from '../../hooks/useCustomers';
import { useCreateOrder } from '../../hooks/useOrders';
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

  const { data: customers, isLoading: customersLoading } = useCustomers();
  const createOrder = useCreateOrder();

  // Watch items to compute totals in real-time
  const items: CreateOrderItemDto[] = Form.useWatch('items', form) ?? [];

  const totalAmount = items.reduce((sum, item) => {
    const count = item?.count ?? 0;
    const unitPrice = item?.unitPrice ?? 0;
    return sum + count * unitPrice;
  }, 0);

  const handleProductChange = (index: number, _productId: number, unitPrice: number) => {
    const currentItems = form.getFieldValue('items') as CreateOrderItemDto[];
    const updated = [...currentItems];
    updated[index] = { ...updated[index], unitPrice };
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

    createOrder.mutate(dto, {
      onSuccess: () => {
        navigate('/orders');
      },
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          size="large"
          onClick={() => navigate('/orders')}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          Tạo đơn hàng
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          orderDate: dayjs(),
          paidImmediately: 0,
          items: [{ productId: undefined, count: 1, unitPrice: 0 }],
        }}
        autoComplete="off"
      >
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            {/* Customer */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Khách hàng"
                name="customerId"
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  size="large"
                  loading={customersLoading}
                  showSearch
                  optionFilterProp="label"
                  options={customers?.map((c) => ({
                    value: c.id,
                    label: `${c.name}${c.phone ? ` — ${c.phone}` : ''}`,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* Order date */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày đặt hàng"
                name="orderDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày đặt hàng' }]}
              >
                <DatePicker
                  size="large"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Note */}
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea placeholder="Ghi chú đơn hàng (tùy chọn)" rows={2} size="large" />
          </Form.Item>
        </Card>

        {/* Order items */}
        <Card
          title={<span style={{ fontSize: 16 }}>Danh sách sản phẩm</span>}
          style={{ marginBottom: 16 }}
        >
          <Form.List
            name="items"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items || items.length === 0) {
                    return Promise.reject(new Error('Phải có ít nhất 1 sản phẩm'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => {
                  const itemValues: Partial<CreateOrderItemDto> =
                    (form.getFieldValue(['items', index]) as Partial<CreateOrderItemDto>) ?? {};

                  return (
                    <OrderItemRow
                      key={field.key}
                      index={index}
                      onRemove={() => remove(field.name)}
                      values={itemValues}
                      onProductChange={(productId, unitPrice) =>
                        handleProductChange(index, productId, unitPrice)
                      }
                    />
                  );
                })}

                <Form.ErrorList errors={errors} />

                <Button
                  type="dashed"
                  onClick={() => add({ productId: undefined, count: 1, unitPrice: 0 })}
                  icon={<PlusOutlined />}
                  size="large"
                  block
                  style={{ marginTop: 8 }}
                >
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
                <Text strong style={{ fontSize: 20, color: '#1677ff' }}>
                  {formatCurrency(totalAmount)}
                </Text>
              </div>

              <Form.Item
                label="Thanh toán ngay"
                name="paidImmediately"
                rules={[
                  {
                    validator: (_, value) => {
                      const paid = value ?? 0;
                      if (paid < 0) {
                        return Promise.reject(new Error('Số tiền thanh toán không được âm'));
                      }
                      if (paid > totalAmount) {
                        return Promise.reject(
                          new Error('Số tiền thanh toán không được vượt quá tổng tiền'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <InputNumber<number>
                  placeholder="0"
                  size="large"
                  min={0}
                  max={totalAmount}
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
                  }
                  parser={(value) => Number(value?.replace(/\./g, '') ?? 0)}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              {(() => {
                const paid = (form.getFieldValue('paidImmediately') as number) ?? 0;
                const remaining = totalAmount - paid;
                return (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 16 }}>Đã thanh toán: </Text>
                      <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                        {formatCurrency(paid)}
                      </Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: 16 }}>Còn nợ: </Text>
                      <Text
                        strong
                        style={{ fontSize: 16, color: remaining > 0 ? '#ff4d4f' : '#52c41a' }}
                      >
                        {formatCurrency(remaining)}
                      </Text>
                    </div>
                  </div>
                );
              })()}
            </Col>
          </Row>

          <Divider />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button size="large" onClick={() => navigate('/orders')}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={createOrder.isPending}
              disabled={createOrder.isPending}
            >
              Tạo đơn hàng
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default OrderNew;
