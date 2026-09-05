'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { useCart, cartKey } from '@/components/CartContext';
import { formatINR } from '@/lib/utils';

const INK = '#241B21';
const INK_SOFT = '#9C877D';
const PEACH = '#D9946A';
const PEACH_LIGHT = '#F7EDE4';
const LINE = '#EEE3DA';
const PAPER = '#FFFFFF';
const SAGE = '#7C9473';
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

const inputClass =
  'w-full text-sm outline-none transition-colors px-3.5 py-2.5';
const inputStyle = { border: `1px solid ${LINE}`, borderRadius: '3px', color: INK, background: PAPER };

const sectionHeadClass = 'text-[11px] font-medium uppercase tracking-[0.18em] mb-4';

function SSRKInput({ placeholder, type = 'text', value, onChange, autoComplete, inputMode, maxLength }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      className={inputClass}
      style={inputStyle}
    />
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart, updateQty, removeItem, setItemStock } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    line1: '', line2: '', city: '', state: '', pincode: '', landmark: ''
  });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);

  const [shipping, setShipping] = useState(null);
  const [freeShippingAbove, setFreeShippingAbove] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const discountedSubtotal = subtotal - discount;
  const total = shipping !== null ? Math.round(discountedSubtotal + shipping) : null;

  // Total piece count across the cart — used by the shipping API to work
  // out order weight (totalQty × weight-per-piece from admin Settings).
  const totalQty = items.reduce((sum, i) => sum + (i.qty || 0), 0);

  const fetchShipping = useCallback(async () => {
    setShippingLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtotal: discountedSubtotal, totalQty })
      });
      const data = await res.json();
      if (res.ok) {
        setShipping(data.shippingCost);
        setFreeShippingAbove(data.freeShippingAbove);
      } else {
        toast.error(data.error || 'Could not calculate shipping');
      }
    } catch {
      toast.error('Could not calculate shipping');
    } finally {
      setShippingLoading(false);
    }
  }, [discountedSubtotal, totalQty]);

  useEffect(() => { fetchShipping(); }, [fetchShipping]);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function applyCoupon() {
    if (!coupon.trim()) return;
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon, subtotal })
    });
    const data = await res.json();
    if (data.valid) { setDiscount(data.discount); toast.success(data.message); }
    else { setDiscount(0); toast.error(data.message); }
  }

  async function validateStockBeforeOrder() {
    setCheckingStock(true);
    try {
      const res = await fetch('/api/cart/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            size: i.size,
            qty: i.qty,
            name: i.name,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not verify stock, please try again');
        return false;
      }

      if (data.valid) return true;

      data.issues.forEach((issue) => {
        const key = cartKey(issue);
        if (issue.reason === 'unavailable' || issue.reason === 'out_of_stock') {
          toast.error(`${issue.name || 'An item'} is out of stock and was removed from your cart`);
          removeItem(key);
        } else if (issue.reason === 'insufficient_stock') {
          toast.error(`Only ${issue.availableStock} left of ${issue.name || 'an item'} — quantity adjusted`);
          updateQty(key, issue.availableStock);
          setItemStock(key, issue.availableStock);
        }
      });

      return false;
    } catch {
      toast.error('Could not verify stock, please try again');
      return false;
    } finally {
      setCheckingStock(false);
    }
  }

  async function placeOrder() {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    if (shipping === null) { toast.error('Shipping is still being calculated, please wait'); return; }

    setSubmitting(true);

    const stockOk = await validateStockBeforeOrder();
    if (!stockOk) {
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      size: i.size,
      qty: i.qty,
      isCombo: i.isCombo || false,
      comboId: i.comboId
    }));

    try {
      if (paymentMethod === 'razorpay') {
        // Server recomputes and verifies the total from orderItems, and
        // stashes the order payload so the webhook can create the order
        // even if this tab closes before the handler below runs.
        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderItems,
            customer: { name: form.name, phone: form.phone, email: form.email },
            shippingAddress: form,
            couponCode: coupon
          })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) { toast.error(orderData.error || 'Payment gateway error'); setSubmitting(false); return; }

        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: 'INR',
          name: 'Mohith Trends',
          order_id: orderData.order.id,
          prefill: { name: form.name, contact: form.phone, email: form.email },
          theme: { color: '#D9946A' },
          handler: async function (response) {
            // Fast path — if this fails or never runs, the webhook creates
            // the same order server-side. /api/orders is idempotent on
            // razorpayOrderId, so this is always safe to call.
            const finalRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: orderItems,
                customer: { name: form.name, phone: form.phone, email: form.email },
                shippingAddress: form,
                couponCode: coupon,
                paymentMethod: 'razorpay',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            const finalData = await finalRes.json();
            if (finalRes.ok) {
              clearCart();
              router.push(`/order-success/${finalData.order._id}`);
            } else {
              // Payment already succeeded on Razorpay's side regardless —
              // the webhook will still create the order in the background.
              toast.error(
                `Payment received — confirming your order. If it doesn't appear shortly, contact support with payment ID ${response.razorpay_payment_id}.`,
                { duration: 8000 }
              );
              clearCart();
              router.push('/');
            }
            setSubmitting(false);
          },
          modal: { ondismiss: () => setSubmitting(false) }
        });
        rzp.open();
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderItems,
            customer: { name: form.name, phone: form.phone, email: form.email },
            shippingAddress: form,
            couponCode: coupon,
            paymentMethod: 'cod'
          })
        });
        const data = await res.json();
        if (res.ok) { clearCart(); router.push(`/order-success/${data.order._id}`); }
        else { toast.error(data.error || 'Could not place order'); }
        setSubmitting(false);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const placeOrderDisabled = submitting || shippingLoading || checkingStock || shipping === null;

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-14" style={{ background: PAPER }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <h1 className="text-[24px] sm:text-[28px] mb-7" style={{ fontFamily: FONT_SERIF, color: INK }}>
        Checkout
      </h1>

      {freeShippingAbove !== null && shipping !== null && shipping > 0 && (
        <div
          className="text-xs py-2.5 px-4 mb-6"
          style={{ background: PEACH_LIGHT, color: INK_SOFT, borderRadius: '3px' }}
        >
          Add <strong style={{ color: PEACH }}>{formatINR(freeShippingAbove - discountedSubtotal)}</strong> more to get{' '}
          <strong style={{ color: SAGE }}>free shipping</strong>
        </div>
      )}

      <div className="flex flex-col gap-8 sm:grid sm:grid-cols-2 sm:gap-12">

        <div>
          <p className={sectionHeadClass} style={{ color: INK }}>Shipping Details</p>
          <div className="space-y-3">
            <SSRKInput placeholder="Full Name *" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <SSRKInput placeholder="Phone Number *" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            <SSRKInput placeholder="Email (optional)" type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <SSRKInput placeholder="Address Line 1 *" autoComplete="address-line1" value={form.line1} onChange={(e) => update('line1', e.target.value)} />
            <SSRKInput placeholder="Address Line 2" autoComplete="address-line2" value={form.line2} onChange={(e) => update('line2', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City *"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
              <input
                placeholder="State"
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Pincode *"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
              <input
                placeholder="Landmark"
                value={form.landmark}
                onChange={(e) => update('landmark', e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">

          <div>
            <p className={sectionHeadClass} style={{ color: INK }}>Order Summary</p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1 gap-2" style={{ color: INK_SOFT }}>
                  <span className="truncate">{i.name} ({i.color}/{i.size}) ×{i.qty}</span>
                  <span className="shrink-0" style={{ color: INK }}>{formatINR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            {/* <div className="flex gap-2 mt-4">
              <input
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                className={`${inputClass} flex-1`}
                style={inputStyle}
              />
              <button
                onClick={applyCoupon}
                className="px-4 text-sm shrink-0 transition-colors"
                style={{ border: `1px solid ${PEACH}`, color: PEACH, background: PAPER, borderRadius: '3px' }}
              >
                Apply
              </button>
            </div> */}

            <div style={{ height: '1px', background: LINE }} className="my-4" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between" style={{ color: INK_SOFT }}>
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between" style={{ color: SAGE }}>
                  <span>Discount</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between" style={{ color: INK_SOFT }}>
                <span>Shipping</span>
                <span>
                  {shippingLoading
                    ? <span style={{ color: INK_SOFT, opacity: 0.6 }}>Calculating…</span>
                    : shipping === 0
                      ? <span style={{ color: SAGE }}>Free</span>
                      : shipping !== null
                        ? formatINR(shipping)
                        : <span style={{ color: INK_SOFT, opacity: 0.6 }}>—</span>
                  }
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-3 pt-3 text-base" style={{ borderTop: `1px solid ${LINE}` }}>
              <span style={{ color: INK }}>Total</span>
              <span style={{ color: PEACH, fontFamily: FONT_SERIF }}>{total !== null ? formatINR(total) : '—'}</span>
            </div>
          </div>

          <div>
            <p className={sectionHeadClass} style={{ color: INK }}>Payment Method</p>
            <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: INK }}>
              <input
                type="radio"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                className="w-4 h-4"
                style={{ accentColor: PEACH }}
              />
              Pay Online (Cards / UPI / Netbanking)
            </label>
          </div>

          <button
            onClick={placeOrder}
            disabled={placeOrderDisabled}
            className="w-full py-3.5 text-sm font-medium transition-opacity active:opacity-80 disabled:cursor-not-allowed"
            style={{
              background: placeOrderDisabled ? '#E9C7AC' : PEACH,
              color: PAPER,
              borderRadius: '4px',
            }}
          >
            {submitting
              ? (checkingStock ? 'Checking stock…' : 'Placing Order…')
              : shippingLoading
                ? 'Calculating shipping…'
                : total !== null
                  ? `Place Order — ${formatINR(total)}`
                  : 'Place Order'
            }
          </button>
        </div>
      </div>
    </div>
  );
}