'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatRupees } from '@/lib/whatsapp';
import { useCart } from '@/lib/cart-context';
import { WhatsAppOrderModal } from './WhatsAppOrderModal';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { CartDrawer } from '../cart/CartDrawer';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailView({ product, relatedProducts = [] }: ProductDetailViewProps) {
  // Pure light mode theme
  const isLight = true;
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(product.compatibility_models?.[0] || 'Mahindra Thar (2020+)');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'compatibility' | 'installation' | 'delivery'>('description');
  const [mobileOpenTab, setMobileOpenTab] = useState<string | null>('description');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const { addItem } = useCart();

  // Hydrate updated product from admin storage if edited
  useEffect(() => {
    // 1. Check localStorage first
    try {
      const saved = localStorage.getItem('bullgear_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const match = parsed.find((p: Product) => p.slug === product.slug || p.id === product.id);
          if (match) {
            setCurrentProduct(match);
            if (match.compatibility_models?.length && !match.compatibility_models.includes(selectedVehicle)) {
              setSelectedVehicle(match.compatibility_models[0]);
            }
          }
        }
      }
    } catch {}

    // 2. Fetch live from API
    const fetchLatest = () => {
      fetch('/api/products')
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data)) {
            const match = resData.data.find((p: Product) => p.slug === product.slug || p.id === product.id);
            if (match) {
              setCurrentProduct(match);
              if (match.compatibility_models?.length && !match.compatibility_models.includes(selectedVehicle)) {
                setSelectedVehicle(match.compatibility_models[0]);
              }
            }
          }
        })
        .catch(() => {});
    };

    fetchLatest();

    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('bullgear_admin_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const match = parsed.find((p: Product) => p.slug === product.slug || p.id === product.id);
            if (match) {
              setCurrentProduct(match);
              return;
            }
          }
        }
      } catch {}
      fetchLatest();
    };

    window.addEventListener('bullgear_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('bullgear_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [product.slug, product.id, selectedVehicle]);

  const images = currentProduct.images?.length ? currentProduct.images : [];

  const currentImage = images[activeImageIndex] || images[0];

  const handleAddToCart = () => {
    addItem(currentProduct, quantity, selectedVehicle);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  // Specifications: strictly what admin entered (internal _ system keys filtered out)
  const cleanSpecsEntries = Object.entries(currentProduct.specifications || {})
    .filter(([k, v]) => !k.startsWith('_') && k.trim() !== '' && v !== undefined && v !== '');

  const specs = Object.fromEntries(cleanSpecsEntries);

  const installationText = currentProduct.installation_info || 
    'Direct bolt-on installation using OEM factory mounting points. Includes comprehensive 1:1 scale cutting/drilling template, all high-tensile brackets, stainless steel hardware, and step-by-step fitment guide. No welding required.';

  const deliveryText = currentProduct.delivery_returns_info || 
    'Dispatches within 24–48 hours across India. Packed in heavy reinforced wooden crates to ensure zero transit damage. 7-day hassle-free replacement on any fitment or delivery issues with 100% insured transit.';

  const compatibilityList = currentProduct.compatibility_models?.length
    ? currentProduct.compatibility_models
    : ['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Suzuki Jimny', 'Force Gurkha', 'Universal 4x4'];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Light Navbar */}
      <Navbar theme="light" />

      <main className="flex-1 pb-20">
        
        {/* Top bar with Breadcrumbs */}
        <div className="">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
            
            {/* Breadcrumb matching reference: Home / Snorkels / Premium Snorkel Kit */}
            <nav className="flex items-center gap-2 text-gray-500 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-[#e51b24] transition-colors">Home</Link>
              <span>/</span>
              <Link
                href={`/categories/${currentProduct.category_slug || 'snorkels'}`}
                className="hover:text-[#e51b24] transition-colors"
              >
                {currentProduct.category_name || 'Accessories'}
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-900">
                {currentProduct.name}
              </span>
            </nav>

          </div>
        </div>

        {/* Product Overview Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Gallery (Thumbnails column + Main Image) */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
              
              {/* Vertical Thumbnails list */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all p-1.5 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#e51b24] ring-2 ring-[#e51b24]/30'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || currentProduct.name}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>

              {/* Big Main Stage Image with Arrows (Uncropped on mobile) */}
              <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-md flex items-center justify-center p-3 sm:p-6 min-h-[280px] sm:min-h-[480px]">

                {/* Left arrow */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full border border-gray-200 bg-white/90 text-gray-700 hover:bg-white shadow-md transition z-10 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Main Product Image - Full uncropped containment */}
                <div className="relative w-full h-[260px] sm:h-[420px] flex items-center justify-center">
                  {currentImage?.image_url ? (
                    <Image
                      src={currentImage.image_url}
                      alt={currentImage.alt_text || currentProduct.name}
                      fill
                      priority
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {currentProduct.name}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-1">Image not yet uploaded by admin</span>
                    </div>
                  )}
                </div>

                {/* Right arrow */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full border border-gray-200 bg-white/90 text-gray-700 hover:bg-white shadow-md transition z-10 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Right Column: Product Information and Actions */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              
              {/* Category label */}
              <span className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                {currentProduct.category_name || 'ACCESSORIES'}
              </span>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight mt-1 mb-3 text-gray-900">
                {currentProduct.name}
              </h1>

              {/* Price and Stock Status */}
              <div className="flex items-center gap-3.5 mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#e51b24]">
                  {formatRupees(currentProduct.sale_price ?? currentProduct.price)}
                </span>
                {currentProduct.sale_price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatRupees(currentProduct.price)}
                  </span>
                )}
                {(() => {
                  const stockQty = typeof currentProduct.stock_quantity === 'number' ? currentProduct.stock_quantity : parseInt(currentProduct.stock_quantity as any, 10);
                  const isOutOfStock = currentProduct.stock_status === 'out_of_stock' || (!isNaN(stockQty) && stockQty <= 0);
                  const isLimitedStock = !isOutOfStock && (currentProduct.stock_status === 'limited_stock' || (!isNaN(stockQty) && stockQty > 0 && stockQty <= (currentProduct.low_stock_threshold || 5)));

                  if (isOutOfStock) {
                    return (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e51b24] text-white shadow-xs">
                        Out of Stock
                      </span>
                    );
                  }
                  if (isLimitedStock) {
                    return (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                        Limited Stock {!isNaN(stockQty) && stockQty > 0 ? `(${stockQty} left)` : ''}
                      </span>
                    );
                  }
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                      In Stock
                    </span>
                  );
                })()}
              </div>

              {/* Short Description */}
              <p className="text-sm leading-relaxed mb-6 text-gray-600">
                {currentProduct.description || currentProduct.short_description}
              </p>

              {/* Vehicle Compatibility & Quantity Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                
                {/* Vehicle Selector (2 cols) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700">
                    Vehicle Compatibility
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-medium border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#e51b24] cursor-pointer"
                  >
                    {compatibilityList.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 bg-gray-50 rounded-lg overflow-hidden h-[41px]">
                    <button
                      type="button"
                      disabled={currentProduct.stock_status === 'out_of_stock' || currentProduct.stock_quantity <= 0}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-500 hover:text-black font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={currentProduct.stock_status === 'out_of_stock' || currentProduct.stock_quantity <= 0}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-500 hover:text-black font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons: Add to Cart (Red) & Buy Now / Order via WhatsApp */}
              {(() => {
                const stockQty = typeof currentProduct.stock_quantity === 'number' ? currentProduct.stock_quantity : parseInt(currentProduct.stock_quantity as any, 10);
                const isOutOfStock = currentProduct.stock_status === 'out_of_stock' || (!isNaN(stockQty) && stockQty <= 0);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="w-full py-4 px-6 bg-[#e51b24] hover:bg-[#c8141d] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#e51b24]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>

                    {isOutOfStock ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-4 px-6 font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 bg-[#e51b24] text-white cursor-not-allowed shadow-md select-none opacity-90"
                      >
                        <span>OUT OF STOCK</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsWhatsAppOpen(true)}
                        className="w-full py-4 px-6 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 border bg-black hover:bg-gray-800 text-white border-black cursor-pointer shadow-md"
                      >
                        <MessageSquare className="w-4 h-4 text-[#25D366]" />
                        <span>Buy Now (WhatsApp)</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Success Notification */}
              {addedToast && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added {quantity} × {currentProduct.name} ({selectedVehicle}) to your cart!</span>
                </div>
              )}

              {/* 3 Trust Badges */}
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="w-5 h-5 text-[#e51b24] mb-1" />
                  <span className="text-[11px] font-bold">Express Dispatch</span>
                  <span className="text-[10px] text-gray-500">Across India</span>
                </div>
                <div className="flex flex-col items-center border-x border-gray-200 px-2">
                  <RotateCcw className="w-5 h-5 text-[#e51b24] mb-1" />
                  <span className="text-[11px] font-bold">Easy Returns</span>
                  <span className="text-[10px] text-gray-500">7 Days Policy</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#e51b24] mb-1" />
                  <span className="text-[11px] font-bold">Secure Order</span>
                  <span className="text-[10px] text-gray-500">100% Safe</span>
                </div>
              </div>

            </div>

          </div>

          {/* Tabbed Product Details Section (Mobile: Vertical Accordion with + button; Desktop: Current Horizontal Tabs) */}
          <div className="mt-12 sm:mt-24">
            
            {/* Mobile View: Vertical Accordion with + Button (One by one, no horizontal scroll) */}
            <div className="md:hidden divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'compatibility', label: 'Compatibility' },
                { id: 'installation', label: 'Installation' },
                { id: 'delivery', label: 'Delivery & Returns' },
              ].map((tab) => {
                const isOpen = mobileOpenTab === tab.id;
                return (
                  <div key={tab.id} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => setMobileOpenTab(isOpen ? null : tab.id)}
                      className={`w-full py-3.5 px-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isOpen ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className={`text-xs font-extrabold uppercase tracking-wider ${
                        isOpen ? 'text-[#e51b24]' : 'text-gray-900'
                      }`}>
                        {tab.label}
                      </span>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-sm transition-transform duration-200 ${
                        isOpen
                          ? 'bg-[#e51b24] text-white rotate-45'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        +
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 pt-1">
                        {tab.id === 'description' && (
                          <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                            <p>{currentProduct.description || currentProduct.short_description}</p>
                            {currentProduct.features && currentProduct.features.length > 0 && (
                              <>
                                <h4 className="text-xs font-bold uppercase tracking-wide pt-2 text-gray-900">
                                  Key Highlights
                                </h4>
                                <ul className="space-y-1.5">
                                  {currentProduct.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#e51b24] mt-1.5 shrink-0" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        )}

                        {tab.id === 'specifications' && (
                          <div className="overflow-x-auto">
                            {Object.keys(specs).length > 0 ? (
                              <table className="w-full text-xs border-collapse">
                                <tbody>
                                  {Object.entries(specs).map(([key, val], idx) => (
                                    <tr
                                      key={key}
                                      className={`border-b ${
                                        idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                      } border-gray-200`}
                                    >
                                      <td className="py-2.5 px-3 font-bold text-gray-500 w-2/5 uppercase tracking-wider text-[10px]">
                                        {key}
                                      </td>
                                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                                        {val}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-xs text-gray-500 py-3 italic">
                                Specifications to be confirmed with supplier. WhatsApp our team for verified details.
                              </p>
                            )}
                          </div>
                        )}

                        {tab.id === 'compatibility' && (
                          <div className="space-y-3">
                            <p className="text-xs text-gray-600">
                              Test-fitted and guaranteed for the following chassis:
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {compatibilityList.map((model) => (
                                <div
                                  key={model}
                                  className="p-2.5 rounded-lg border flex items-center gap-2 text-xs font-semibold bg-gray-50 border-gray-200 text-gray-800"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#e51b24] shrink-0" />
                                  <span>{model}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tab.id === 'installation' && (
                          <div className="text-xs leading-relaxed space-y-2 text-gray-700">
                            <p>{installationText}</p>
                            <p className="text-[11px] text-gray-500 font-medium">
                              Need professional fitment support? WhatsApp our technical team for verified workshops near your city.
                            </p>
                          </div>
                        )}

                        {tab.id === 'delivery' && (
                          <div className="text-xs leading-relaxed space-y-2 text-gray-700">
                            <p>{deliveryText}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Horizontal Tabs */}
            <div className="hidden md:block">
              {/* Tabs Header */}
              <div className="flex border-b overflow-x-auto gap-8 border-gray-200">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'specifications', label: 'Specifications' },
                  { id: 'compatibility', label: 'Compatibility' },
                  { id: 'installation', label: 'Installation' },
                  { id: 'delivery', label: 'Delivery & Returns' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-[#e51b24]'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e51b24]" />
                    )}
                  </button>
                ))}
              </div>

            {/* Tab Contents */}
            <div className="py-8">
              {activeTab === 'description' && (
                <div className="space-y-4 max-w-4xl text-sm leading-relaxed text-gray-700">
                  <p>{currentProduct.description || currentProduct.short_description}</p>
                  {currentProduct.features && currentProduct.features.length > 0 && (
                    <>
                      <h4 className="text-base font-bold uppercase tracking-wide pt-4 text-gray-900">
                        Key Highlights
                      </h4>
                      <ul className="space-y-2">
                        {currentProduct.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e51b24] mt-2 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="max-w-3xl">
                  {Object.keys(specs).length > 0 ? (
                    <table className="w-full text-xs sm:text-sm border-collapse rounded-xl overflow-hidden border border-gray-200">
                      <tbody>
                        {Object.entries(specs).map(([key, val], idx) => (
                          <tr
                            key={key}
                            className={`border-b border-gray-200 ${
                              idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <td className="py-3 px-4 font-bold text-gray-500 w-1/3 uppercase tracking-wider text-xs">
                              {key}
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-900">
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-500 py-4 italic">
                      Specifications to be confirmed with supplier. WhatsApp our team for verified details.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'compatibility' && (
                <div className="max-w-3xl space-y-4">
                  <p className="text-sm text-gray-600">
                    This accessory is precision designed and test-fitted on the following vehicle chassis:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {compatibilityList.map((model) => (
                      <div
                        key={model}
                        className="p-3 rounded-lg border flex items-center gap-2.5 text-xs font-semibold bg-gray-50 border-gray-200 text-gray-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#e51b24]" />
                        <span>{model}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'installation' && (
                <div className="max-w-3xl text-sm leading-relaxed space-y-3 text-gray-700">
                  <p>{installationText}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    Need professional fitment? WhatsApp our technical team to locate a Bull Gear verified fitment workshop near your city.
                  </p>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="max-w-3xl text-sm leading-relaxed space-y-3 text-gray-700">
                  <p>{deliveryText}</p>
                </div>
              )}
            </div>
            </div>

          </div>

        </div>

      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* WhatsApp Direct Order Modal */}
      <WhatsAppOrderModal
        product={currentProduct}
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        initialQuantity={quantity}
        initialModel={selectedVehicle}
      />

      {/* Brand Footer */}
      <Footer />
    </div>
  );
}
