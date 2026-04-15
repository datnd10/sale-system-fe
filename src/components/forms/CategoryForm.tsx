import { Button, Form, Input } from 'antd';
import type { CreateCategoryDto } from '../../types';

interface CategoryFormProps {
  initialValues?: Partial<CreateCategoryDto>;
  onFinish: (values: CreateCategoryDto) => void;
  isSubmitting: boolean;
}

const CategoryForm = ({ initialValues, onFinish, isSubmitting }: CategoryFormProps) => {
  const [form] = Form.useForm<CreateCategoryDto>();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Tên danh mục"
        name="name"
        rules={[
          { required: true, message: 'Vui lòng nhập tên danh mục' },
          {
            validator: (_, value) => {
              if (value && value.trim() === '') {
                return Promise.reject(new Error('Tên danh mục không được chỉ là khoảng trắng'));
              }
              return Promise.resolve();
            },
          },
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <Input placeholder="Nhập tên danh mục" size="large" />
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
      >
        <Input.TextArea
          placeholder="Nhập mô tả (tùy chọn)"
          rows={3}
          size="large"
        />
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

export default CategoryForm;
