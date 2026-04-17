import { useState } from 'react';
import { Button, DatePicker, Input, Modal, Space, Table, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSearchPayments, useCreatePayment } from '../../hooks/usePayments';
import PaymentForm from '../../components/forms/PaymentForm';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Payment, PaymentFilters, CreatePaymentDto } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 10;

const Payments = () => {
  const [filters, setFilters] = useState<PaymentFilters>({
    from: dayjs().startOf('month').format('YYYY-MM-DD'),
    to: dayjs().endOf('month').format('YYYY-MM-DD'),
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: 'paymentDate',
    direction: 'DESC',
  });
  const [nameInput, setNameInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: pageData, isLoading, error } = useSearchPayments(filters);
  const createPaymentMutation = useCreatePayment();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, customerName: nameInput.trim() || undefined, page: 0 }));
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        from: dates[0]!.format('YYYY-MM-DD'),
        to: dates[1]!.format('YYYY-MM-DD'),
        page: 0,
      }));
    } else {
      setFilters((prev) => { const { from: _f, to: _t, ...rest } = prev; return { ...rest, page: 0 }; });
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setFilters((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
    }));
  };

  const columns: ColumnsType<Payment> = [
    { title: 'Mã thanh toán', dataIndex: 'code', key: 'code', width: 160 },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'Số tiền', dataIndex: 'amount', key: 'amount', width: 180, align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Ngày thanh toán', dataIndex: 'paymentDate', key: 'paymentDate', width: 160,
      render: (date: string) => formatDate(date),
    },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', render: (note?: string) => note ?? '—' },
  ];

  if (error) {
    return <ErrorMessage message="Không thể tải danh sách thanh toán" description={(error as Error).message} />;
  }

  const totalAmount = (pageData?.content ?? []).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Thanh toán</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalOpen(true)}>
          Ghi nhận thanh toán
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên khách hàng..."
          prefix={<SearchOutlined />}
          size="large"
          allowClear
          style={{ width: 260 }}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button type="primary" icon={<SearchOutlined />} size="large" onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <RangePicker
          size="large"
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
          onChange={handleDateRangeChange}
        />
      </Space>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>
          Tổng đã thu (trang này):{' '}
          <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{formatCurrency(totalAmount)}</Text>
        </Text>
      </div>

      <Table<Payment>
        dataSource={pageData?.content ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có thanh toán nào' }}
        pagination={{
          current: (filters.page ?? 0) + 1,
          pageSize: filters.size ?? DEFAULT_PAGE_SIZE,
          total: pageData?.totalElements ?? 0,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi`,
        }}
        onChange={handleTableChange}
      />

      <Modal title="Ghi nhận thanh toán" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} destroyOnHidden>
        <PaymentForm
          onFinish={(values: CreatePaymentDto) => {
            createPaymentMutation.mutate(values, { onSuccess: () => setIsModalOpen(false) });
          }}
          isSubmitting={createPaymentMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Payments;
