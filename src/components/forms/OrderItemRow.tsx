import { Button, Col, Form, InputNumber, Row, Select, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import { PRODUCT_UNIT_OPTIONS } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import type { CreateOrderItemDto } from '../../types';

const { Text } = Typography;

interface OrderItemRowProps {
  index: number;
  onRemove: () => void;
  values: Partial<CreateOrderItemDto>;
  onProductChange: (productId: number, unitPrice: number, width?: number) => void;
}

const OrderItemRow = ({ index, onRemove, values, onProductChange }: OrderItemRowProps) => {
  const { data: products, isLoading: productsLoading } = useProducts();

  // Watch từng field trong row để tính subtotal real-time
  const count: number = Form.useWatch(['items', index, 'count']) ?? 0;
  const length: number = Form.useWatch(['items', index, 'length']) ?? 0;
  const width: number = Form.useWatch(['items', index, 'width']) ?? 0;
  const unitPrice: number = Form.useWatch(['items', index, 'unitPrice']) ?? 0;
  const productId: number = Form.useWatch(['items', index, 'productId']);

  const selectedProduct = products?.find((p) => p.id === productId);
  const isM2 = selectedProduct?.unit === 'M2';
  const isMet = selectedProduct?.unit === 'MET';

  // Tính subtotal theo đúng công thức BE
  const subtotal = (() => {
    if (!count || !unitPrice) return 0;
    if (isM2) return count * (length || 0) * (width || 0) * unitPrice;
    if (isMet) return count * (length || 0) * unitPrice;
    return count * unitPrice;
  })();

  const unitLabel = selectedProduct
    ? (PRODUCT_UNIT_OPTIONS.find((u) => u.value === selectedProduct.unit)?.label ?? selectedProduct.unit)
    : '';

  const handleProductSelect = (pid: number) => {
    const product = products?.find((p) => p.id === pid);
    if (product) {
      onProductChange(pid, product.price, product.width ?? undefined);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 10,
        background: '#fafafa',
      }}
    >
      <Row gutter={[10, 0]} align="bottom" wrap={false}>
        {/* Sản phẩm */}
        <Col flex="220px">
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
              options={products?.map((p) => ({ value: p.id, label: p.name }))}
              onChange={handleProductSelect}
            />
          </Form.Item>
        </Col>

        {/* Số lượng */}
        <Col flex="100px">
          <Form.Item
            name={[index, 'count']}
            label={`SL${unitLabel ? ` (${unitLabel})` : ''}`}
            rules={[{ required: true, message: 'Nhập SL' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber<number>
              placeholder="1"
              size="large"
              min={1}
              step={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* Chiều dài — chỉ hiện với M2 và MET */}
        <Col flex="100px">
          <Form.Item
            name={[index, 'length']}
            label="Dài (m)"
            style={{ marginBottom: 0 }}
          >
            <InputNumber<number>
              placeholder="—"
              size="large"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              disabled={!isM2 && !isMet}
            />
          </Form.Item>
        </Col>

        {/* Chiều rộng — chỉ dùng với M2 */}
        <Col flex="100px">
          <Form.Item
            name={[index, 'width']}
            label="Rộng (m)"
            style={{ marginBottom: 0 }}
          >
            <InputNumber<number>
              placeholder="—"
              size="large"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              disabled={!isM2}
            />
          </Form.Item>
        </Col>

        {/* Đơn giá */}
        <Col flex="160px">
          <Form.Item
            name={[index, 'unitPrice']}
            label="Đơn giá (₫)"
            rules={[{ required: true, message: 'Nhập đơn giá' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber<number>
              placeholder="0"
              size="large"
              min={1}
              style={{ width: '100%' }}
              formatter={(value) =>
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
              }
              parser={(value) => {
                if (!value) return 0;
                const cleaned = value.replace(/\./g, '').replace(/[^\d]/g, '');
                return cleaned ? parseInt(cleaned, 10) : 0;
              }}
            />
          </Form.Item>
        </Col>

        {/* Thành tiền */}
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Form.Item label="Thành tiền" style={{ marginBottom: 0 }}>
            <Text strong style={{ fontSize: 16, color: subtotal > 0 ? '#1677ff' : '#aaa' }}>
              {subtotal > 0 ? formatCurrency(subtotal) : '—'}
            </Text>
          </Form.Item>
        </Col>

        {/* Xóa */}
        <Col flex="40px">
          <Form.Item label=" " style={{ marginBottom: 0 }}>
            <Button danger icon={<DeleteOutlined />} size="large" onClick={onRemove} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default OrderItemRow;
