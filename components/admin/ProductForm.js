'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Loader2, X } from 'lucide-react';

// SSRK Brand Colors
// Crimson : #8B0000
// Gold    : #C9A84C
// Cream   : #fdf5f5

function emptyVariant() {
  return { color: '', colorHex: '#8B0000', images: [''], price: '', compareAtPrice: '', sizes: [{ size: '', stock: 0, sku: '' }] };
}

// Shared input style
const inputStyle = {
  border: '1.5px solid #e8d5d5',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: 'sans-serif',
  color: '#1a1a1a',
  background: '#fff',
  width: '100%',
  outline: 'none',
  marginTop: '4px',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#8B0000',
  fontFamily: 'sans-serif',
};

const cardStyle = {
  background: '#fff',
  border: '1.5px solid #e8d5d5',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const sectionHeadStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#8B0000',
  fontFamily: 'Georgia, serif',
  marginBottom: '12px',
};

function ImageSlot({ value, onChange, onRemove, showRemove }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="shrink-0 overflow-hidden relative"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          border: '2px dashed #C9A84C',
          background: '#fdf5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : uploading ? (
          <Loader2 size={16} className="animate-spin" style={{ color: '#8B0000' }} />
        ) : (
          <Upload size={14} style={{ color: '#C9A84C' }} />
        )}
        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <Loader2 size={14} className="animate-spin" style={{ color: '#8B0000' }} />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <input
        placeholder="https://... or click thumbnail to upload"
        style={{ ...inputStyle, marginTop: 0, flex: 1 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
        onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
      />

      {showRemove && (
        <button type="button" onClick={onRemove} style={{ color: '#C9A84C', flexShrink: 0 }}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default function ProductForm({ initial, productId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(
    initial || {
      name: '', slug: '', sku: '', description: '', category: '', fabric: '', tags: [],
      variants: [emptyVariant()],
      isBestSeller: false, isTopSeller: false, isActiveSeller: true, isFeatured: false, isActive: true,
    }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function updateVariant(idx, field, value) {
    setForm((f) => { const v = [...f.variants]; v[idx] = { ...v[idx], [field]: value }; return { ...f, variants: v }; });
  }

  function updateVariantImage(vIdx, imgIdx, value) {
    setForm((f) => {
      const variants = [...f.variants];
      const images = [...variants[vIdx].images];
      images[imgIdx] = value;
      variants[vIdx] = { ...variants[vIdx], images };
      return { ...f, variants };
    });
  }

  function removeVariantImage(vIdx, imgIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      const images = variants[vIdx].images.filter((_, i) => i !== imgIdx);
      variants[vIdx] = { ...variants[vIdx], images: images.length ? images : [''] };
      return { ...f, variants };
    });
  }

  function addVariantImage(vIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vIdx] = { ...variants[vIdx], images: [...variants[vIdx].images, ''] };
      return { ...f, variants };
    });
  }

  function updateSize(vIdx, sIdx, field, value) {
    setForm((f) => {
      const variants = [...f.variants];
      const sizes = [...variants[vIdx].sizes];
      sizes[sIdx] = { ...sizes[sIdx], [field]: value };
      variants[vIdx] = { ...variants[vIdx], sizes };
      return { ...f, variants };
    });
  }

  function addSize(vIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vIdx] = { ...variants[vIdx], sizes: [...variants[vIdx].sizes, { size: '', stock: 0, sku: '' }] };
      return { ...f, variants };
    });
  }

  function removeSize(vIdx, sIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vIdx] = { ...variants[vIdx], sizes: variants[vIdx].sizes.filter((_, i) => i !== sIdx) };
      return { ...f, variants };
    });
  }

  function addVariant() { setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] })); }
  function removeVariant(idx) { setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) })); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    // Note: sku is intentionally omitted — it's auto-generated/managed server-side
    // based on the product's category (see /api/products and /api/products/[id]).
    const payload = {
      ...form,
      variants: form.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        compareAtPrice: Number(v.compareAtPrice) || 0,
        images: v.images.filter(Boolean),
        sizes: v.sizes.map((s) => ({ ...s, stock: Number(s.stock) })),
      })),
    };
    delete payload.sku;

    const url = productId ? `/api/products/${productId}` : '/api/products';
    const method = productId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success(productId ? 'Product updated' : 'Product created');
      router.push('/admin/products');
    } else {
      toast.error(data.error || 'Something went wrong');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">

      {/* Basic Info Card */}
      <div style={cardStyle}>
        <p style={sectionHeadStyle}>Product Details</p>
        <div style={{ height: '1px', background: '#C9A84C', opacity: 0.4, marginBottom: '16px' }} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input
              required
              style={inputStyle}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
            />
          </div>
          <div>
            <label style={labelStyle}>SKU</label>
            <input
              disabled
              readOnly
              style={{ ...inputStyle, background: '#f5f0f0', color: '#8a8a8a', cursor: 'not-allowed' }}
              value={form.sku || 'Auto-generated from category on save'}
              title="SKU is generated automatically from the product's category"
            />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select
              required
              style={inputStyle}
              value={form.category?._id || form.category}
              onChange={(e) => update('category', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fabric</label>
            <input
              style={inputStyle}
              value={form.fabric}
              onChange={(e) => update('fabric', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
            />
          </div>
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              style={inputStyle}
              value={Array.isArray(form.tags) ? form.tags.join(', ') : ''}
              onChange={(e) => update('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
            />
          </div>
          <div className="sm:col-span-2">
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical' }}
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
            />
          </div>

          {/* Toggles */}
          <div className="sm:col-span-2 flex flex-wrap gap-4">
            {[
              ['isBestSeller', 'Bestseller'],
              ['isTopSeller', 'Top Seller'],
              ['isActiveSeller', 'Active Seller'],
              ['isFeatured', 'Featured'],
              ['isActive', 'Active (visible on site)'],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm cursor-pointer"
                style={{ color: '#5a2020', fontFamily: 'sans-serif' }}
              >
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  style={{ accentColor: '#8B0000', width: '15px', height: '15px' }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ ...sectionHeadStyle, marginBottom: 0 }}>Variants</h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-sm font-semibold px-4 py-2 transition-all"
            style={{
              background: '#fff',
              color: '#8B0000',
              border: '1.5px solid #8B0000',
              borderRadius: '8px',
              fontFamily: 'sans-serif',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8B0000';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#8B0000';
            }}
          >
            <Plus size={16} /> Add Variant
          </button>
        </div>

        {form.variants.map((v, vIdx) => (
          <div key={vIdx} style={cardStyle}>
            {/* Variant header */}
            <div
              className="flex justify-between items-center mb-3 pb-2"
              style={{ borderBottom: '1px solid #C9A84C', opacity: 1 }}
            >
              <span style={{ fontWeight: '700', fontSize: '13px', color: '#8B0000', fontFamily: 'Georgia, serif' }}>
                Variant {vIdx + 1}
              </span>
              {form.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(vIdx)}
                  style={{ color: '#8B0000', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-4 gap-3 mb-3">
              <input
                placeholder="Color name (e.g. Green)"
                style={inputStyle}
                value={v.color}
                onChange={(e) => updateVariant(vIdx, 'color', e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
              <input
                type="color"
                style={{ ...inputStyle, padding: '4px', height: '40px' }}
                value={v.colorHex}
                onChange={(e) => updateVariant(vIdx, 'colorHex', e.target.value)}
              />
              <input
                placeholder="Price ₹"
                type="number"
                style={inputStyle}
                value={v.price}
                onChange={(e) => updateVariant(vIdx, 'price', e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
              <input
                placeholder="Compare-at price ₹"
                type="number"
                style={inputStyle}
                value={v.compareAtPrice}
                onChange={(e) => updateVariant(vIdx, 'compareAtPrice', e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
            </div>

            <p style={{ fontSize: '12px', color: '#C9A84C', fontFamily: 'sans-serif', marginBottom: '8px', fontWeight: '600' }}>
              Images for this colour — click thumbnail to upload
            </p>
            {v.images.map((img, imgIdx) => (
              <ImageSlot
                key={imgIdx}
                value={img}
                onChange={(url) => updateVariantImage(vIdx, imgIdx, url)}
                onRemove={() => removeVariantImage(vIdx, imgIdx)}
                showRemove={v.images.length > 1}
              />
            ))}
            <button
              type="button"
              onClick={() => addVariantImage(vIdx)}
              style={{ fontSize: '12px', color: '#8B0000', fontFamily: 'sans-serif', fontWeight: '600', marginBottom: '12px', cursor: 'pointer' }}
            >
              + Add another image
            </button>

            <p style={{ fontSize: '12px', color: '#C9A84C', fontFamily: 'sans-serif', fontWeight: '600', marginBottom: '6px' }}>
              Sizes &amp; Stock
            </p>
            {v.sizes.map((s, sIdx) => (
              <div key={sIdx} className="flex gap-2 mb-2 items-center">
                <input
                  placeholder="Size (e.g. M, 38, Free Size)"
                  style={{ ...inputStyle, width: '140px', marginTop: 0 }}
                  value={s.size}
                  onChange={(e) => updateSize(vIdx, sIdx, 'size', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                  onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  style={{ ...inputStyle, width: '90px', marginTop: 0 }}
                  value={s.stock}
                  onChange={(e) => updateSize(vIdx, sIdx, 'stock', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                  onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
                />
                <input
                  placeholder="SKU (optional)"
                  style={{ ...inputStyle, flex: 1, marginTop: 0 }}
                  value={s.sku}
                  onChange={(e) => updateSize(vIdx, sIdx, 'sku', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                  onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
                />
                <button
                  type="button"
                  onClick={() => removeSize(vIdx, sIdx)}
                  style={{ color: '#8B0000', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSize(vIdx)}
              style={{ fontSize: '12px', color: '#8B0000', fontFamily: 'sans-serif', fontWeight: '600', cursor: 'pointer' }}
            >
              + Add size
            </button>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <button
        disabled={saving}
        className="w-full sm:w-auto px-8 py-3 font-bold text-sm transition-all"
        style={{
          background: saving ? '#b05050' : '#8B0000',
          color: '#fff',
          border: '2px solid #C9A84C',
          borderRadius: '8px',
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          letterSpacing: '0.5px',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!saving) e.currentTarget.style.background = '#6e0000';
        }}
        onMouseLeave={(e) => {
          if (!saving) e.currentTarget.style.background = '#8B0000';
        }}
      >
        {saving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}