import { forwardRef } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PRODUCT_UNIT_OPTIONS } from '../../types';
import type { Order, OrderItem } from '../../types';

interface OrderPrintProps {
  order: Order;
  items: OrderItem[];
  customerPhone?: string;
  customerAddress?: string;
}

const SHOP_INFO = {
  name: 'Đại Lý Thành Đạt',
  phone: '0904647794',
  address: 'Số 124, Đường Nguyễn Trực, Phú Lãm, Hà Đông, Hà Nội',
  payment: 'Nguyễn Đắc Thành - STK: 0904647794 - MB Bank',
  products: 'Bán buôn, Bán lẻ, Tôn 3 Lớp, Tôn 1 Lớp, Panel, Sắt Hình Hộp, ...',
};

const OrderPrint = forwardRef<HTMLDivElement, OrderPrintProps>(
  ({ order, items, customerPhone, customerAddress }, ref) => {
    const totalAmount = order.totalAmount;
    const paidImmediately = order.paidImmediately;
    const remaining = totalAmount - paidImmediately;

    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 13,
          color: '#000',
          padding: '16px 20px',
          maxWidth: 680,
          margin: '0 auto',
          background: '#fff',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{SHOP_INFO.name}</div>
          <div>Điện thoại: {SHOP_INFO.phone}</div>
          <div>Địa chỉ: {SHOP_INFO.address}</div>
          <div>Thông tin thanh toán: {SHOP_INFO.payment}</div>
          <div>{SHOP_INFO.products}</div>
        </div>

        <hr style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

        {/* Invoice title + customer info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              HÓA ĐƠN BÁN HÀNG
            </div>
            <div><strong>Khách hàng:</strong> {order.customerName}</div>
            <div>
              <strong>Ngày</strong>{' '}
              {(() => {
                const d = new Date(order.orderDate);
                return `${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
              })()}
            </div>
            <div><strong>Điện thoại:</strong> {customerPhone ?? ''}</div>
            <div><strong>Địa chỉ:</strong> {customerAddress ?? ''}</div>
            <div><strong>Số phiếu:</strong> {order.code}</div>
          </div>
        </div>

        <hr style={{ borderTop: '1px solid #000', margin: '8px 0' }} />

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '4px 4px', width: 24 }}>STT</th>
              <th style={{ textAlign: 'left', padding: '4px 4px' }}>Tên hàng</th>
              <th style={{ textAlign: 'center', padding: '4px 4px', width: 50 }}>ĐVT</th>
              <th style={{ textAlign: 'center', padding: '4px 4px', width: 50 }}>SL</th>
              <th style={{ textAlign: 'center', padding: '4px 4px', width: 60 }}>Dài</th>
              <th style={{ textAlign: 'center', padding: '4px 4px', width: 60 }}>Rộng</th>
              <th style={{ textAlign: 'right', padding: '4px 4px', width: 90 }}>Đơn giá</th>
              <th style={{ textAlign: 'right', padding: '4px 4px', width: 100 }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const unitLabel = PRODUCT_UNIT_OPTIONS.find((u) => u.value === item.productUnit)?.label ?? item.productUnit ?? item.unit;
              return (
                <tr key={item.id} style={{ borderBottom: '1px dashed #ccc' }}>
                  <td style={{ padding: '4px 4px' }}>{idx + 1}</td>
                  <td style={{ padding: '4px 4px' }}>{item.productName}</td>
                  <td style={{ textAlign: 'center', padding: '4px 4px' }}>{unitLabel}</td>
                  <td style={{ textAlign: 'center', padding: '4px 4px' }}>{item.count}</td>
                  <td style={{ textAlign: 'center', padding: '4px 4px' }}>{item.length ?? '—'}</td>
                  <td style={{ textAlign: 'center', padding: '4px 4px' }}>{item.width ?? '—'}</td>
                  <td style={{ textAlign: 'right', padding: '4px 4px' }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', padding: '4px 4px' }}>{formatCurrency(item.subtotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid #000' }}>
              <td colSpan={7} style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 700 }}>
                Tổng tiền:
              </td>
              <td style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 700 }}>
                {formatCurrency(totalAmount)}
              </td>
            </tr>
            {paidImmediately > 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'right', padding: '2px 4px' }}>
                  Đã thanh toán:
                </td>
                <td style={{ textAlign: 'right', padding: '2px 4px' }}>
                  {formatCurrency(paidImmediately)}
                </td>
              </tr>
            )}
            {remaining > 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'right', padding: '2px 4px', fontWeight: 700, color: '#c00' }}>
                  Còn nợ:
                </td>
                <td style={{ textAlign: 'right', padding: '2px 4px', fontWeight: 700, color: '#c00' }}>
                  {formatCurrency(remaining)}
                </td>
              </tr>
            )}
          </tfoot>
        </table>

        <hr style={{ borderTop: '1px solid #000', margin: '8px 0' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Người mua hàng</div>
            <div style={{ color: '#666', fontSize: 11 }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ marginTop: 40 }}></div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Người bán hàng</div>
            <div style={{ color: '#666', fontSize: 11 }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ marginTop: 40 }}></div>
          </div>
        </div>

        {/* Print-only styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #order-print-area, #order-print-area * { visibility: visible; }
            #order-print-area { position: absolute; left: 0; top: 0; width: 100%; }
            @page { margin: 10mm; size: A4; }
          }
        `}</style>
      </div>
    );
  }
);

OrderPrint.displayName = 'OrderPrint';
export default OrderPrint;
