import { Spin } from 'antd';

interface LoadingSpinnerProps {
  tip?: string;
}

const LoadingSpinner = ({ tip = 'Đang tải...' }: LoadingSpinnerProps) => {
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
      <Spin size="large" description={tip} />
    </div>
  );
};

export default LoadingSpinner;
