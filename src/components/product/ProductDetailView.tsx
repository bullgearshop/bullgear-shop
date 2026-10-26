'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
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
  // Support light mode as shown in the reference image mockup, with toggle
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(product.compatibility_models?.[0] || 'Mahindra Thar (2020+)');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'compatibility' | 'installation' | 'delivery'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const { addItem } = useCart();

  const isLight = themeMode === 'light';
  const images = product.images?.length ? product.images : [
    {
      id: 'img-def',
      product_id: product.id,
      image_url: '/images/product-snorkel.jpg',
      alt_text: product.name,
      display_order: 1,
      is_primary: true,
    },
  ];

  const currentImage = images[activeImageIndex] || images[0];

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVehicle);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-white text-gray-900' : 'bg-[#0a0c10] text-white'
    }`}>
      {/* Navbar with matching theme */}
      <Navbar theme={themeMode} />

      <main className="flex-1 pb-20">
        
        {/* Top bar with Breadcrumbs & Theme Mode Toggle */}
        <div className={`border-b ${isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1b202c] bg-[#0d0f15]'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
            
            {/* Breadcrumb matching reference: Home / Snorkels / Premium Snorkel Kit */}
            <nav className="flex items-center gap-2 text-gray-500 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-[#e51b24] transition-colors">Home</Link>
              <span>/</span>
              <Link
                href={`/categories/${product.category_slug || 'snorkels'}`}
                className="hover:text-[#e51b24] transition-colors"
              >
                {product.category_name || 'Accessories'}
              </Link>
              <span>/</span>
              <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {product.name}
              </span>
            </nav>

            {/* Light / Dark Mode Presentation Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm'
                    : 'bg-[#141720] border-[#252c3c] text-gray-300 hover:text-white'
                }`}
                title="Toggle Reference Light/Dark Theme"
              >
                {isLight ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-gray-700" />
                    <span>Dark View</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reference White View</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Product Overview Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Gallery (Thumbnails column + Main Image) */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
              
              {/* Vertical Thumbnails list (as shown in reference image!) */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all p-1.5 ${
                      activeImageIndex === idx
                        ? 'border-[#e51b24] ring-2 ring-[#e51b24]/30'
                        : isLight
                        ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        : 'border-[#202636] bg-[#12151c] hover:border-gray-600'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>

              {/* Big Main Stage Image with Arrows */}
              <div className={`relative flex-1 rounded-2xl overflow-hidden border flex items-center justify-center p-6 min-h-[350px] sm:min-h-[480px] ${
                isLight ? 'bg-white border-gray-200 shadow-md' : 'bg-[#0f1218] border-[#202636]'
              }`}>
                {/* Wishlist Heart */}
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border transition ${
                    isLight
                      ? 'bg-white border-gray-200 text-gray-500 hover:text-[#e51b24]'
                      : 'bg-[#1b202c] border-[#2a3245] text-gray-300 hover:text-[#e51b24]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#e51b24] text-[#e51b24]' : ''}`} />
                </button>

                {/* Left arrow */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full border shadow-md transition ${
                    isLight
                      ? 'bg-white/90 border-gray-200 text-gray-700 hover:bg-white'
                      : 'bg-[#161a24]/90 border-[#2b3345] text-white hover:bg-[#e51b24]'
                  }`}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Main Product Image */}
                <div className="relative w-full h-[320px] sm:h-[420px]">
                  <Image
                    src={currentImage.image_url}
                    alt={currentImage.alt_text || product.name}
                    fill
                    priority
                    className="object-contain"
                  />
                </div>

                {/* Right arrow */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full border shadow-md transition ${
                    isLight
                      ? 'bg-white/90 border-gray-200 text-gray-700 hover:bg-white'
                      : 'bg-[#161a24]/90 border-[#2b3345] text-white hover:bg-[#e51b24]'
                  }`}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Right Column: Product Information and Actions */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              
              {/* Category label matching reference */}
              <span className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                {product.category_name || 'SNORKELS'}
              </span>

              {/* Title */}
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight mt-1 mb-3 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>
                {product.name}
              </h1>

              {/* Price and Stock Status */}
              <div className="flex items-center gap-3.5 mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#e51b24]">
                  {formatRupees(product.sale_price ?? product.price)}
                </span>
                {product.sale_price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatRupees(product.price)}
                  </span>
                )}
                {product.stock_status === 'in_stock' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                    In Stock
                  </span>
                ) : product.stock_status === 'limited_stock' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    Limited Stock ({product.stock_quantity} left)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/30">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className={`text-sm leading-relaxed mb-6 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                {product.description || product.short_description}
              </p>

              {/* Vehicle Compatibility & Quantity Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                
                {/* Vehicle Selector (2 cols) */}
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isLight ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Vehicle Compatibility
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-[#e51b24] ${
                      isLight
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-[#12151c] border-[#293142] text-white'
                    }`}
                  >
                    {product.compatibility_models?.length ? (
                      product.compatibility_models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))
                    ) : (
                      <option value="Universal 4x4">Universal 4x4</option>
                    )}
                  </select>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isLight ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Quantity
                  </label>
                  <div className={`flex items-center border rounded-lg overflow-hidden h-[41px] ${
                    isLight ? 'border-gray-300 bg-gray-50' : 'border-[#293142] bg-[#12151c]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-500 hover:text-black font-bold"
                    >
                      -
                    </button>
                    <span className={`flex-1 text-center text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-500 hover:text-black font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons: Add to Cart (Red) & Buy Now / Order via WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock_status === 'out_of_stock'}
                  className="w-full py-4 px-6 bg-[#e51b24] hover:bg-[#c8141d] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#e51b24]/25 disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWhatsAppOpen(true)}
                  className={`w-full py-4 px-6 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                    isLight
                      ? 'bg-black hover:bg-gray-800 text-white border-black'
                      : 'bg-[#181d28] hover:bg-[#202736] text-white border-[#2c3547]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>Buy Now (WhatsApp)</span>
                </button>
              </div>

              {/* Success Notification */}
              {addedToast && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added {quantity} × {product.name} ({selectedVehicle}) to your cart!</span>
                </div>
              )}

              {/* 3 Trust Badges (matching reference: Free Shipping, Easy Returns, Secure Payment) */}
              <div className={`grid grid-cols-3 gap-2 p-3.5 rounded-xl border text-center ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#12151c] border-[#202636]'
              }`}>
                <div className="flex flex-col items-center">
                  <Truck className="w-5 h-5 text-[#e51b24] mb-1" />
                  <span className="text-[11px] font-bold">Free Shipping</span>
                  <span className="text-[10px] text-gray-500">Across India</span>
                </div>
                <div className="flex flex-col items-center border-x border-gray-200 dark:border-gray-800 px-2">
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

          {/* Tabbed Product Details Section (Description, Specifications, Compatibility, Installation, Delivery) */}
          <div className="mt-16 sm:mt-24">
            
            {/* Tabs Header */}
            <div className={`flex border-b overflow-x-auto gap-8 ${
              isLight ? 'border-gray-200' : 'border-[#1f2533]'
            }`}>
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
                      : isLight
                      ? 'text-gray-500 hover:text-gray-900'
                      : 'text-gray-400 hover:text-white'
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
                <div className={`space-y-4 max-w-4xl text-sm leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <p>{product.description}</p>
                  <h4 className={`text-base font-bold uppercase tracking-wide pt-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {product.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e51b24] mt-2 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="max-w-3xl">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <tbody>
                      {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={`border-b ${
                            isLight
                              ? idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              : idx % 2 === 0 ? 'bg-[#12151c]' : 'bg-transparent'
                          } ${isLight ? 'border-gray-200' : 'border-[#1f2533]'}`}
                        >
                          <td className="py-3 px-4 font-bold text-gray-400 w-1/3 uppercase tracking-wider text-xs">
                            {key}
                          </td>
                          <td className={`py-3 px-4 font-medium ${isLight ? 'text-gray-800' : 'text-white'}`}>
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'compatibility' && (
                <div className="max-w-3xl space-y-4">
                  <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    This accessory is precision designed and test-fitted on the following vehicle chassis:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.compatibility_models?.map((model) => (
                      <div
                        key={model}
                        className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs font-semibold ${
                          isLight
                            ? 'bg-gray-50 border-gray-200 text-gray-800'
                            : 'bg-[#12151c] border-[#222838] text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#e51b24]" />
                        <span>{model}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'installation' && (
                <div className={`max-w-3xl text-sm leading-relaxed space-y-3 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <p>{product.installation_info || 'Comprehensive 1:1 scale cutting template and all mounting brackets are included in the packaging.'}</p>
                  <p className="text-xs text-gray-500">
                    Need professional fitment? WhatsApp our technical team to locate a Bull Gear verified fitment workshop near your city.
                  </p>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className={`max-w-3xl text-sm leading-relaxed space-y-3 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <p>
                    <strong>Dispatches within 24–48 hours:</strong> All orders are carefully packed in wooden/heavy-corrugated protective crates to prevent transit damages.
                  </p>
                  <p>
                    <strong>Returns:</strong> 7-day hassle-free replacement or return on undamaged items in original packaging.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* WhatsApp Direct Order Modal */}
      <WhatsAppOrderModal
        product={product}
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
