import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSearchOrders } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Order, OrderFilters, OrderType } from '../../types';
import { ORDER_TYPE_LABELS } from '../../types';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 10;

const orderTypeColor: Record<OrderType, string> = {
  SALE: 'blue',
  PAYMENT: 'green',
};

const Orders = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OrderFilters>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: 'orderDate',
    direction: 'DESC',
  });

  const { data: pageData, isLoading, error } = useSearchOrders(filters);
  const { data: customers, isLoading: customersLoading } = useCustomers();

  const handleCustomerChange = (customerId: number | undefined) => {
    setFilters((prev) => ({ ...prev, customerId, page: 0 }));
  };

  const handleOrderTypeChange = (orderType: OrderType | undefined) => {
    setFilters((prev) => ({ ...prev, orderType, page: 0 }));
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
      setFilters((prev) => {
        const { from: _f, to: _t, ...rest } = prev;
        return { ...rest, page: 0 };
      });
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setFilters((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
    }));
  };

  const columns: ColumnsType<Order> = [
    { title: 'Mã đơn', dataIndex: 'code', key: 'code', width: 140 },
    {
      title: 'Loại', dataIndex: 'orderType', key: 'orderType', width: 110,
      render: (type: OrderType) => (
        <Tag color={orderTypeColor[type]}>{ORDER_TYPE_LABELS[type]}</Tag>
      ),
    },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'Ngày', dataIndex: 'orderDate', key: 'orderDate', width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Số tiền', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right',
      render: (amount: number, record) => (
        <span style={{ color: record.orderType === 'PAYMENT' ? '#52c41a' : undefined }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Đã trả ngay', dataIndex: 'paidImmediately', key: 'paidImmediately', width: 150, align: 'right',
      render: (amount: number, record) =>
        record.orderType === 'SALE'
          ? <span style={{ color: '#52c41a' }}>{formatCurrency(amount)}</span>
          : <span style={{ color: '#aaa' }}>—</span>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 120,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} size="large" onClick={() => navigate(`/orders/${record.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  if (error) {
    return <ErrorMessage message="Không thể tải danh sách đơn hàng" description={(error as Error).message} />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Đơn hàng</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/orders/new')}>
          Tạo đơn hàng
        </Button>
      </div>

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
        <Select
          placeholder="Loại đơn"
          size="large"
          allowClear
          style={{ width: 150 }}
          options={[
            { value: 'SALE', label: 'Bán hàng' },
            { value: 'PAYMENT', label: 'Trả nợ' },
          ]}
          onChange={handleOrderTypeChange}
        />
        <RangePicker
          size="large"
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={handleDateRangeChange}
        />
      </Space>

      <Table<Order>
        dataSource={pageData?.content ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading ? { indicator: <LoadingSpinner /> } : false}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có đơn hàng nào' }}
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
    </div>
  );
};

export default Orders;
