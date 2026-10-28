'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, MessageSquare, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatRupees } from '@/lib/whatsapp';
import { useCart } from '@/lib/cart-context';
import { WhatsAppOrderModal } from './WhatsAppOrderModal';

interface ProductCardProps {
  product: Product;
  variant?: 'standard' | 'compact';
  showWhatsAppButton?: boolean;
}

export function ProductCard({
  product,
  variant = 'standard',
  showWhatsAppButton,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const primaryImage = product.images?.[0]?.image_url;
  const displayPrice = product.sale_price ?? product.price;

  const stockQty = typeof product.stock_quantity === 'number' ? product.stock_quantity : parseInt(product.stock_quantity as any, 10);
  const isOutOfStock = product.stock_status === 'out_of_stock' || (!isNaN(stockQty) && stockQty <= 0);
  const isLimitedStock = !isOutOfStock && (product.stock_status === 'limited_stock' || (!isNaN(stockQty) && stockQty > 0 && stockQty <= (product.low_stock_threshold || 5)));

  const isCompact = variant === 'compact';
  const shouldShowWhatsApp = showWhatsAppButton !== undefined ? showWhatsAppButton : !isCompact;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsWhatsAppOpen(true);
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-lg bg-white border border-gray-200/90 hover:border-gray-300 hover:shadow-md transition-all duration-300 overflow-hidden shadow-xs h-full">
        {/* Stock Badges */}
        {isOutOfStock && (
          <span className="absolute top-2 left-2 z-20 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#e51b24] text-white shadow-xs">
            Out of Stock
          </span>
        )}
        {isLimitedStock && (
          <span className="absolute top-2 left-2 z-20 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            Limited Stock {!isNaN(stockQty) && stockQty > 0 ? `(${stockQty} left)` : ''}
          </span>
        )}

        {/* Card Body Link to Product Detail */}
        <Link
          href={`/products/${product.slug}`}
          className="block flex-1 flex flex-col justify-between"
        >
          {/* Product Image: 4:3 natural landscape aspect ratio on mobile to prevent cropping without gaps, desktop unchanged */}
          <div
            className={`relative w-full overflow-hidden bg-gray-100 ${
              isCompact ? 'aspect-[4/3] sm:aspect-auto sm:h-36' : 'aspect-[4/3] sm:aspect-auto sm:h-52'
            }`}
          >
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-3 text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {product.name}
                </span>
              </div>
            )}
          </div>

          {/* Product Meta Section: Padding strictly below the image */}
          <div className={`flex-1 flex flex-col justify-between ${isCompact ? 'p-1.5 sm:p-2.5' : 'p-3 sm:p-3.5'}`}>
            <h3
              className={`font-bold text-gray-900 group-hover:text-[#e51b24] transition-colors line-clamp-1 leading-snug ${
                isCompact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
              }`}
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Price on Left, Cart Icon on Right */}
            <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-1">
              <div className="min-w-0">
                <span
                  className={`font-black text-gray-900 ${
                    isCompact ? 'text-[11px] sm:text-sm' : 'text-sm sm:text-base'
                  }`}
                >
                  {formatRupees(displayPrice)}
                </span>
                {product.sale_price && (
                  <span className="ml-1 text-[9px] sm:text-[10px] text-gray-400 line-through">
                    {formatRupees(product.price)}
                  </span>
                )}
              </div>

              {/* Shopping Cart Icon Button matching Image 2 */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
                aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
                className={`rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isCompact ? 'p-1 sm:p-2' : 'p-1.5 sm:p-2'
                } ${
                  isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {isAdded ? (
                  <Check className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-emerald-600`} />
                ) : (
                  <ShoppingCart className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-900`} />
                )}
              </button>
            </div>
          </div>
        </Link>

        {/* Bottom WhatsApp Button or Out of Stock Red Button */}
        {shouldShowWhatsApp && (
          <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full h-8 sm:h-9 px-2 rounded-md bg-[#e51b24] text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-not-allowed whitespace-nowrap overflow-hidden select-none"
                aria-label="Out of Stock"
              >
                <span>OUT OF STOCK</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full h-8 sm:h-9 px-2 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-98 whitespace-nowrap overflow-hidden"
                aria-label="Order via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white flex-shrink-0" />
                <span className="truncate">ORDER VIA WHATSAPP</span>
              </button>
            )}
          </div>
        )}
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
