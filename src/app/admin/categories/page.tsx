'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, ExternalLink } from 'lucide-react';
import { Category } from '@/lib/types';
import { DEFAULT_CATEGORIES } from '@/lib/db';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('/images/product-snorkel.jpg');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImage('/images/product-snorkel.jpg');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDescription(c.description);
    setFormImage(c.image_url);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName,
                slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
                description: formDescription,
                image_url: formImage,
              }
            : c
        )
      );
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
        description: formDescription,
        image_url: formImage,
        display_order: categories.length + 1,
        is_featured: true,
        is_active: true,
        product_count: 0,
      };
      setCategories([...categories, newCat]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Organize armory product collections, SEO slugs, and banner associations.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between"
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
                    className="p-1.5 text-gray-400 hover:text-gray-900"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-gray-900 uppercase">{c.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono text-[#e51b24] font-semibold">/categories/{c.slug}</span>
              <span className="font-bold text-gray-900">{c.product_count || 0} items</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-10 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="/images/product-roof-rack.jpg"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                />
              </div>

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

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#e51b24] text-white font-bold uppercase shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
