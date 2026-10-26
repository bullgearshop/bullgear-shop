import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductCard } from '../product/ProductCard';

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  // Filter best sellers or take top products
  const bestSellerProducts = products.filter((p) => p.is_best_seller).slice(0, 6);

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#e51b24] rounded-sm" />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#e51b24]" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-wide uppercase">
                Shop Our Best Sellers
              </h2>
            </div>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#e51b24] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 6 Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
