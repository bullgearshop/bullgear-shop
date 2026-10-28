'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Star,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Product, Category, StockStatus, ProductImage } from '@/lib/types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '@/lib/db';
import { formatRupees } from '@/lib/whatsapp';
import { ProductImagesUpload } from '@/components/admin/ProductImagesUpload';

const MAX_BEST_SELLERS = 6;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
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
  const [formImages, setFormImages] = useState<ProductImage[]>([]);
  const [formDescription, setFormDescription] = useState('');
  const [formCompatibility, setFormCompatibility] = useState('Mahindra Thar (2020+), Toyota Fortuner, Hilux, Jimny');
  const [formSpecifications, setFormSpecifications] = useState<{ key: string; value: string }[]>([
    { key: 'Material', value: 'High-Grade UV-Stabilized Polyethylene / Heavy Duty Steel' },
    { key: 'Finish', value: 'Textured Satin Black' },
    { key: 'Hardware', value: 'Grade 304 Stainless Steel Bolts & Brackets' },
    { key: 'Mounting Type', value: 'Direct Bolt-On to OEM Chassis Points' },
    { key: 'Warranty', value: '1 Year Bull Gear Guarantee' },
  ]);
  const [formInstallation, setFormInstallation] = useState('');
  const [formDelivery, setFormDelivery] = useState('');
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Fetch dynamic categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bullgear_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveToStorage = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('bullgear_admin_products', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const bestSellersCount = products.filter((p) => p.is_best_seller).length;

  const toggleBestSeller = (productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    if (!targetProduct.is_best_seller && bestSellersCount >= MAX_BEST_SELLERS) {
      alert(`Maximum ${MAX_BEST_SELLERS} products can be featured in "Shop Our Best Sellers". Please untick another product first.`);
      return;
    }

    const updated = products.map((p) =>
      p.id === productId ? { ...p, is_best_seller: !p.is_best_seller } : p
    );
    saveToStorage(updated);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = !selectedCategory || p.category_slug === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleAddSpecRow = () => {
    setFormSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateSpecRow = (index: number, field: 'key' | 'value', val: string) => {
    setFormSpecifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveSpecRow = (index: number) => {
    setFormSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormSku(`BG-ACC-00${products.length + 1}`);
    setFormPrice('14999');
    setFormCategory(categories[0]?.id || '');
    setFormStock('15');
    setFormImages([]);
    setFormDescription('Heavy-duty 4x4 accessory manufactured with aerospace-grade materials engineered for extreme off-road endurance.');
    setFormCompatibility('Mahindra Thar (2020+), Toyota Fortuner, Hilux, Jimny, Force Gurkha');
    setFormSpecifications([
      { key: 'Material', value: 'High-Grade UV-Stabilized Polyethylene / Heavy Duty Steel' },
      { key: 'Finish', value: 'Textured Satin Black' },
      { key: 'Hardware', value: 'Grade 304 Stainless Steel Bolts & Brackets' },
      { key: 'Mounting Type', value: 'Direct Bolt-On to OEM Chassis Points' },
      { key: 'Warranty', value: '1 Year Bull Gear Guarantee' },
    ]);
    setFormInstallation('Direct bolt-on installation using vehicle OEM factory mounting points. Includes comprehensive 1:1 scale cutting/mounting template, all high-tensile brackets, stainless steel hardware, and step-by-step fitment guide.');
    setFormDelivery('Dispatches within 24–48 hours across India. Packed in heavy reinforced wooden crates to ensure zero transit damage. 7-day hassle-free replacement on any fitment or delivery issues.');
    setFormIsBestSeller(bestSellersCount < MAX_BEST_SELLERS);
    setFormIsFeatured(false);
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
    setFormImages(
      p.images?.length
        ? p.images
        : [
            {
              id: `img-${p.id}`,
              product_id: p.id,
              image_url: '/images/product-snorkel.jpg',
              alt_text: p.name,
              display_order: 1,
              is_primary: true,
            },
          ]
    );
    setFormDescription(p.description || '');
    setFormCompatibility(p.compatibility_models?.join(', ') || '');
    
    // Parse specifications
    const specsEntries = Object.entries(p.specifications || {});
    if (specsEntries.length > 0) {
      setFormSpecifications(specsEntries.map(([k, v]) => ({ key: k, value: String(v) })));
    } else {
      setFormSpecifications([
        { key: 'Material', value: 'High-Grade UV-Stabilized Polyethylene / Heavy Duty Steel' },
        { key: 'Finish', value: 'Textured Satin Black' },
        { key: 'Hardware', value: 'Grade 304 Stainless Steel Bolts & Brackets' },
        { key: 'Mounting Type', value: 'Direct Bolt-On to OEM Chassis Points' },
        { key: 'Warranty', value: '1 Year Bull Gear Guarantee' },
      ]);
    }

    setFormInstallation(p.installation_info || 'Direct bolt-on installation using vehicle OEM factory mounting points. Includes comprehensive 1:1 scale cutting/mounting template, all high-tensile brackets, stainless steel hardware, and step-by-step fitment guide.');
    setFormDelivery(p.delivery_returns_info || 'Dispatches within 24–48 hours across India. Packed in heavy reinforced wooden crates to ensure zero transit damage. 7-day hassle-free replacement on any fitment or delivery issues.');
    setFormIsBestSeller(p.is_best_seller ?? false);
    setFormIsFeatured(p.is_featured ?? false);
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const catObj = categories.find((c) => c.id === formCategory);
    const parsedStock = parseInt(formStock, 10) || 0;
    const stockStatus: StockStatus = parsedStock === 0 ? 'out_of_stock' : parsedStock <= 5 ? 'limited_stock' : 'in_stock';
    const models = formCompatibility.split(',').map((s) => s.trim()).filter(Boolean);

    // Convert dynamic specifications rows to object
    const specsObj: Record<string, string> = {};
    formSpecifications.forEach(({ key, value }) => {
      const trimmedKey = key.trim();
      if (trimmedKey) {
        specsObj[trimmedKey] = value.trim();
      }
    });

    // Guard best sellers count
    if (formIsBestSeller && (!editingProduct || !editingProduct.is_best_seller) && bestSellersCount >= MAX_BEST_SELLERS) {
      alert(`Maximum ${MAX_BEST_SELLERS} products can be featured in Best Sellers.`);
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
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
              is_best_seller: formIsBestSeller,
              is_featured: formIsFeatured,
              description: formDescription,
              compatibility_models: models,
              specifications: specsObj,
              installation_info: formInstallation,
              delivery_returns_info: formDelivery,
              images: formImages.length > 0 ? formImages : [
                {
                  id: `img-${p.id}-1`,
                  product_id: p.id,
                  image_url: '/images/product-snorkel.jpg',
                  alt_text: formName,
                  display_order: 1,
                  is_primary: true,
                },
              ],
            }
          : p
      );
      saveToStorage(updated);
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
        is_featured: formIsFeatured,
        is_best_seller: formIsBestSeller,
        is_published: true,
        description: formDescription,
        compatibility_models: models,
        specifications: specsObj,
        installation_info: formInstallation,
        delivery_returns_info: formDelivery,
        features: ['Engineered for extreme off-road durability', 'Precision CNC laser-cut and hand-finished'],
        images: formImages.length > 0 ? formImages : [
          {
            id: `img-${Date.now()}-1`,
            product_id: `prod-${Date.now()}`,
            image_url: '/images/product-snorkel.jpg',
            alt_text: formName,
            display_order: 1,
            is_primary: true,
          },
        ],
      };
      saveToStorage([newProd, ...products]);
    }
    setModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the armory?')) {
      const updated = products.filter((p) => p.id !== id);
      saveToStorage(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
              Product Armory Management
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                bestSellersCount === MAX_BEST_SELLERS
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Best Sellers: {bestSellersCount} / {MAX_BEST_SELLERS} Selected</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage product catalog, inventory, pricing, and tick up to 6 products to display in the &quot;Shop Our Best Sellers&quot; section.
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

      {/* Info Notice about Best Sellers limit of 6 */}
      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#e51b24] shrink-0" />
          <span>
            <strong className="text-gray-900 font-bold">Homepage Best Sellers Rule:</strong> Exactly <strong>6 products</strong> appear in the &quot;Shop Our Best Sellers&quot; homepage carousel. Tick the checkbox on any product below to feature it.
          </span>
        </div>
        <span className="font-mono font-bold text-gray-900 shrink-0">
          {bestSellersCount} of {MAX_BEST_SELLERS} slots filled
        </span>
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
                <th className="py-3.5 px-4 text-center">Best Seller (Max 6)</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isBestSeller = !!p.is_best_seller;
                return (
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

                    {/* Best Seller Tick Column */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleBestSeller(p.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isBestSeller
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                        title={
                          isBestSeller
                            ? 'Click to remove from Best Sellers'
                            : bestSellersCount >= MAX_BEST_SELLERS
                            ? `Limit reached (${MAX_BEST_SELLERS}/6)`
                            : 'Click to feature in Best Sellers'
                        }
                      >
                        {isBestSeller ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ticked (Featured)</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-gray-400" />
                            <span>Tick as Best Seller</span>
                          </>
                        )}
                      </button>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                {editingProduct ? 'Edit Armor Product' : 'Add New Armor Product'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 text-xs">
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
                    className="w-full py-2 px-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] cursor-pointer"
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

              {/* Multi-Image File Upload */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <ProductImagesUpload
                  images={formImages}
                  onChange={setFormImages}
                  productId={editingProduct?.id || 'new-product'}
                />
              </div>

              {/* Best Seller & Featured Toggles */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="formIsBestSeller"
                      checked={formIsBestSeller}
                      disabled={!formIsBestSeller && bestSellersCount >= MAX_BEST_SELLERS}
                      onChange={(e) => setFormIsBestSeller(e.target.checked)}
                      className="rounded text-[#e51b24] focus:ring-[#e51b24] cursor-pointer"
                    />
                    <label htmlFor="formIsBestSeller" className="font-bold text-gray-900 cursor-pointer">
                      Feature in &quot;Shop Our Best Sellers&quot; (Homepage Section)
                    </label>
                  </div>
                  <span className="font-mono text-[11px] text-gray-500 font-bold">
                    {bestSellersCount} / {MAX_BEST_SELLERS} slots filled
                  </span>
                </div>
                {!formIsBestSeller && bestSellersCount >= MAX_BEST_SELLERS && (
                  <p className="text-[11px] text-amber-700">
                    Maximum limit of 6 Best Sellers reached. Untick another product to feature this one.
                  </p>
                )}
              </div>

              {/* Product Storefront Tabs Content Section */}
              <div className="pt-2 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <span className="h-2 w-2 rounded-full bg-[#e51b24]" />
                  <h4 className="font-extrabold uppercase tracking-wider text-gray-900 text-xs">
                    Storefront Product Tabs Content
                  </h4>
                </div>

                {/* 1. Description */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    1. Description (Product Overview & Highlights) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter thorough overview and product advantages..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>

                {/* 2. Specifications (Key - Value Builder) */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-gray-800 uppercase">
                        2. Specifications (Technical Specs Table)
                      </label>
                      <p className="text-[11px] text-gray-500">
                        Displays in the &quot;Specifications&quot; tab on product page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#e51b24]" />
                      <span>Add Spec Row</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formSpecifications.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.key}
                          onChange={(e) => handleUpdateSpecRow(idx, 'key', e.target.value)}
                          placeholder="Spec Name (e.g. Material)"
                          className="w-2/5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-900 font-bold focus:outline-none focus:border-[#e51b24]"
                        />
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleUpdateSpecRow(idx, 'value', e.target.value)}
                          placeholder="Spec Value (e.g. Heavy Duty Steel)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete Spec"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formSpecifications.length === 0 && (
                      <p className="text-gray-400 text-center py-2 italic text-[11px]">
                        No specifications added yet. Click &quot;Add Spec Row&quot; above.
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Compatibility */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    3. Compatibility (Vehicle Models, comma separated)
                  </label>
                  <input
                    type="text"
                    value={formCompatibility}
                    onChange={(e) => setFormCompatibility(e.target.value)}
                    placeholder="Mahindra Thar (2020+), Toyota Fortuner, Hilux, Jimny, Force Gurkha"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Separate vehicles with commas. These become selectable in the customer model dropdown.
                  </p>
                </div>

                {/* 4. Installation */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    4. Installation (Fitment Guide & Tools Required)
                  </label>
                  <textarea
                    rows={2}
                    value={formInstallation}
                    onChange={(e) => setFormInstallation(e.target.value)}
                    placeholder="e.g. Direct bolt-on using factory OEM mounting points. Includes 1:1 scale cutting template..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>

                {/* 5. Delivery & Returns */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    5. Delivery & Returns Policy
                  </label>
                  <textarea
                    rows={2}
                    value={formDelivery}
                    onChange={(e) => setFormDelivery(e.target.value)}
                    placeholder="e.g. Dispatches within 24–48 hours across India in heavy protective wooden crates. 7-day hassle-free replacement..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold uppercase tracking-wider shadow-md shadow-[#e51b24]/20 cursor-pointer"
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
