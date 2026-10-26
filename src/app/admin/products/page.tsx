'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '@/lib/db';
import { formatRupees } from '@/lib/whatsapp';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formImage, setFormImage] = useState('/images/product-snorkel.jpg');
  const [formDescription, setFormDescription] = useState('');
  const [formCompatibility, setFormCompatibility] = useState('Mahindra Thar (2020+), Toyota Fortuner, Hilux, Jimny');

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = !selectedCategory || p.category_slug === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormSku(`BG-ACC-00${products.length + 1}`);
    setFormPrice('14999');
    setFormCategory(categories[0]?.id || '');
    setFormStock('15');
    setFormImage('/images/product-snorkel.jpg');
    setFormDescription('Heavy-duty 4x4 accessory manufactured with aerospace-grade materials.');
    setFormCompatibility('Mahindra Thar, Toyota Fortuner, Hilux, Jimny, Gurkha');
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormSku(p.sku || '');
    setFormPrice(String(p.price));
    setFormCategory(p.category_id || '');
    setFormStock(String(p.stock_quantity));
    setFormImage(p.images?.[0]?.image_url || '/images/product-snorkel.jpg');
    setFormDescription(p.description || '');
    setFormCompatibility(p.compatibility_models?.join(', ') || '');
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const catObj = categories.find((c) => c.id === formCategory);
    const parsedStock = parseInt(formStock, 10) || 0;
    const stockStatus = parsedStock === 0 ? 'out_of_stock' : parsedStock <= 5 ? 'limited_stock' : 'in_stock';
    const models = formCompatibility.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName,
                slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
                sku: formSku,
                price: parseFloat(formPrice) || 0,
                category_id: formCategory,
                category_name: catObj?.name,
                category_slug: catObj?.slug,
                stock_quantity: parsedStock,
                stock_status: stockStatus,
                description: formDescription,
                compatibility_models: models,
                images: [
                  {
                    id: 'img-1',
                    product_id: p.id,
                    image_url: formImage,
                    alt_text: formName,
                    display_order: 1,
                    is_primary: true,
                  },
                ],
              }
            : p
        )
      );
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
        sku: formSku,
        price: parseFloat(formPrice) || 0,
        category_id: formCategory,
        category_name: catObj?.name,
        category_slug: catObj?.slug,
        stock_quantity: parsedStock,
        low_stock_threshold: 5,
        stock_status: stockStatus,
        is_featured: false,
        is_best_seller: false,
        is_published: true,
        description: formDescription,
        compatibility_models: models,
        specifications: { 'Material': 'Heavy-duty steel/composite' },
        features: ['Engineered for extreme off-road durability'],
        images: [
          {
            id: `img-${Date.now()}`,
            product_id: `prod-${Date.now()}`,
            image_url: formImage,
            alt_text: formName,
            display_order: 1,
            is_primary: true,
          },
        ],
      };
      setProducts([newProd, ...products]);
    }
    setModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the armory?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Product Armory Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create, update stock quantity, pricing, and fitment specifications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 shadow-md shadow-[#e51b24]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#e51b24] shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24] shadow-xs"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                        <Image
                          src={p.images?.[0]?.image_url || '/images/product-snorkel.jpg'}
                          alt={p.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 line-clamp-1">{p.name}</span>
                        <span className="text-[11px] text-gray-500">/{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {p.category_name || 'Accessories'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">
                    {p.sku || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {formatRupees(p.price)}
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className={p.stock_quantity <= 5 ? 'text-amber-600' : 'text-emerald-600'}>
                      {p.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.stock_status === 'in_stock'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : p.stock_status === 'limited_stock'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {p.stock_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        title="View on Storefront"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal in White Theme */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                {editingProduct ? 'Edit Armor Product' : 'Add New Armor Product'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!editingProduct) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    placeholder="e.g. Extreme Front Bumper"
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
                    placeholder="e.g. extreme-front-bumper"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">SKU</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="BG-BMP-008"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="24999"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/images/product-snorkel.jpg"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Vehicle Compatibility (comma separated)
                </label>
                <input
                  type="text"
                  value={formCompatibility}
                  onChange={(e) => setFormCompatibility(e.target.value)}
                  placeholder="Mahindra Thar (2020+), Toyota Fortuner, Hilux, Jimny"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold uppercase tracking-wider shadow-md shadow-[#e51b24]/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
