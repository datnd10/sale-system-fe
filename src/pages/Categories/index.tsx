import { useState } from 'react';
import { Button, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import CategoryForm from '../../components/forms/CategoryForm';
import type { Category, CreateCategoryDto } from '../../types';

const { Title } = Typography;

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = (values: CreateCategoryDto) => {
    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, data: values },
        { onSuccess: handleCloseModal },
      );
    } else {
      createCategory.mutate(values, { onSuccess: handleCloseModal });
    }
  };

  const handleDelete = (id: number) => {
    deleteCategory.mutate(id);
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const columns: ColumnsType<Category> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc?: string) => desc ?? '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
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
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa danh mục này không?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, size: 'large' }}
            cancelButtonProps={{ size: 'large' }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="large"
            >
              Xóa
            </Button>
          </Popconfirm>
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
        message="Không thể tải danh sách danh mục"
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
          Danh mục
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreate}
        >
          Thêm danh mục
        </Button>
      </div>

      <Table<Category>
        dataSource={categories ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có danh mục nào' }}
      />

      <Modal
        title={
          <span style={{ fontSize: 18 }}>
            {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
          </span>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        <CategoryForm
          key={editingCategory?.id ?? 'new'}
          initialValues={
            editingCategory
              ? { name: editingCategory.name, description: editingCategory.description }
              : undefined
          }
          onFinish={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Categories;
