import { forwardRef } from 'react';
import { PRODUCT_UNIT_OPTIONS } from '../../types';
import type { Order, OrderItem } from '../../types';

interface OrderPrintProps {
  order: Order;
  items: OrderItem[];
  customerPhone?: string;
  customerAddress?: string;
  /** Tổng nợ hiện tại của khách (sau đơn này) */
  currentDebt?: number;
}

const SHOP_INFO = {
  name: 'Hộ kinh doanh Nguyễn Thị Thanh Nga',
  phone: '0904647794',
  address: 'Số 124, Đường Nguyễn Trực, Phú Lãm, Hà Đông, Hà Nội',
  payment: 'HKD Nguyễn Thị Thanh Nga - STK: 2200235000747 - Agribank',
  products: 'Bán buôn, Bán lẻ, Tôn 3 Lớp, Tôn 1 Lớp, Panel, Sắt Hình Hộp, ...',
};

/** Format số không có ký hiệu tiền tệ, dùng dấu phẩy ngăn cách */
const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n));

const OrderPrint = forwardRef<HTMLDivElement, OrderPrintProps>(
  ({ order, items, customerPhone, customerAddress, currentDebt }, ref) => {
    const totalAmount = order.totalAmount;
    const paidImmediately = order.paidImmediately;

    // Nợ cũ = nợ hiện tại + tiền đơn này - tiền đã trả ngay
    // (vì currentDebt đã trừ paidImmediately rồi)
    const debtFromThisOrder = totalAmount - paidImmediately;
    const oldDebt = currentDebt !== undefined
      ? currentDebt - debtFromThisOrder
      : undefined;
    const newDebt = currentDebt;

    // Tổng số lượng (quantity) tất cả items
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || item.count || 0), 0);

    const d = new Date(order.orderDate);
    const dateStr = `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;

    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          color: '#000',
          padding: '12px 16px',
          maxWidth: 680,
          margin: '0 auto',
          background: '#fff',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{SHOP_INFO.name}</div>
          <div style={{ fontSize: 12 }}>Điện thoại: {SHOP_INFO.phone}</div>
          <div style={{ fontSize: 12 }}>Địa chỉ: {SHOP_INFO.address}</div>
          <div style={{ fontSize: 12 }}>
            <strong>Thông tin thanh toán:</strong> {SHOP_INFO.payment}
          </div>
          <div style={{ fontSize: 12 }}>{SHOP_INFO.products}</div>
        </div>

        <hr style={{ borderTop: '2px solid #000', margin: '6px 0' }} />

        {/* ── TITLE + CUSTOMER INFO ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              HÓA ĐƠN BÁN HÀNG
            </div>
            <div><strong>Khách hàng:</strong> {order.customerName}</div>
            <div>{dateStr}</div>
            <div><strong>Điện thoại:</strong> {customerPhone ?? ''}</div>
            <div><strong>Địa chỉ:</strong> {customerAddress ?? ''}</div>
            <div><strong>Số phiếu:</strong> {order.code}</div>
          </div>
          {/* QR thanh toán */}
          <div style={{ flexShrink: 0, marginLeft: 12 }}>
            <img
              src="/qr.png"
              alt="QR thanh toán"
              style={{ width: 90, height: 90, display: 'block' }}
            />
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={thStyle({ width: 28 })}>TT</th>
              <th style={thStyle({})}>Tên hàng hóa</th>
              <th style={thStyle({ width: 36 })}>ĐVT</th>
              <th style={thStyle({ width: 40 })}>D</th>
              <th style={thStyle({ width: 44 })}>T/C</th>
              <th style={thStyle({ width: 40 })}>K</th>
              <th style={thStyle({ width: 52 })}>SL</th>
              <th style={thStyle({ width: 80, textAlign: 'right' })}>Đơn giá</th>
              <th style={thStyle({ width: 90, textAlign: 'right' })}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const unitLabel = PRODUCT_UNIT_OPTIONS.find((u) => u.value === item.productUnit)?.label ?? item.productUnit;
              return (
                <tr key={item.id} style={{ borderBottom: '1px dashed #ccc' }}>
                  <td style={tdStyle({ textAlign: 'center' })}>{idx + 1}</td>
                  <td style={tdStyle({})}>{item.productName}</td>
                  <td style={tdStyle({ textAlign: 'center' })}>{unitLabel}</td>
                  <td style={tdStyle({ textAlign: 'center' })}>{item.length ?? 0}</td>
                  <td style={tdStyle({ textAlign: 'center' })}>{item.count}</td>
                  <td style={tdStyle({ textAlign: 'center' })}>0</td>
                  <td style={tdStyle({ textAlign: 'center' })}>
                    {fmt(Number(item.quantity || item.count || 0))}
                  </td>
                  <td style={tdStyle({ textAlign: 'right' })}>{fmt(item.unitPrice)}</td>
                  <td style={tdStyle({ textAlign: 'right' })}>{fmt(item.subtotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {/* Dòng tổng số lượng */}
            <tr style={{ borderTop: '1px solid #000', background: '#f9f9f9' }}>
              <td colSpan={5} style={tdStyle({ fontWeight: 700 })}>
                Tổng số lượng: {order.note ?? ''}
              </td>
              <td style={tdStyle({ textAlign: 'center' })}></td>
              <td style={tdStyle({ textAlign: 'center', fontWeight: 700 })}>
                {fmt(totalQuantity)}
              </td>
              <td style={tdStyle({})}></td>
              <td style={tdStyle({ textAlign: 'right', fontWeight: 700 })}>
                {fmt(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ── SUMMARY ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 2 }}>
          <tbody>
            <tr>
              <td style={{ padding: '2px 4px', width: '60%' }}>Tổng cộng tiền hàng:</td>
              <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 600 }}>
                {fmt(totalAmount)}
              </td>
            </tr>
            {oldDebt !== undefined && oldDebt > 0 && (
              <tr>
                <td style={{ padding: '2px 4px' }}>Nợ cũ:</td>
                <td style={{ padding: '2px 4px', textAlign: 'right' }}>{fmt(oldDebt)}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '2px 4px' }}>Khách đưa:</td>
              <td style={{ padding: '2px 4px', textAlign: 'right' }}>{fmt(paidImmediately)}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 4px', fontWeight: 600 }}>Nợ mới:</td>
              <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 600 }}>
                {newDebt !== undefined ? fmt(newDebt) : fmt(totalAmount - paidImmediately)}
              </td>
            </tr>
          </tbody>
        </table>

        <hr style={{ borderTop: '1px solid #000', margin: '8px 0' }} />

        {/* ── FOOTER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Người mua</div>
            <div style={{ color: '#555', fontSize: 10 }}>(Ký, họ tên)</div>
            <div style={{ marginTop: 36 }}></div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Người bán</div>
            <div style={{ color: '#555', fontSize: 10 }}>(Ký, đóng dấu, họ tên)</div>
            <div style={{ marginTop: 36 }}></div>
          </div>
        </div>

        {/* Print-only styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #order-print-area, #order-print-area * { visibility: visible; }
            #order-print-area { position: absolute; left: 0; top: 0; width: 100%; }
            @page { margin: 8mm; size: A5 landscape; }
          }
        `}</style>
      </div>
    );
  }
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function thStyle(extra: React.CSSProperties): React.CSSProperties {
  return {
    border: '1px solid #000',
    padding: '3px 4px',
    textAlign: 'center',
    fontWeight: 700,
    ...extra,
  };
}

function tdStyle(extra: React.CSSProperties): React.CSSProperties {
  return {
    border: '1px solid #ccc',
    padding: '3px 4px',
    ...extra,
  };
}

OrderPrint.displayName = 'OrderPrint';
export default OrderPrint;
