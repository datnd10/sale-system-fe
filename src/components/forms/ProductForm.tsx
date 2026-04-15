import { Button, Form, Input, InputNumber, Select } from 'antd';
import { useCategories } from '../../hooks/useCategories';
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
        rules={[
          { required: true, message: 'Vui lòng nhập đơn vị tính' },
          {
            validator: (_, value) => {
              if (value && value.trim() === '') {
                return Promise.reject(new Error('Đơn vị tính không được chỉ là khoảng trắng'));
              }
              return Promise.resolve();
            },
          },
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <Input placeholder="Ví dụ: kg, tấm, cây, cuộn..." size="large" />
      </Form.Item>

      <Form.Item
        label="Giá bán"
        name="price"
        rules={[
          { required: true, message: 'Vui lòng nhập giá bán' },
          {
            type: 'number',
            min: 1,
            message: 'Giá bán phải lớn hơn 0',
          },
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <InputNumber<number>
          placeholder="Nhập giá bán"
          size="large"
          style={{ width: '100%' }}
          min={1}
          formatter={(value) =>
            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
          }
          parser={(value) => Number(value?.replace(/\./g, '') ?? 0)}
          addonAfter="₫"
        />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea placeholder="Nhập mô tả (tùy chọn)" rows={3} size="large" />
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
