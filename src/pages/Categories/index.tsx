import { useState, useRef } from 'react';
import { Button, Input, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  useSearchCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import CategoryForm from '../../components/forms/CategoryForm';
import type { Category, CreateCategoryDto, CategorySearchParams } from '../../types';

const { Title } = Typography;
const DEFAULT_PAGE_SIZE = 10;

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchParams, setSearchParams] = useState<CategorySearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: 'createdAt',
    direction: 'DESC',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: pageData, isLoading, error } = useSearchCategories(searchParams);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

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
            onConfirm={() => deleteCategory.mutate(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="large">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
          Quản Lý Danh Mục
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

      {/* Search bar */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          ref={inputRef}
          placeholder="Tìm theo tên danh mục..."
          prefix={<SearchOutlined />}
          size="large"
          allowClear
          style={{ width: 320 }}
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

      <Table<Category>
        dataSource={pageData?.content ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: searchParams.name ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào' }}
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
            {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
          </span>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnHidden
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
