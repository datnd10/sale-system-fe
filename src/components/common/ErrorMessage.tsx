import { Alert } from 'antd';

interface ErrorMessageProps {
  message: string;
  description?: string;
}

const ErrorMessage = ({ message, description }: ErrorMessageProps) => {
  return (
    <Alert
      type="error"
      message={message}
      description={description}
      showIcon
      style={{ margin: '16px 0' }}
    />
  );
};

export default ErrorMessage;
