import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav';

const { Sider, Content } = Layout;

const AppLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', fontSize: 16 }}>
      <Sider
        width={220}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          overflow: 'auto',
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
            overflow: 'hidden',
          }}
        >
          🏗️ Vật liệu XD
        </div>
        <SidebarNav />
      </Sider>

      <Layout style={{ marginLeft: 220 }}>
        <Content
          style={{
            padding: 24,
            minHeight: '100vh',
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
