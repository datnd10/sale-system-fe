import { Menu } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/categories',
    icon: <AppstoreOutlined />,
    label: 'Danh mục',
  },
  {
    key: '/products',
    icon: <ShoppingOutlined />,
    label: 'Sản phẩm',
  },
  {
    key: '/customers',
    icon: <TeamOutlined />,
    label: 'Khách hàng',
  },
  {
    key: '/orders',
    icon: <FileTextOutlined />,
    label: 'Đơn hàng',
  },
  {
    key: '/debts',
    icon: <DollarOutlined />,
    label: 'Công nợ',
  },
  {
    key: '/payments',
    icon: <CreditCardOutlined />,
    label: 'Thanh toán',
  },
];

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the active key based on current pathname
  const getSelectedKey = (): string => {
    const { pathname } = location;
    if (pathname === '/') return '/';
    // Match the most specific route prefix
    const match = menuItems
      .filter((item) => item.key !== '/')
      .find((item) => pathname.startsWith(item.key));
    return match ? match.key : '/';
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      style={{ height: '100%', borderRight: 0, fontSize: 16 }}
    />
  );
};

export default SidebarNav;
