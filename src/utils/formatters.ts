import dayjs from 'dayjs';

// Định dạng tiền Việt Nam: 1500000 → "1.500.000 ₫"
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Định dạng ngày: Date | string | Dayjs → "25/12/2024"
export const formatDate = (date: Date | string | dayjs.Dayjs): string =>
  dayjs(date).format('DD/MM/YYYY');

// Hiển thị giá trị hoặc dấu gạch ngang nếu null/undefined
export const formatValue = (value: unknown): string =>
  value == null ? '—' : String(value);
