'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, X, Upload, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

const emptyForm = { name: '', slug: '', image: '', description: '', sizes: '', sortOrder: 0 };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [reordering, setReordering] = useState(false);
  const fileRef = useRef();

  async function load() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
  }
  useEffect(() => { load(); }, []);

  function startEdit(c) {
    setEditingId(c._id);
    setForm({
      name: c.name,
      slug: c.slug,
      image: c.image || '',
      description: c.description || '',
      sizes: (c.sizes || []).join(', '),
      sortOrder: c.sortOrder ?? 0
    });
    setPreview(c.image || '');
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    // default new category to the end of the current order
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder ?? 0), 0);
    setForm({ ...emptyForm, sortOrder: maxOrder + 1 });
    setPreview('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setPreview('');
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setForm((f) => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
      setPreview('');
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      sortOrder: Number(form.sortOrder) || 0
    };
    const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      toast.success(editingId ? 'Category updated' : 'Category created');
      setShowForm(false);
      setPreview('');
      load();
    } else toast.error(data.error || 'Failed');
  }

  async function remove(id) {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
  }

  // Swap sortOrder with the neighboring category and persist both
  async function move(index, direction) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    const currentOrder = current.sortOrder ?? 0;
    const targetOrder = target.sortOrder ?? 0;

    setReordering(true);
    try {
      await Promise.all([
        fetch(`/api/categories/${current._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: targetOrder })
        }),
        fetch(`/api/categories/${target._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: currentOrder })
        })
      ]);
      await load();
    } catch {
      toast.error('Failed to reorder');
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold text-brand-magenta">Categories</h1>
        <button onClick={startNew} className="btn-primary flex items-center gap-1 text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-soft p-5 mb-6 space-y-3">
          <div className="flex justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit Category' : 'New Category'}</h2>
            <button type="button" onClick={closeForm}><X size={18} /></button>
          </div>

          {/* Image upload — circular preview to match category icon style */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-cream overflow-hidden shrink-0 border-2 border-dashed border-brand-ink/20 flex items-center justify-center">
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <Upload size={18} className="text-brand-ink/30" />
              }
            </div>
            <div className="flex-1">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:border-brand-magenta transition-colors disabled:opacity-50"
              >
                {uploading
                  ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                  : <><Upload size={14} /> {preview ? 'Change image' : 'Choose image'}</>
                }
              </button>
              <p className="text-xs text-brand-ink/40 mt-1">Shown as circular icon on homepage</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <input required placeholder="Category name (e.g. Umbrella Kurtis)" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Slug (auto if blank)" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input placeholder="Available sizes, comma separated (S, M, L, XL)" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
          <textarea placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div>
            <label className="block text-xs text-brand-ink/50 mb-1">
              Display order (lower numbers show first)
            </label>
            <input
              type="number"
              placeholder="Display order"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>

          <button className="btn-primary text-sm" disabled={uploading}>
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((c, index) => (
          <div key={c._id} className="card-soft p-4 flex items-center gap-3">
            <div className="flex flex-col">
              <button
                onClick={() => move(index, 'up')}
                disabled={index === 0 || reordering}
                className="p-0.5 text-brand-ink/40 hover:text-brand-magenta disabled:opacity-20 disabled:hover:text-brand-ink/40"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => move(index, 'down')}
                disabled={index === categories.length - 1 || reordering}
                className="p-0.5 text-brand-ink/40 hover:text-brand-magenta disabled:opacity-20 disabled:hover:text-brand-ink/40"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            <div className="w-12 h-12 rounded-full bg-brand-cream overflow-hidden shrink-0">
              {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-brand-ink/50">/{c.slug} · order: {c.sortOrder ?? 0}</p>
            </div>
            <button onClick={() => startEdit(c)} className="text-brand-magenta p-1"><Pencil size={16} /></button>
            <button onClick={() => remove(c._id)} className="text-brand-magenta p-1"><Trash2 size={16} /></button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-brand-ink/40 py-10">No categories yet.</p>
        )}
      </div>
    </div>
  );
}