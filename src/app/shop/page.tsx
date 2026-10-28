import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getCategories, getProducts } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Flame } from 'lucide-react';
import { ShopCatalog } from '@/components/shop/ShopCatalog';

export const metadata: Metadata = {
  title: 'Shop All 4x4 Off-Road Accessories & Armor | Bull Gear',
  description: 'Explore the complete range of Bull Gear off-road accessories: snorkels, roof racks, LED lights, bumpers, bull bars, recovery gear, and tyres.',
};

interface ShopPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q, category } = await searchParams;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar theme="light" />

      <main className="flex-1 pb-20">
        {/* Shop Header */}
        <div className="py-10 sm:py-14 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e51b24] mb-2">
              
              <span>Full Armory Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-gray-900">
              Shop All Products
            </h1>

            {/* Interactive Shop Catalog with Mobile Filter & Sort */}
            <Suspense fallback={<div className="py-6 text-gray-400 text-xs">Loading catalog filters...</div>}>
              <ShopCatalog
                categories={categories}
                allProducts={allProducts}
                initialCategory={category}
                initialSearch={q}
              />
            </Suspense>
          </div>
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
