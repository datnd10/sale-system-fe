import { useState } from 'react';
import { Button, Input, Modal, Popconfirm, Select, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  useSearchProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ProductForm from '../../components/forms/ProductForm';
import { formatCurrency } from '../../utils/formatters';
import { PRODUCT_UNIT_OPTIONS } from '../../types';
import type { Product, CreateProductDto, ProductSearchParams } from '../../types';

const { Title } = Typography;
const DEFAULT_PAGE_SIZE = 10;

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: 'createdAt',
    direction: 'DESC',
  });

  const { data: pageData, isLoading, error } = useSearchProducts(searchParams);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      name: inputValue.trim() || undefined,
      page: 0,
    }));
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setSearchParams((prev) => ({
      ...prev,
      categoryId,
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
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (values: CreateProductDto) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: values },
        { onSuccess: handleCloseModal },
      );
    } else {
      createProduct.mutate(values, { onSuccess: handleCloseModal });
    }
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const columns: ColumnsType<Product> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (unit: string) =>
        PRODUCT_UNIT_OPTIONS.find((u) => u.value === unit)?.label ?? unit,
    },
    {
      title: 'Rộng (m)',
      dataIndex: 'width',
      key: 'width',
      width: 100,
      render: (width?: number) => width ?? '—',
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 160,
      render: (price: number) => formatCurrency(price),
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
            description="Bạn có chắc muốn xóa sản phẩm này không?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, size: 'large' }}
            cancelButtonProps={{ size: 'large' }}
            onConfirm={() => deleteProduct.mutate(record.id)}
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
        message="Không thể tải danh sách sản phẩm"
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
          Quản Lý Sản Phẩm
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreate}
        >
          Thêm sản phẩm
        </Button>
      </div>

      {/* Search + filter */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên sản phẩm..."
          prefix={<SearchOutlined />}
          size="large"
          allowClear
          style={{ width: 280 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Select
          placeholder="Lọc theo danh mục"
          size="large"
          allowClear
          loading={categoriesLoading}
          style={{ width: 220 }}
          options={categories?.map((c) => ({ value: c.id, label: c.name }))}
          onChange={handleCategoryFilter}
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

      <Table<Product>
        dataSource={pageData?.content ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có sản phẩm nào' }}
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
            {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          </span>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnHidden
      >
        <ProductForm
          key={editingProduct?.id ?? 'new'}
          initialValues={
            editingProduct
              ? {
                  name: editingProduct.name,
                  categoryId: editingProduct.categoryId,
                  unit: editingProduct.unit as import('../../types').ProductUnit,
                  price: editingProduct.price,
                  width: editingProduct.width,
                  description: editingProduct.description,
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

export default Products;
