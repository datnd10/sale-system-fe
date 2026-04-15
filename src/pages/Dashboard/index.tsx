import { useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Typography,
  DatePicker,
  Space,
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useRevenueStatistics, useMonthlyRevenue, useDebtSummary } from '../../hooks/useStatistics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency } from '../../utils/formatters';
import type { MonthlyRevenue, DebtSummary } from '../../types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const currentYear = dayjs().year();
const defaultFrom = dayjs().startOf('month').format('YYYY-MM-DD');
const defaultTo = dayjs().format('YYYY-MM-DD');

const monthlyRevenueColumns: ColumnsType<MonthlyRevenue> = [
  {
    title: 'Tháng',
    dataIndex: 'month',
    key: 'month',
    width: 100,
    render: (month: number) => `Tháng ${month}`,
  },
  {
    title: 'Doanh thu',
    dataIndex: 'revenue',
    key: 'revenue',
    render: (revenue: number) => (
      <span style={{ fontWeight: 600 }}>{formatCurrency(revenue)}</span>
    ),
  },
];

const debtSummaryColumns: ColumnsType<DebtSummary> = [
  {
    title: 'Mã KH',
    dataIndex: 'customerCode',
    key: 'customerCode',
    width: 120,
  },
  {
    title: 'Tên khách hàng',
    dataIndex: 'customerName',
    key: 'customerName',
  },
  {
    title: 'SĐT',
    dataIndex: 'customerPhone',
    key: 'customerPhone',
    render: (phone?: string) => phone ?? '—',
  },
  {
    title: 'Tổng nợ',
    dataIndex: 'totalDebt',
    key: 'totalDebt',
    render: (debt: number) => (
      <span style={{ color: debt > 0 ? '#cf1322' : undefined, fontWeight: 600 }}>
        {formatCurrency(debt)}
      </span>
    ),
  },
];

const Dashboard = () => {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useRevenueStatistics(from, to);

  const {
    data: monthlyRevenue,
    isLoading: monthlyLoading,
    error: monthlyError,
  } = useMonthlyRevenue(currentYear);

  const {
    data: debtSummary,
    isLoading: debtLoading,
    error: debtError,
  } = useDebtSummary();

  const handleRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFrom(dates[0].format('YYYY-MM-DD'));
      setTo(dates[1].format('YYYY-MM-DD'));
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard
      </Title>

      {/* Date range picker */}
      <Space style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 16 }}>Khoảng thời gian:</span>
        <RangePicker
          defaultValue={[dayjs().startOf('month'), dayjs()]}
          format="DD/MM/YYYY"
          onChange={handleRangeChange}
          style={{ fontSize: 16 }}
        />
      </Space>

      {/* Statistics cards */}
      {statsLoading ? (
        <LoadingSpinner />
      ) : statsError ? (
        <ErrorMessage
          message="Không thể tải thống kê doanh thu"
          description={(statsError as Error).message}
        />
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={<span style={{ fontSize: 16 }}>Tổng đơn hàng</span>}
                value={stats?.totalOrders ?? 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ fontSize: 28, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={<span style={{ fontSize: 16 }}>Tổng doanh thu</span>}
                value={stats?.totalRevenue ?? 0}
                prefix={<DollarOutlined />}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={<span style={{ fontSize: 16 }}>Tổng đã thu</span>}
                value={stats?.totalPaid ?? 0}
                prefix={<CheckCircleOutlined />}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={<span style={{ fontSize: 16 }}>Tổng còn nợ</span>}
                value={stats?.totalDebt ?? 0}
                prefix={<ExclamationCircleOutlined />}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Monthly revenue table */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 18, fontWeight: 600 }}>
                Doanh thu theo tháng ({currentYear})
              </span>
            }
          >
            {monthlyLoading ? (
              <LoadingSpinner />
            ) : monthlyError ? (
              <ErrorMessage
                message="Không thể tải doanh thu theo tháng"
                description={(monthlyError as Error).message}
              />
            ) : (
              <Table<MonthlyRevenue>
                dataSource={monthlyRevenue ?? []}
                columns={monthlyRevenueColumns}
                rowKey="month"
                pagination={false}
                size="middle"
                style={{ fontSize: 16 }}
              />
            )}
          </Card>
        </Col>

        {/* Top debtors table */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 18, fontWeight: 600 }}>
                Khách hàng còn nợ
              </span>
            }
          >
            {debtLoading ? (
              <LoadingSpinner />
            ) : debtError ? (
              <ErrorMessage
                message="Không thể tải danh sách công nợ"
                description={(debtError as Error).message}
              />
            ) : (
              <Table<DebtSummary>
                dataSource={debtSummary ?? []}
                columns={debtSummaryColumns}
                rowKey="customerId"
                pagination={{ pageSize: 10 }}
                size="middle"
                style={{ fontSize: 16 }}
                locale={{ emptyText: 'Không có khách hàng nào đang nợ' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
