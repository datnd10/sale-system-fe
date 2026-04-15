import { useState } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCustomers, useCustomerById } from '../../hooks/useCustomers';
import { formatCurrency } from '../../utils/formatters';
import type { CreatePaymentDto } from '../../types';

const { Text } = Typography;

interface PaymentFormProps {
  onFinish: (values: CreatePaymentDto) => void;
  isSubmitting: boolean;
}

interface PaymentFormValues {
  customerId: number;
  amount: number;
  paymentDate: dayjs.Dayjs;
  note?: string;
}

const PaymentForm = ({ onFinish, isSubmitting }: PaymentFormProps) => {
  const [form] = Form.useForm<PaymentFormValues>();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined);

  const { data: customers, isLoading: isLoadingCustomers } = useCustomers();
  const { data: selectedCustomer } = useCustomerById(selectedCustomerId as number);

  const handleFinish = (values: PaymentFormValues) => {
    const dto: CreatePaymentDto = {
      customerId: values.customerId,
      amount: values.amount,
      paymentDate: values.paymentDate.format('YYYY-MM-DD'),
      note: values.note,
    };
    onFinish(dto);
  };

  const customerOptions = (customers ?? []).map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      initialValues={{ paymentDate: dayjs() }}
    >
      <Form.Item
        label="Chọn khách hàng"
        name="customerId"
        rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
      >
        <Select
          placeholder="Tìm và chọn khách hàng"
          size="large"
          showSearch
          loading={isLoadingCustomers}
          options={customerOptions}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          onChange={(value: number) => setSelectedCustomerId(value)}
        />
      </Form.Item>

      {selectedCustomerId != null && (
        <div style={{ marginTop: -16, marginBottom: 16 }}>
          <Text type="secondary">
            Công nợ hiện tại:{' '}
            <Text strong>
              {selectedCustomer?.totalDebt != null
                ? formatCurrency(selectedCustomer.totalDebt)
                : '—'}
            </Text>
          </Text>
        </div>
      )}

      <Form.Item
        label="Số tiền"
        name="amount"
        rules={[
          { required: true, message: 'Vui lòng nhập số tiền' },
          {
            validator: (_, value) => {
              if (value != null && value <= 0) {
                return Promise.reject(new Error('Số tiền phải lớn hơn 0'));
              }
              return Promise.resolve();
            },
          },
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <InputNumber<number>
          placeholder="Nhập số tiền thanh toán"
          size="large"
          style={{ width: '100%' }}
          min={1}
          formatter={(value) =>
            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
          }
          parser={(value) => Number((value ?? '').replace(/\./g, ''))}
          addonAfter="₫"
        />
      </Form.Item>

      <Form.Item
        label="Ngày thanh toán"
        name="paymentDate"
        rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán' }]}
      >
        <DatePicker
          size="large"
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày thanh toán"
        />
      </Form.Item>

      <Form.Item label="Ghi chú" name="note">
        <Input.TextArea
          placeholder="Nhập ghi chú (tùy chọn)"
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
          Ghi nhận thanh toán
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PaymentForm;
