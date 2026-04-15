import { useState } from 'react';
import { Button, DatePicker, Modal, Space, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { usePayments, useCreatePayment } from '../../hooks/usePayments';
import PaymentForm from '../../components/forms/PaymentForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Payment, PaymentFilters, CreatePaymentDto } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Payments = () => {
  const [filters, setFilters] = useState<PaymentFilters>({
    from: dayjs().startOf('month').format('YYYY-MM-DD'),
    to: dayjs().endOf('month').format('YYYY-MM-DD'),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: payments, isLoading, error } = usePayments(filters);
  const createPaymentMutation = useCreatePayment();

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        from: dates[0].format('YYYY-MM-DD'),
        to: dates[1].format('YYYY-MM-DD'),
      });
    } else {
      setFilters({});
    }
  };

  const handleFormFinish = (values: CreatePaymentDto) => {
    createPaymentMutation.mutate(values, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  const columns: ColumnsType<Payment> = [
    {
      title: 'Mã thanh toán',
      dataIndex: 'code',
      key: 'code',
      width: 160,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 180,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 160,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note?: string) => note ?? '—',
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Không thể tải danh sách thanh toán"
        description={(error as Error).message}
      />
    );
  }

  const paymentList = payments ?? [];
  const totalAmount = paymentList.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Thanh toán
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          Ghi nhận thanh toán
        </Button>
      </div>

      {/* Filters */}
      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker
          size="large"
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          defaultValue={[
            dayjs().startOf('month'),
            dayjs().endOf('month'),
          ]}
          onChange={handleDateRangeChange}
        />
      </Space>

      {/* Summary */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>
          Tổng đã thu:{' '}
          <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
            {formatCurrency(totalAmount)}
          </Text>
        </Text>
      </div>

      <Table<Payment>
        dataSource={paymentList}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có thanh toán nào' }}
      />

      <Modal
        title="Ghi nhận thanh toán"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <PaymentForm
          onFinish={handleFormFinish}
          isSubmitting={createPaymentMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Payments;
