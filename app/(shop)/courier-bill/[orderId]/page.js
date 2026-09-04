export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import Settings from '@/models/Settings';
import { formatINR } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';

const INK = '#241B21';
const INK_SOFT = '#9C877D';
const PEACH = '#D9946A';
const PEACH_LIGHT = '#F7EDE4';
const LINE = '#EEE3DA';
const PAPER = '#FFFFFF';
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

export default async function CourierBillPage({ params }) {
  await dbConnect();
  const order = await Order.findById(params.orderId).lean();
  const settings = await Settings.findOne({ key: 'global' }).lean();

  if (!order) {
    return (
      <div className="p-10 text-center text-sm" style={{ color: INK_SOFT }}>
        Shipping label not found.
      </div>
    );
  }

  return (
    <div
      className="max-w-md mx-auto p-7 m-6"
      style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: '4px', color: INK }}
    >
      <div
        className="flex justify-between items-center pb-4 mb-4"
        style={{ borderBottom: `1px dashed ${LINE}` }}
      >
        <h1 className="text-lg tracking-tight" style={{ fontFamily: FONT_SERIF, color: INK }}>
          Shipping Label
        </h1>
        <span
          className="text-[11px] font-mono px-2.5 py-1"
          style={{ background: PEACH_LIGHT, color: PEACH, borderRadius: '2px' }}
        >
          {order.orderNumber}
        </span>
      </div>

      <p className="text-[11px] font-medium uppercase tracking-[0.18em] mb-1.5" style={{ color: PEACH }}>
        From
      </p>
      <p className="text-sm" style={{ color: INK }}>{settings?.storeName || 'Mohith Trends'}</p>
      <p className="text-sm" style={{ color: INK_SOFT }}>{settings?.address || 'Tamil Nadu'}</p>

      <p className="text-[11px] font-medium uppercase tracking-[0.18em] mt-5 mb-1.5" style={{ color: PEACH }}>
        To
      </p>
      <p className="text-sm" style={{ color: INK }}>{order.customer?.name}</p>
      <p className="text-sm" style={{ color: INK_SOFT }}>{order.customer?.phone}</p>
      <p className="text-sm" style={{ color: INK_SOFT }}>
        {order.shippingAddress?.line1}, {order.shippingAddress?.line2}
      </p>
      <p className="text-sm" style={{ color: INK_SOFT }}>
        {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
      </p>
      {order.shippingAddress?.landmark && (
        <p className="text-sm mt-0.5" style={{ color: INK_SOFT }}>
          Landmark: {order.shippingAddress.landmark}
        </p>
      )}

      <div className="mt-5 pt-4 text-sm space-y-2" style={{ borderTop: `1px dashed ${LINE}` }}>
        <div className="flex justify-between">
          <span style={{ color: INK_SOFT }}>Items</span>
          <span style={{ color: INK }}>{order.items.length}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: INK_SOFT }}>Payment</span>
          <span style={{ color: order.paymentMethod === 'cod' ? '#7C9473' : INK }}>
            {order.paymentMethod === 'cod' ? `COD - ${formatINR(order.total)}` : 'Prepaid'}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: INK_SOFT }}>Courier Partner</span>
          <span style={{ color: INK }}>{order.courier?.partner || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: INK_SOFT }}>AWB / Tracking No.</span>
          <span className="font-mono" style={{ color: INK }}>{order.courier?.awbNumber || '—'}</span>
        </div>
      </div>

      <div className="mt-6">
        <PrintButton label="Print Label" />
      </div>
    </div>
  );
}