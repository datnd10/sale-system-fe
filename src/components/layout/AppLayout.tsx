import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import SidebarNav from './SidebarNav';
import { removeToken } from '../../utils/auth';

const { Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        width={220}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          height: '100vh',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            borderBottom: '1px solid #f0f0f0',
            padding: '0 16px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          🏗️ Vật liệu XD
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SidebarNav />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
          <Button
            icon={<LogoutOutlined />}
            size="large"
            block
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      <Layout style={{ overflow: 'hidden' }}>
        <Content
          style={{
            height: '100vh',
            overflowY: 'auto',
            padding: 24,
            background: '#f5f5f5',
            fontSize: 16,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
