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
  Sparkles,
} from 'lucide-react';
import { Product, Category, StockStatus, ProductImage } from '@/lib/types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '@/lib/db';
import { formatRupees } from '@/lib/whatsapp';
import { ProductImagesUpload } from '@/components/admin/ProductImagesUpload';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';

const MAX_BEST_SELLERS = 6;
const MAX_FEATURED = 4;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Custom Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const [formBestSellerOrder, setFormBestSellerOrder] = useState<number>(1);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formFeaturedOrder, setFormFeaturedOrder] = useState<number>(1);

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

  const [isSaving, setIsSaving] = useState(false);

  // Normalizes list so no two items share duplicate order numbers and gaps are removed
  const normalizeProductOrders = (prods: Product[]): Product[] => {
    const featured = prods
      .filter((p) => p.is_featured)
      .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99));
    const featMap = new Map<string, number>();
    featured.forEach((p, idx) => {
      featMap.set(p.id, Math.min(idx + 1, MAX_FEATURED));
    });

    const bestSellers = prods
      .filter((p) => p.is_best_seller)
      .sort((a, b) => (a.best_seller_order || 99) - (b.best_seller_order || 99));
    const bestMap = new Map<string, number>();
    bestSellers.forEach((p, idx) => {
      bestMap.set(p.id, Math.min(idx + 1, MAX_BEST_SELLERS));
    });

    return prods.map((p) => {
      let item = p;
      if (p.is_featured && featMap.has(p.id)) {
        item = { ...item, featured_order: featMap.get(p.id) };
      }
      if (p.is_best_seller && bestMap.has(p.id)) {
        item = { ...item, best_seller_order: bestMap.get(p.id) };
      }
      return item;
    });
  };

  // Reorders featured list when an order is selected, shifting existing items down
  const reorderFeatured = (productsList: Product[], targetId: string, newPosition: number): Product[] => {
    const currentFeatured = productsList
      .filter((p) => p.is_featured)
      .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99));

    const targetIdx = currentFeatured.findIndex((p) => p.id === targetId);
    if (targetIdx === -1) return productsList;

    const [moved] = currentFeatured.splice(targetIdx, 1);
    const insertIdx = Math.max(0, Math.min(newPosition - 1, currentFeatured.length));
    currentFeatured.splice(insertIdx, 0, moved);

    const orderMap = new Map<string, number>();
    currentFeatured.forEach((item, idx) => {
      orderMap.set(item.id, idx + 1);
    });

    return productsList.map((p) => {
      if (orderMap.has(p.id)) {
        return { ...p, featured_order: orderMap.get(p.id) };
      }
      return p;
    });
  };

  // Reorders best sellers list when an order is selected, shifting existing items down
  const reorderBestSellers = (productsList: Product[], targetId: string, newPosition: number): Product[] => {
    const currentBestSellers = productsList
      .filter((p) => p.is_best_seller)
      .sort((a, b) => (a.best_seller_order || 99) - (b.best_seller_order || 99));

    const targetIdx = currentBestSellers.findIndex((p) => p.id === targetId);
    if (targetIdx === -1) return productsList;

    const [moved] = currentBestSellers.splice(targetIdx, 1);
    const insertIdx = Math.max(0, Math.min(newPosition - 1, currentBestSellers.length));
    currentBestSellers.splice(insertIdx, 0, moved);

    const orderMap = new Map<string, number>();
    currentBestSellers.forEach((item, idx) => {
      orderMap.set(item.id, idx + 1);
    });

    return productsList.map((p) => {
      if (orderMap.has(p.id)) {
        return { ...p, best_seller_order: orderMap.get(p.id) };
      }
      return p;
    });
  };

  const syncProductsOrderToApi = async (prodsToSync: Product[]) => {
    try {
      await Promise.all(
        prodsToSync.map((p) =>
          fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: p.id,
              name: p.name,
              slug: p.slug,
              is_featured: p.is_featured,
              featured_order: p.featured_order,
              is_best_seller: p.is_best_seller,
              best_seller_order: p.best_seller_order,
              specifications: p.specifications,
            }),
          }).catch((err) => console.error('Failed to sync product order:', err))
        )
      );
    } catch (e) {
      console.error('Batch sync error:', e);
    }
  };

  // Fetch live products from API + fallback to localStorage
  const loadProducts = () => {
    try {
      const saved = localStorage.getItem('bullgear_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = normalizeProductOrders(parsed);
          setProducts(normalized);
        }
      }
    } catch {}

    fetch('/api/products')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const normalized = normalizeProductOrders(resData.data);
          setProducts(normalized);
          try {
            localStorage.setItem('bullgear_admin_products', JSON.stringify(normalized));
          } catch {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const saveToStorage = (updated: Product[]) => {
    const normalized = normalizeProductOrders(updated);
    setProducts(normalized);
    try {
      localStorage.setItem('bullgear_admin_products', JSON.stringify(normalized));
      window.dispatchEvent(new Event('bullgear_products_updated'));
    } catch {}
  };

  const bestSellersCount = products.filter((p) => p.is_best_seller).length;
  const featuredCount = products.filter((p) => p.is_featured).length;

  const toggleFeatured = async (productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    if (!targetProduct.is_featured && featuredCount >= MAX_FEATURED) {
      alert(`Maximum ${MAX_FEATURED} products can be featured. Please untick another product first.`);
      return;
    }

    if (targetProduct.is_featured) {
      // Turning OFF -> re-index remaining
      const remaining = products
        .filter((p) => p.is_featured && p.id !== productId)
        .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99));

      const orderMap = new Map<string, number>();
      remaining.forEach((p, idx) => orderMap.set(p.id, idx + 1));

      const updated = products.map((p) => {
        if (p.id === productId) {
          return { ...p, is_featured: false, featured_order: undefined };
        }
        if (orderMap.has(p.id)) {
          return { ...p, featured_order: orderMap.get(p.id) };
        }
        return p;
      });

      saveToStorage(updated);
      syncProductsOrderToApi(updated.filter((p) => p.id === productId || orderMap.has(p.id)));
    } else {
      // Turning ON -> assign next slot
      const currentFeatured = products
        .filter((p) => p.is_featured)
        .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99));

      const nextSlot = Math.min(MAX_FEATURED, currentFeatured.length + 1);
      const updated = products.map((p) =>
        p.id === productId ? { ...p, is_featured: true, featured_order: nextSlot } : p
      );
      saveToStorage(updated);
      syncProductsOrderToApi([updated.find((p) => p.id === productId)!]);
    }
  };

  const updateFeaturedOrder = async (productId: string, order: number) => {
    const updated = reorderFeatured(products, productId, order);
    saveToStorage(updated);
    const affected = updated.filter((p) => p.is_featured);
    syncProductsOrderToApi(affected);
  };

  const toggleBestSeller = async (productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    if (!targetProduct.is_best_seller && bestSellersCount >= MAX_BEST_SELLERS) {
      alert(`Maximum ${MAX_BEST_SELLERS} products can be featured in Best Sellers. Please untick another product first.`);
      return;
    }

    if (targetProduct.is_best_seller) {
      // Turning OFF -> re-index remaining
      const remaining = products
        .filter((p) => p.is_best_seller && p.id !== productId)
        .sort((a, b) => (a.best_seller_order || 99) - (b.best_seller_order || 99));

      const orderMap = new Map<string, number>();
      remaining.forEach((p, idx) => orderMap.set(p.id, idx + 1));

      const updated = products.map((p) => {
        if (p.id === productId) {
          return { ...p, is_best_seller: false, best_seller_order: undefined };
        }
        if (orderMap.has(p.id)) {
          return { ...p, best_seller_order: orderMap.get(p.id) };
        }
        return p;
      });

      saveToStorage(updated);
      syncProductsOrderToApi(updated.filter((p) => p.id === productId || orderMap.has(p.id)));
    } else {
      // Turning ON -> assign next slot
      const currentBestSellers = products
        .filter((p) => p.is_best_seller)
        .sort((a, b) => (a.best_seller_order || 99) - (b.best_seller_order || 99));

      const nextSlot = Math.min(MAX_BEST_SELLERS, currentBestSellers.length + 1);
      const updated = products.map((p) =>
        p.id === productId ? { ...p, is_best_seller: true, best_seller_order: nextSlot } : p
      );
      saveToStorage(updated);
      syncProductsOrderToApi([updated.find((p) => p.id === productId)!]);
    }
  };

  const updateBestSellerOrder = async (productId: string, order: number) => {
    const updated = reorderBestSellers(products, productId, order);
    saveToStorage(updated);
    const affected = updated.filter((p) => p.is_best_seller);
    syncProductsOrderToApi(affected);
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
      { key: 'Product Type', value: '' },
      { key: 'Vehicle Brand', value: 'Mahindra' },
      { key: 'Compatible Model', value: 'Thar' },
      { key: 'Fuel Type', value: '' },
      { key: 'Colour', value: 'Black' },
      { key: 'Finish', value: '' },
      { key: 'Material', value: '' },
      { key: 'Package Contents', value: '' },
    ]);
    setFormInstallation('Direct bolt-on installation using vehicle OEM factory mounting points. Includes comprehensive 1:1 scale cutting/mounting template, all high-tensile brackets, stainless steel hardware, and step-by-step fitment guide.');
    setFormDelivery('Dispatches within 24–48 hours across India. Packed in heavy reinforced wooden crates to ensure zero transit damage. 7-day hassle-free replacement on any fitment or delivery issues.');
    setFormIsBestSeller(bestSellersCount < MAX_BEST_SELLERS);
    setFormBestSellerOrder(Math.min(bestSellersCount + 1, MAX_BEST_SELLERS));
    setFormIsFeatured(featuredCount < MAX_FEATURED);
    setFormFeaturedOrder(Math.min(featuredCount + 1, MAX_FEATURED));
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
    setFormImages(p.images || []);
    setFormDescription(p.description || '');
    setFormCompatibility(p.compatibility_models?.join(', ') || '');
    
    // Parse specifications (filter out internal underscore keys like _featured_order, _best_seller_order)
    const specsEntries = Object.entries(p.specifications || {}).filter(([k]) => !k.startsWith('_'));
    if (specsEntries.length > 0) {
      setFormSpecifications(specsEntries.map(([k, v]) => ({ key: k, value: String(v) })));
    } else {
      setFormSpecifications([
        { key: 'Product Type', value: p.name },
        { key: 'Vehicle Brand', value: 'Mahindra' },
        { key: 'Compatible Model', value: 'Thar' },
        { key: 'Fuel Type', value: '' },
        { key: 'Colour', value: 'Black' },
        { key: 'Finish', value: '' },
        { key: 'Material', value: '' },
        { key: 'Package Contents', value: p.name },
      ]);
    }

    setFormInstallation(p.installation_info || 'Direct bolt-on installation using vehicle OEM factory mounting points. Includes comprehensive 1:1 scale cutting/mounting template, all high-tensile brackets, stainless steel hardware, and step-by-step fitment guide.');
    setFormDelivery(p.delivery_returns_info || 'Dispatches within 24–48 hours across India. Packed in heavy reinforced wooden crates to ensure zero transit damage. 7-day hassle-free replacement on any fitment or delivery issues.');
    setFormIsBestSeller(p.is_best_seller ?? false);
    setFormBestSellerOrder(p.best_seller_order || 1);
    setFormIsFeatured(p.is_featured ?? false);
    setFormFeaturedOrder(p.featured_order || 1);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const catObj = categories.find((c) => c.id === formCategory);
    const parsedStock = parseInt(formStock, 10) || 0;
    const stockStatus: StockStatus = parsedStock === 0 ? 'out_of_stock' : parsedStock <= 5 ? 'limited_stock' : 'in_stock';
    const models = formCompatibility.split(',').map((s) => s.trim()).filter(Boolean);

    // Convert dynamic specifications rows to object (exclude internal underscore keys)
    const specsObj: Record<string, string> = {};
    formSpecifications.forEach(({ key, value }) => {
      const trimmedKey = key.trim();
      const trimmedVal = value.trim();
      if (trimmedKey && !trimmedKey.startsWith('_') && trimmedVal !== '') {
        specsObj[trimmedKey] = trimmedVal;
      }
    });

    // Guard featured count
    if (formIsFeatured && (!editingProduct || !editingProduct.is_featured) && featuredCount >= MAX_FEATURED) {
      alert(`Maximum ${MAX_FEATURED} products can be featured in Featured Products.`);
      return;
    }

    // Guard best sellers count
    if (formIsBestSeller && (!editingProduct || !editingProduct.is_best_seller) && bestSellersCount >= MAX_BEST_SELLERS) {
      alert(`Maximum ${MAX_BEST_SELLERS} products can be featured in Best Sellers.`);
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sku: formSku,
        price: parseFloat(formPrice) || 0,
        category_id: formCategory || null,
        stock_quantity: parsedStock,
        stock_status: stockStatus,
        is_best_seller: formIsBestSeller,
        best_seller_order: formIsBestSeller ? Number(formBestSellerOrder) : undefined,
        is_featured: formIsFeatured,
        featured_order: formIsFeatured ? Number(formFeaturedOrder) : undefined,
        is_published: true,
        description: formDescription,
        compatibility_models: models,
        specifications: specsObj,
        installation_info: formInstallation,
        delivery_returns_info: formDelivery,
        images: formImages, // Uploaded images without any hardcoded snorkel fallback!
      };

      if (editingProduct) {
        payload.id = editingProduct.id;
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          throw new Error(resData.error || 'Failed to update product in database');
        }

        const updatedProd: Product = {
          ...editingProduct,
          ...payload,
          category_name: catObj?.name,
          category_slug: catObj?.slug,
          images: formImages,
        };

        let updated = products.map((p) => (p.id === editingProduct.id ? updatedProd : p));
        if (formIsFeatured) {
          updated = reorderFeatured(updated, editingProduct.id, Number(formFeaturedOrder));
        }
        if (formIsBestSeller) {
          updated = reorderBestSellers(updated, editingProduct.id, Number(formBestSellerOrder));
        }
        saveToStorage(updated);
        syncProductsOrderToApi(updated.filter((p) => p.is_featured || p.is_best_seller));
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          throw new Error(resData.error || 'Failed to create product in database');
        }

        const newProd: Product = {
          id: resData.data?.id || `prod-${Date.now()}`,
          name: formName,
          slug: payload.slug,
          sku: formSku,
          price: parseFloat(formPrice) || 0,
          category_id: formCategory,
          category_name: catObj?.name,
          category_slug: catObj?.slug,
          stock_quantity: parsedStock,
          low_stock_threshold: 5,
          stock_status: stockStatus,
          is_featured: formIsFeatured,
          featured_order: formIsFeatured ? Number(formFeaturedOrder) : undefined,
          is_best_seller: formIsBestSeller,
          best_seller_order: formIsBestSeller ? Number(formBestSellerOrder) : undefined,
          is_published: true,
          description: formDescription,
          compatibility_models: models,
          specifications: specsObj,
          installation_info: formInstallation,
          delivery_returns_info: formDelivery,
          features: ['Engineered for extreme off-road durability', 'Precision CNC laser-cut and hand-finished'],
          images: formImages,
        };

        saveToStorage([newProd, ...products]);
      }

      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving product: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const id = productToDelete.id;
    const updated = products.filter((p) => p.id !== id);
    saveToStorage(updated);

    try {
      await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete product from database:', err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setProductToDelete(null);
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
                featuredCount === MAX_FEATURED
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e51b24]" />
              <span>Featured: {featuredCount} / {MAX_FEATURED}</span>
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                bestSellersCount === MAX_BEST_SELLERS
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Best Sellers: {bestSellersCount} / {MAX_BEST_SELLERS}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage inventory and display order: <strong>Featured Products</strong> (up to 4 products in order 1–4) &amp; <strong>Shop Our Best Sellers</strong> (up to 6 products in order 1–6).
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

      {/* Info Notice about Homepage Display Rules */}
      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-start sm:items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#e51b24] shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="text-gray-900 font-bold">Homepage Display Control:</strong> Choose up to <strong>4 Featured Products</strong> (with order #1–#4) and up to <strong>6 Best Sellers</strong> (with order #1–#6). You can set the display order directly in the table or inside the edit modal!
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono font-bold">
          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            Featured: {featuredCount}/{MAX_FEATURED}
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Best Sellers: {bestSellersCount}/{MAX_BEST_SELLERS}
          </span>
        </div>
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
          <table className="w-full text-left text-xs table-auto">
            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap align-middle">Item</th>
                <th className="py-3 px-2.5 whitespace-nowrap align-middle font-mono">SKU</th>
                <th className="py-3 px-2.5 whitespace-nowrap align-middle">Price</th>
                <th className="py-3 px-2 text-center whitespace-nowrap align-middle w-[90px]">Featured (4)</th>
                <th className="py-3 px-2 text-center whitespace-nowrap align-middle w-[90px]">Best Seller (6)</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Inventory</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Status</th>
                <th className="py-3 px-3 text-right whitespace-nowrap align-middle sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isBestSeller = !!p.is_best_seller;
                const isFeatured = !!p.is_featured;
                const stockQty = typeof p.stock_quantity === 'number' ? p.stock_quantity : parseInt(p.stock_quantity as any, 10);
                const isOut = p.stock_status === 'out_of_stock' || (!isNaN(stockQty) && stockQty <= 0);
                const isLimited = !isOut && (p.stock_status === 'limited_stock' || (!isNaN(stockQty) && stockQty > 0 && stockQty <= (p.low_stock_threshold || 5)));

                return (
                  <tr key={p.id} className="hover:bg-gray-50 group transition-colors">
                    {/* Item with integrated Category Badge */}
                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                          {p.images?.[0]?.image_url ? (
                            <Image
                              src={p.images[0].image_url}
                              alt={p.name}
                              fill
                              className="object-contain p-0.5"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px] xl:max-w-[260px]">
                          <span className="font-bold text-gray-900 line-clamp-1 text-xs" title={p.name}>{p.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded truncate">
                              {p.category_name || 'Accessories'}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate">/{p.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-2.5 px-2.5 font-mono text-[11px] text-gray-500 whitespace-nowrap align-middle">
                      {p.sku || 'N/A'}
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-2.5 font-bold text-gray-900 whitespace-nowrap align-middle">
                      {formatRupees(p.price)}
                    </td>

                    {/* Featured (Max 4) - Stacked vertically (one by one bottom) with Undo */}
                    <td className="py-2.5 px-2 text-center align-middle whitespace-nowrap w-[90px]">
                      {isFeatured ? (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(p.id)}
                            className="inline-flex items-center justify-center gap-1 w-full max-w-[82px] py-1 px-1.5 rounded bg-[#e51b24] hover:bg-[#c8141d] text-white text-[10px] font-extrabold uppercase tracking-wide transition cursor-pointer shadow-xs"
                            title="Click to remove / undo Featured"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Featured</span>
                          </button>
                          <select
                            value={p.featured_order || 1}
                            onChange={(e) => {
                              if (e.target.value === 'undo') {
                                toggleFeatured(p.id);
                              } else {
                                updateFeaturedOrder(p.id, Number(e.target.value));
                              }
                            }}
                            className="w-full max-w-[82px] py-0.5 px-1 rounded bg-white border border-red-200 text-[#e51b24] font-extrabold text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-[#e51b24] cursor-pointer"
                            title="Display position (1 to 4) or select Undo to remove"
                          >
                            <option value={1}>#1 (1st)</option>
                            <option value={2}>#2 (2nd)</option>
                            <option value={3}>#3 (3rd)</option>
                            <option value={4}>#4 (4th)</option>
                            <option value="undo" className="text-red-700 font-bold">✕ Undo</option>
                          </select>
                        </div>
                      ) : featuredCount >= MAX_FEATURED ? (
                        <div className="flex flex-col items-center">
                          <span
                            className="inline-flex items-center justify-center w-full max-w-[82px] py-1 px-1 rounded text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-200/60 opacity-50 cursor-not-allowed select-none"
                            title="4/4 slots full. Select Undo on any featured product to free a slot."
                          >
                            Max 4 Full
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(p.id)}
                            className="inline-flex items-center justify-center gap-1 w-full max-w-[82px] py-1 px-1.5 rounded text-[10px] font-bold bg-white text-gray-700 border border-gray-300 hover:border-[#e51b24] hover:text-[#e51b24] hover:bg-red-50/40 transition cursor-pointer shadow-2xs"
                            title="Click to feature in Featured Products"
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                            <span>+ Feature</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Best Seller (Max 6) - Stacked vertically (one by one bottom) with Undo */}
                    <td className="py-2.5 px-2 text-center align-middle whitespace-nowrap w-[90px]">
                      {isBestSeller ? (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleBestSeller(p.id)}
                            className="inline-flex items-center justify-center gap-1 w-full max-w-[82px] py-1 px-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wide transition cursor-pointer shadow-xs"
                            title="Click to remove / undo Best Seller"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Best Seller</span>
                          </button>
                          <select
                            value={p.best_seller_order || 1}
                            onChange={(e) => {
                              if (e.target.value === 'undo') {
                                toggleBestSeller(p.id);
                              } else {
                                updateBestSellerOrder(p.id, Number(e.target.value));
                              }
                            }}
                            className="w-full max-w-[82px] py-0.5 px-1 rounded bg-white border border-emerald-200 text-emerald-700 font-extrabold text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            title="Display position (1 to 6) or select Undo to remove"
                          >
                            <option value={1}>#1 (1st)</option>
                            <option value={2}>#2 (2nd)</option>
                            <option value={3}>#3 (3rd)</option>
                            <option value={4}>#4 (4th)</option>
                            <option value={5}>#5 (5th)</option>
                            <option value={6}>#6 (6th)</option>
                            <option value="undo" className="text-red-700 font-bold">✕ Undo</option>
                          </select>
                        </div>
                      ) : bestSellersCount >= MAX_BEST_SELLERS ? (
                        <div className="flex flex-col items-center">
                          <span
                            className="inline-flex items-center justify-center w-full max-w-[82px] py-1 px-1 rounded text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-200/60 opacity-50 cursor-not-allowed select-none"
                            title="6/6 slots full. Select Undo on any best seller to free a slot."
                          >
                            Max 6 Full
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => toggleBestSeller(p.id)}
                            className="inline-flex items-center justify-center gap-1 w-full max-w-[82px] py-1 px-1.5 rounded text-[10px] font-bold bg-white text-gray-700 border border-gray-300 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40 transition cursor-pointer shadow-2xs"
                            title="Click to feature in Best Sellers"
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                            <span>+ Best Seller</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Inventory */}
                    <td className="py-2.5 px-2.5 font-bold align-middle whitespace-nowrap text-center">
                      <span className={isOut ? 'text-red-600 font-extrabold' : isLimited ? 'text-amber-600' : 'text-emerald-600'}>
                        {p.stock_quantity} units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2.5 align-middle whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOut
                            ? 'bg-red-50 text-red-600 border border-red-200 font-extrabold'
                            : isLimited
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {isOut ? 'out of stock' : isLimited ? 'limited stock' : 'in stock'}
                      </span>
                    </td>

                    {/* Actions - Sticky Right so Edit and Delete are ALWAYS visible! */}
                    <td className="py-2.5 px-3 text-right align-middle whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] transition-colors">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
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
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24]"
                  />
                  <div className="shrink-0">
                    {(() => {
                      const qty = parseInt(formStock, 10);
                      if (isNaN(qty) || qty <= 0) {
                        return (
                          <span className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                            Out of Stock (Red Button)
                          </span>
                        );
                      }
                      if (qty <= 5) {
                        return (
                          <span className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            Limited Stock ({qty} left)
                          </span>
                        );
                      }
                      return (
                        <span className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          In Stock ({qty} units)
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  When quantity is 0 or less, storefront shows &quot;Out of Stock&quot; and the WhatsApp order button switches to a red &quot;OUT OF STOCK&quot; button. If 1–5, it displays &quot;Limited Stock&quot;.
                </p>
              </div>

              {/* Multi-Image File Upload */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <ProductImagesUpload
                  images={formImages}
                  onChange={setFormImages}
                  productId={editingProduct?.id || 'new-product'}
                />
              </div>

              {/* Merchandising: Featured Products & Best Sellers with Display Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Featured Products Card (Strictly 4) */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="formIsFeatured"
                        checked={formIsFeatured}
                        disabled={!formIsFeatured && featuredCount >= MAX_FEATURED}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="rounded text-[#e51b24] focus:ring-[#e51b24] cursor-pointer"
                      />
                      <label htmlFor="formIsFeatured" className="font-bold text-gray-900 cursor-pointer">
                        Feature in &quot;Featured Products&quot; (4 Slots)
                      </label>
                    </div>
                    <span className="font-mono text-[11px] text-gray-500 font-bold shrink-0">
                      {featuredCount} / {MAX_FEATURED}
                    </span>
                  </div>

                  {formIsFeatured && (
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-gray-700">Display Order (Homepage):</label>
                      <select
                        value={formFeaturedOrder}
                        onChange={(e) => {
                          if (e.target.value === 'undo') {
                            setFormIsFeatured(false);
                          } else {
                            setFormFeaturedOrder(Number(e.target.value));
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg border border-red-300 bg-white font-bold text-[#e51b24] text-xs focus:outline-none focus:border-[#e51b24] cursor-pointer"
                      >
                        <option value={1}>#1 (Show First)</option>
                        <option value={2}>#2 (Second)</option>
                        <option value={3}>#3 (Third)</option>
                        <option value={4}>#4 (Fourth)</option>
                        <option value="undo" className="text-red-700 font-bold">✕ Undo (Remove)</option>
                      </select>
                    </div>
                  )}

                  {!formIsFeatured && featuredCount >= MAX_FEATURED && (
                    <p className="text-[11px] text-amber-700">
                      Limit of 4 Featured Products reached. Untick another product to feature this one.
                    </p>
                  )}
                </div>

                {/* 2. Best Sellers Card (Strictly 6) */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="formIsBestSeller"
                        checked={formIsBestSeller}
                        disabled={!formIsBestSeller && bestSellersCount >= MAX_BEST_SELLERS}
                        onChange={(e) => setFormIsBestSeller(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="formIsBestSeller" className="font-bold text-gray-900 cursor-pointer">
                        Feature in &quot;Best Sellers&quot; (6 Slots)
                      </label>
                    </div>
                    <span className="font-mono text-[11px] text-gray-500 font-bold shrink-0">
                      {bestSellersCount} / {MAX_BEST_SELLERS}
                    </span>
                  </div>

                  {formIsBestSeller && (
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-gray-700">Display Order (Homepage):</label>
                      <select
                        value={formBestSellerOrder}
                        onChange={(e) => {
                          if (e.target.value === 'undo') {
                            setFormIsBestSeller(false);
                          } else {
                            setFormBestSellerOrder(Number(e.target.value));
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-white font-bold text-emerald-700 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value={1}>#1 (Show First)</option>
                        <option value={2}>#2 (Second)</option>
                        <option value={3}>#3 (Third)</option>
                        <option value={4}>#4 (Fourth)</option>
                        <option value={5}>#5 (Fifth)</option>
                        <option value={6}>#6 (Sixth)</option>
                        <option value="undo" className="text-red-700 font-bold">✕ Undo (Remove)</option>
                      </select>
                    </div>
                  )}

                  {!formIsBestSeller && bestSellersCount >= MAX_BEST_SELLERS && (
                    <p className="text-[11px] text-amber-700">
                      Limit of 6 Best Sellers reached. Untick another product to feature this one.
                    </p>
                  )}
                </div>
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

      {/* Bull Gear Centered Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Product from Armory"
        itemName={productToDelete?.name}
        message="Are you sure you want to remove this product from the armory? It will be permanently deleted from the database and storefront."
        confirmText="Delete Product"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
}
