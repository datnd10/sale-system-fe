import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
} from '../../hooks/useCustomers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import CustomerForm from '../../components/forms/CustomerForm';
import type { Customer, CreateCustomerDto } from '../../types';

const { Title } = Typography;

const Customers = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customers, isLoading, error } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

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
          <Tag color="red" style={{ fontSize: 14 }}>
            Đang nợ
          </Tag>
        ) : (
          <Tag color="green" style={{ fontSize: 14 }}>
            Không nợ
          </Tag>
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

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

      <Table<Customer>
        dataSource={customers ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có khách hàng nào' }}
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
        destroyOnClose
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
