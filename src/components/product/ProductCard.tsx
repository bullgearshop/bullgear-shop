'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, MessageSquare, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatRupees } from '@/lib/whatsapp';
import { useCart } from '@/lib/cart-context';
import { WhatsAppOrderModal } from './WhatsAppOrderModal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const primaryImage = product.images?.[0]?.image_url || '/images/product-snorkel.jpg';
  const displayPrice = product.sale_price ?? product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWhatsAppOpen(true);
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-gray-200 hover:border-[#e51b24] transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl">
        
        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-gray-500 hover:text-[#e51b24] transition-colors shadow-xs"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#e51b24] text-[#e51b24]' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Stock Badge if limited */}
        {product.stock_status === 'limited_stock' && (
          <span className="absolute top-3.5 left-3.5 z-20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
            Limited Stock
          </span>
        )}

        {/* Clickable Card Link to Product Detail Page */}
        <Link href={`/products/${product.slug}`} className="block p-4 flex-1">
          {/* Image Container */}
          <div className="relative w-full h-52 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-3">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-contain p-3 group-hover:scale-108 transition-transform duration-500 ease-out"
            />
          </div>

          {/* Details */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {product.category_name || '4x4 Accessories'}
            </p>
            <h3 className="text-base font-extrabold text-gray-900 mt-1 group-hover:text-[#e51b24] transition-colors line-clamp-1">
              {product.name}
            </h3>

            {/* Price & Cart Icon */}
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-gray-900">
                  {formatRupees(displayPrice)}
                </span>
                {product.sale_price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatRupees(product.price)}
                  </span>
                )}
              </div>

              {/* Quick WhatsApp order trigger icon */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                title="Order via WhatsApp"
                className="p-1.5 rounded-full text-gray-500 hover:text-[#25D366] hover:bg-emerald-50 transition"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Link>

        {/* Bottom Add to Cart Button */}
        <div className="p-4 pt-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock_status === 'out_of_stock'}
            className={`w-full py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              product.stock_status === 'out_of_stock'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-[#e51b24] hover:bg-[#c8141d] text-white shadow-md shadow-[#e51b24]/20 hover:shadow-[#e51b24]/30'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart</span>
              </>
            ) : product.stock_status === 'out_of_stock' ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* WhatsApp Modal for Direct Ordering */}
      <WhatsAppOrderModal
        product={product}
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />
    </>
  );
}
