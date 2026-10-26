import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductCard } from '../product/ProductCard';

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header without sparkles icon */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#e51b24] rounded-sm" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-wide uppercase">
              Featured Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#e51b24] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
