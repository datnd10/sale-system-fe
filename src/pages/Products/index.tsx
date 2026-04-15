import { useState } from 'react';
import { Button, Modal, Popconfirm, Select, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ProductForm from '../../components/forms/ProductForm';
import { formatCurrency } from '../../utils/formatters';
import type { Product, CreateProductDto } from '../../types';

const { Title } = Typography;

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const { data: products, isLoading, error } = useProducts(selectedCategoryId);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

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

  const handleDelete = (id: number) => {
    deleteProduct.mutate(id);
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
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="large">
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
          Sản phẩm
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

      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="Lọc theo danh mục"
          size="large"
          allowClear
          loading={categoriesLoading}
          style={{ width: 240 }}
          options={categories?.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(value) => setSelectedCategoryId(value)}
        />
      </div>

      <Table<Product>
        dataSource={products ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        size="middle"
        style={{ fontSize: 16 }}
        locale={{ emptyText: 'Chưa có sản phẩm nào' }}
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
                  unit: editingProduct.unit,
                  price: editingProduct.price,
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
