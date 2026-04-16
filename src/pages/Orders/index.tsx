import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Select, Space, Table, Typography } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useOrders } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { defaultPagination } from '../../utils/tableConfig';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Order, OrderFilters } from '../../types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Orders = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OrderFilters>({});

  const { data: orders, isLoading, error } = useOrders(filters);
  const { data: customers, isLoading: customersLoading } = useCustomers();

  const handleCustomerChange = (customerId: number | undefined) => {
    setFilters((prev) => ({ ...prev, customerId }));
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        from: dates[0]!.format('YYYY-MM-DD'),
        to: dates[1]!.format('YYYY-MM-DD'),
      }));
    } else {
      setFilters((prev) => {
        const { from: _f, to: _t, ...rest } = prev;
        return rest;
      });
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 130,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 160,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidImmediately',
      key: 'paidImmediately',
      width: 160,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#52c41a' }}>{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="large"
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Không thể tải danh sách đơn hàng"
        description={(error as Error).message}
      />
    );
  }

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
          Đơn hàng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/orders/new')}
        >
          Tạo đơn hàng
        </Button>
      </div>

      {/* Filters */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Lọc theo khách hàng"
          size="large"
          allowClear
          loading={customersLoading}
          style={{ minWidth: 220 }}
          showSearch
          optionFilterProp="label"
          options={customers?.map((c) => ({ value: c.id, label: c.name }))}
          onChange={handleCustomerChange}
        />
        <RangePicker
          size="large"
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={handleDateRangeChange}
        />
      </Space>

      <Table<Order>
        dataSource={orders ?? []}
        columns={columns}
        rowKey="id"
        pagination={defaultPagination}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có đơn hàng nào' }}
      />
    </div>
  );
};

export default Orders;
