import { Button, Col, Form, InputNumber, Row, Select, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';
import type { CreateOrderItemDto } from '../../types';

const { Text } = Typography;

interface OrderItemRowProps {
  /** Index of this item in the Form.List */
  index: number;
  /** Called when the user clicks the delete button */
  onRemove: () => void;
  /** Current values for this row (used to compute subtotal) */
  values: Partial<CreateOrderItemDto>;
  /** Called when the product selection changes so the parent can update unitPrice */
  onProductChange: (productId: number, unitPrice: number) => void;
}

const OrderItemRow = ({ index, onRemove, values, onProductChange }: OrderItemRowProps) => {
  const { data: products, isLoading: productsLoading } = useProducts();

  const count = values?.count ?? 0;
  const unitPrice = values?.unitPrice ?? 0;
  const subtotal = count * unitPrice;

  const handleProductSelect = (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      onProductChange(productId, product.price);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        padding: '16px',
        marginBottom: 12,
        background: '#fafafa',
      }}
    >
      <Row gutter={[12, 8]} align="middle">
        {/* Product select */}
        <Col xs={24} sm={10}>
          <Form.Item
            name={[index, 'productId']}
            label="Sản phẩm"
            rules={[{ required: true, message: 'Chọn sản phẩm' }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder="Chọn sản phẩm"
              size="large"
              loading={productsLoading}
              showSearch
              optionFilterProp="label"
              options={products?.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.unit})`,
              }))}
              onChange={handleProductSelect}
            />
          </Form.Item>
        </Col>

        {/* Count */}
        <Col xs={12} sm={4}>
          <Form.Item
            name={[index, 'count']}
            label="Số lượng"
            rules={[
              { required: true, message: 'Nhập SL' },
              { type: 'number', min: 1, message: 'SL > 0' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="SL"
              size="large"
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* Length (optional) */}
        <Col xs={12} sm={4}>
          <Form.Item
            name={[index, 'length']}
            label="Chiều dài"
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="m"
              size="large"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* Width (optional) */}
        <Col xs={12} sm={4}>
          <Form.Item
            name={[index, 'width']}
            label="Chiều rộng"
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="m"
              size="large"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* Delete button */}
        <Col xs={12} sm={2} style={{ textAlign: 'right' }}>
          <Form.Item label=" " style={{ marginBottom: 0 }}>
            <Button
              danger
              icon={<DeleteOutlined />}
              size="large"
              onClick={onRemove}
              title="Xóa dòng"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 8]} style={{ marginTop: 8 }}>
        {/* Unit price */}
        <Col xs={24} sm={10}>
          <Form.Item
            name={[index, 'unitPrice']}
            label="Đơn giá"
            rules={[
              { required: true, message: 'Nhập đơn giá' },
              { type: 'number', min: 1, message: 'Đơn giá > 0' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber<number>
              placeholder="Đơn giá"
              size="large"
              min={1}
              style={{ width: '100%' }}
              formatter={(value) =>
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
              }
              parser={(value) => Number(value?.replace(/\./g, '') ?? 0)}
              addonAfter="₫"
            />
          </Form.Item>
        </Col>

        {/* Subtotal display */}
        <Col xs={24} sm={14} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
          <Text style={{ fontSize: 16 }}>
            Thành tiền:{' '}
            <Text strong style={{ fontSize: 16, color: subtotal > 0 ? '#1677ff' : undefined }}>
              {subtotal > 0 ? formatCurrency(subtotal) : '—'}
            </Text>
          </Text>
        </Col>
      </Row>
    </div>
  );
};

export default OrderItemRow;
