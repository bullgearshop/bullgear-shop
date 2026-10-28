'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, ExternalLink, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types';
import Link from 'next/link';
import { SingleImageUpload } from '@/components/admin/SingleImageUpload';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Load dynamically from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
        try {
          localStorage.setItem('bullgear_admin_categories', JSON.stringify(data.data));
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      // Fallback to local storage if available
      try {
        const saved = localStorage.getItem('bullgear_admin_categories');
        if (saved) setCategories(JSON.parse(saved));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const featuredCount = categories.filter((c) => c.is_featured).length;

  const handleToggleFeatured = async (c: Category) => {
    const nextFeatured = !c.is_featured;

    // Check 4-limit rule
    if (nextFeatured && featuredCount >= 4) {
      alert('Only 4 categories can be featured in the homepage "Shop By Category" section. Please uncheck another category first.');
      return;
    }

    // Optimistic UI update
    const updated = categories.map((cat) => (cat.id === c.id ? { ...cat, is_featured: nextFeatured } : cat));
    setCategories(updated);
    try {
      localStorage.setItem('bullgear_admin_categories', JSON.stringify(updated));
    } catch {}

    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: c.id,
          is_featured: nextFeatured,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.error || 'Failed to update homepage category');
        fetchCategories(); // revert
      } else {
        showNotification('success', nextFeatured ? `"${c.name}" will show on Homepage (Shop By Category)` : `"${c.name}" removed from Homepage`);
      }
    } catch {
      showNotification('error', 'Network error updating category');
      fetchCategories();
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImage('/images/product-snorkel.jpg');
    setFormIsFeatured(featuredCount < 4);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDescription(c.description || '');
    setFormImage(c.image_url);
    setFormIsFeatured(Boolean(c.is_featured));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCategory) {
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCategory.id,
            name: formName,
            slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: formDescription,
            image_url: formImage,
            is_featured: formIsFeatured,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', 'Category updated successfully');
          await fetchCategories();
          setModalOpen(false);
        } else {
          showNotification('error', data.error || 'Failed to update category');
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: formDescription,
            image_url: formImage,
            is_featured: formIsFeatured,
            display_order: categories.length + 1,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', 'New category created successfully');
          await fetchCategories();
          setModalOpen(false);
        } else {
          showNotification('error', data.error || 'Failed to create category');
        }
      }
    } catch {
      showNotification('error', 'Network error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete category "${name}"? It will be removed from admin and the shop.`)) {
      return;
    }

    // Optimistic UI update
    const previous = [...categories];
    const filtered = categories.filter((c) => c.id !== id);
    setCategories(filtered);
    try {
      localStorage.setItem('bullgear_admin_categories', JSON.stringify(filtered));
    } catch {}

    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', `Category "${name}" removed successfully.`);
      } else {
        showNotification('error', data.error || 'Failed to delete category');
        setCategories(previous);
      }
    } catch {
      showNotification('error', 'Network error removing category');
      setCategories(previous);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold shadow-md transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage armory collections, choose which 4 categories display on the homepage, and control catalog structure.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 shadow-md shadow-[#e51b24]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Info bar on Homepage Featured Selection */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#e51b24] shrink-0" />
          <span>
            <strong>Shop By Category (Homepage):</strong> Exactly 4 categories will display on the homepage.
            Use the tick toggle below to select which 4 to show.
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-300 font-bold text-xs whitespace-nowrap self-start sm:self-auto">
          <span>Active on Home:</span>
          <span className={featuredCount === 4 ? 'text-emerald-600' : 'text-amber-600'}>
            {featuredCount}/4 Selected
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#e51b24] mb-2" />
          <p className="text-xs font-semibold uppercase tracking-wider">Loading dynamic categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
          <p className="text-sm font-bold text-gray-800">No categories found</p>
          <p className="text-xs text-gray-500 mt-1">Click &quot;Add Category&quot; to create your first armory collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl bg-white border transition-all shadow-xs flex flex-col justify-between ${
                c.is_featured ? 'border-[#e51b24]/60 ring-1 ring-[#e51b24]/30' : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                    <Image src={c.image_url} alt={c.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/categories/${c.slug}`}
                      target="_blank"
                      className="p-1.5 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100"
                      title="Preview category"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900 uppercase">{c.name}</h3>
                  {c.is_featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-[#e51b24] border border-red-200">
                      Home 4
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description || 'No description provided.'}</p>
              </div>

              {/* Homepage 4-category toggle button */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(c)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer border ${
                    c.is_featured
                      ? 'bg-red-50 text-[#e51b24] border-red-200 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        c.is_featured
                          ? 'bg-[#e51b24] border-[#e51b24] text-white'
                          : 'border-gray-400 bg-white'
                      }`}
                    >
                      {c.is_featured && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span>Show in &quot;Shop By Category&quot;</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {c.is_featured ? 'Active' : 'Hidden'}
                  </span>
                </button>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span className="font-mono text-[#e51b24] font-semibold">/categories/{c.slug}</span>
                  <span className="font-bold text-gray-900">{c.product_count || 0} products</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => !submitting && setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-10 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Roof Racks"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. roof-racks"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <SingleImageUpload
                label="Category Image *"
                value={formImage}
                onChange={setFormImage}
                helperText="Upload photo for category card on homepage & shop"
                aspectRatioHint="16:11 or Square"
              />

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Engine protection for extreme conditions"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              {/* Homepage Featured Checkbox */}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-gray-900 uppercase">Featured in Homepage</span>
                  <span className="text-[11px] text-gray-500">Show in the 4-category Shop By Category grid</span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => {
                    if (e.target.checked && featuredCount >= 4 && (!editingCategory || !editingCategory.is_featured)) {
                      alert('Maximum 4 categories can be shown on homepage. Please uncheck another category first.');
                      return;
                    }
                    setFormIsFeatured(e.target.checked);
                  }}
                  className="w-4 h-4 text-[#e51b24] accent-[#e51b24] cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#e51b24] text-white font-bold uppercase shadow-sm flex items-center gap-2 cursor-pointer hover:bg-[#c8141d]"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
