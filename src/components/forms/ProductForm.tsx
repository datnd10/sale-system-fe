import { Button, Form, Input, InputNumber, Select } from 'antd';
import { useCategories } from '../../hooks/useCategories';
import { PRODUCT_UNIT_OPTIONS } from '../../types';
import type { CreateProductDto } from '../../types';

interface ProductFormProps {
  initialValues?: Partial<CreateProductDto>;
  onFinish: (values: CreateProductDto) => void;
  isSubmitting: boolean;
}

const ProductForm = ({ initialValues, onFinish, isSubmitting }: ProductFormProps) => {
  const [form] = Form.useForm<CreateProductDto>();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Tên sản phẩm"
        name="name"
        rules={[
          { required: true, message: 'Vui lòng nhập tên sản phẩm' },
          {
            validator: (_, value) => {
              if (value && value.trim() === '') {
                return Promise.reject(new Error('Tên sản phẩm không được chỉ là khoảng trắng'));
              }
              return Promise.resolve();
            },
          },
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <Input placeholder="Nhập tên sản phẩm" size="large" />
      </Form.Item>

      <Form.Item
        label="Danh mục"
        name="categoryId"
        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <Select
          placeholder="Chọn danh mục"
          size="large"
          loading={categoriesLoading}
          options={categories?.map((c) => ({ value: c.id, label: c.name }))}
        />
      </Form.Item>

      <Form.Item
        label="Đơn vị tính"
        name="unit"
        rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <Select
          placeholder="Chọn đơn vị tính"
          size="large"
          options={PRODUCT_UNIT_OPTIONS.map((u) => ({
            value: u.value,
            label: `${u.label} — ${u.description}`,
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Giá bán"
        name="price"
        rules={[
          { required: true, message: 'Vui lòng nhập giá bán' },
          {
            validator: (_, value) => {
              if (value === undefined || value === null || value === 0) {
                return Promise.reject(new Error('Vui lòng nhập giá bán'));
              }
              if (value < 1) {
                return Promise.reject(new Error('Giá bán phải lớn hơn 0'));
              }
              return Promise.resolve();
            },
          },
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <InputNumber<number>
          placeholder="Nhập giá bán"
          size="large"
          style={{ width: '100%' }}
          min={1}
          suffix="₫"
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

      <Form.Item
        label="Chiều rộng mặc định (tùy chọn)"
        name="width"
        extra="Dùng cho sản phẩm tính theo m² (tôn, thép tấm...). Để trống nếu không cần."
      >
        <InputNumber<number>
          placeholder="Ví dụ: 1.2"
          size="large"
          style={{ width: '100%' }}
          min={0}
          step={0.01}
          suffix="m"
        />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea placeholder="Nhập mô tả (tùy chọn)" rows={2} size="large" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          disabled={isSubmitting}
          loading={isSubmitting}
          block
        >
          Lưu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
