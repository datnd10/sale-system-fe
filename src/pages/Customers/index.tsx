import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  useSearchCustomers,
  useCreateCustomer,
  useUpdateCustomer,
} from '../../hooks/useCustomers';
import ErrorMessage from '../../components/common/ErrorMessage';
import CustomerForm from '../../components/forms/CustomerForm';
import type { Customer, CreateCustomerDto, CustomerSearchParams } from '../../types';

const { Title } = Typography;
const DEFAULT_PAGE_SIZE = 10;

const Customers = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchParams, setSearchParams] = useState<CustomerSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: 'createdAt',
    direction: 'DESC',
  });

  const { data: pageData, isLoading, error } = useSearchCustomers(searchParams);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      name: inputValue.trim() || undefined,
      page: 0,
    }));
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setSearchParams((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
    }));
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = (values: CreateCustomerDto) => {
    if (editingCustomer) {
      updateCustomer.mutate(
        { id: editingCustomer.id, data: values },
        { onSuccess: handleCloseModal },
      );
    } else {
      createCustomer.mutate(values, { onSuccess: handleCloseModal });
    }
  };

  const isSubmitting = createCustomer.isPending || updateCustomer.isPending;

  const columns: ColumnsType<Customer> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone?: string) => phone ?? '—',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address?: string) => address ?? '—',
    },
    {
      title: 'Trạng thái nợ',
      dataIndex: 'hasDebt',
      key: 'hasDebt',
      width: 140,
      render: (hasDebt: boolean) =>
        hasDebt ? (
          <Tag color="red" style={{ fontSize: 14 }}>Đang nợ</Tag>
        ) : (
          <Tag color="green" style={{ fontSize: 14 }}>Không nợ</Tag>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="large"
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="large"
            onClick={() => navigate(`/customers/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <ErrorMessage
        message="Không thể tải danh sách khách hàng"
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
          Khách hàng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreate}
        >
          Thêm khách hàng
        </Button>
      </div>

      {/* Search bar */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên khách hàng..."
          prefix={<SearchOutlined />}
          size="large"
          allowClear
          style={{ width: 300 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          size="large"
          onClick={handleSearch}
        >
          Tìm kiếm
        </Button>
      </Space>

      <Table<Customer>
        dataSource={pageData?.content ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: searchParams.name ? 'Không tìm thấy khách hàng nào' : 'Chưa có khách hàng nào' }}
        pagination={{
          current: (searchParams.page ?? 0) + 1,
          pageSize: searchParams.size ?? DEFAULT_PAGE_SIZE,
          total: pageData?.totalElements ?? 0,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={
          <span style={{ fontSize: 18 }}>
            {editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
          </span>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnHidden
      >
        <CustomerForm
          key={editingCustomer?.id ?? 'new'}
          initialValues={
            editingCustomer
              ? {
                  name: editingCustomer.name,
                  phone: editingCustomer.phone,
                  address: editingCustomer.address,
                }
              : undefined
          }
          onFinish={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Customers;
