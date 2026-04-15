import { Button, Form, Input } from 'antd';
import type { CreateCustomerDto } from '../../types';

interface CustomerFormProps {
  initialValues?: Partial<CreateCustomerDto>;
  onFinish: (values: CreateCustomerDto) => void;
  isSubmitting: boolean;
}

const CustomerForm = ({ initialValues, onFinish, isSubmitting }: CustomerFormProps) => {
  const [form] = Form.useForm<CreateCustomerDto>();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Tên khách hàng"
        name="name"
        rules={[
          { required: true, message: 'Vui lòng nhập tên khách hàng' },
          {
            validator: (_, value) => {
              if (value && value.trim() === '') {
                return Promise.reject(new Error('Tên khách hàng không được chỉ là khoảng trắng'));
              }
              return Promise.resolve();
            },
          },
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <Input placeholder="Nhập tên khách hàng" size="large" />
      </Form.Item>

      <Form.Item
        label="Số điện thoại"
        name="phone"
      >
        <Input placeholder="Nhập số điện thoại (tùy chọn)" size="large" />
      </Form.Item>

      <Form.Item
        label="Địa chỉ"
        name="address"
      >
        <Input.TextArea
          placeholder="Nhập địa chỉ (tùy chọn)"
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

export default CustomerForm;
