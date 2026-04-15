import { Empty } from 'antd';

interface EmptyStateProps {
  description?: string;
}

const EmptyState = ({ description = 'Không có dữ liệu' }: EmptyStateProps) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 0',
        width: '100%',
      }}
    >
      <Empty description={description} />
    </div>
  );
};

export default EmptyState;
