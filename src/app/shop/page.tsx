import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Flame, SlidersHorizontal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shop All 4x4 Off-Road Accessories & Armor | Bull Gear',
  description: 'Explore the complete range of Bull Gear off-road accessories: snorkels, roof racks, LED lights, bumpers, bull bars, recovery gear, and tyres.',
};

interface ShopPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q, category } = await searchParams;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  let filtered = allProducts;
  if (category) {
    filtered = filtered.filter((p) => p.category_slug === category);
  }
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category_name?.toLowerCase().includes(query) ||
        p.compatibility_models?.some((m) => m.toLowerCase().includes(query))
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar theme="light" />

      <main className="flex-1 pb-20">
        {/* Shop Header */}
        <div className="py-12 sm:py-16 bg-[#f8fafc] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e51b24] mb-2">
              <Flame className="w-4 h-4" />
              <span>Full Armory Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-gray-900">
              Shop All Products
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mt-2 leading-relaxed">
              Industrial-grade protection and overlanding systems tested in the harshest conditions.
            </p>

            {/* Category Filter Pills */}
            <div className="pt-5 pb-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <Link
                  href="/shop"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition border ${
                    !category
                      ? 'bg-[#e51b24] text-white border-[#e51b24]'
                      : 'bg-white text-gray-700 border-gray-200 hover:text-black hover:border-gray-400'
                  }`}
                >
                  All Gear ({allProducts.length})
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition border ${
                      category === cat.slug
                        ? 'bg-[#e51b24] text-white border-[#e51b24]'
                        : 'bg-white text-gray-700 border-gray-200 hover:text-black hover:border-gray-400'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-gray-200 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#e51b24]" />
              <span>
                Category: <strong className="text-gray-900">{category ? categories.find((c) => c.slug === category)?.name || category : 'All Categories'}</strong>
              </span>
              <span>•</span>
              <span>
                Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                {q ? ` for "${q}"` : ''}
              </span>
            </div>
            {(category || q) && (
              <Link href="/shop" className="text-[#e51b24] hover:underline font-semibold">
                Clear all filters
              </Link>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-bold text-gray-800">No matching accessories found</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for &quot;snorkel&quot;, &quot;roof rack&quot;, &quot;light bar&quot;, or vehicle model &quot;Thar&quot;.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-block px-6 py-2.5 bg-[#e51b24] text-white text-xs font-bold rounded-lg uppercase"
              >
                Reset Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-6 sm:pt-8">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
