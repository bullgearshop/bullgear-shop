import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flame } from 'lucide-react';
import { Category } from '@/lib/types';

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  // Show featured 4 categories as seen on reference layout
  const displayCategories = categories.slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-[#f8fafc] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#e51b24] rounded-sm" />
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#e51b24]" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-wide uppercase">
                Shop By Category
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

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#e51b24] transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl"
            >
              {/* Top info */}
              <div className="z-10">
                <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-[#e51b24] transition-colors uppercase tracking-wide">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Product accessory image */}
              <div className="relative w-full h-44 my-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-contain group-hover:scale-108 transition-transform duration-500 ease-out p-2"
                />
              </div>

              {/* Bottom bar with action */}
              <div className="z-10 flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 uppercase tracking-wider">
                  View Collection
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#e51b24] flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
