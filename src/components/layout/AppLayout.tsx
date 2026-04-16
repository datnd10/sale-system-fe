import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav';

const { Sider, Content } = Layout;

const AppLayout = () => {
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
        <SidebarNav />
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
