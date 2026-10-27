import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getCategoryBySlug, getCategories, getProducts } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Flame, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Category Not Found | Bull Gear' };
  }

  return {
    title: category.seo_title || `${category.name} | Bull Gear Off-Road Accessories`,
    description: category.seo_description || category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allCategories = await getCategories();
  const products = await getProducts({ categorySlug: slug });

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar theme="light" />

      <main className="flex-1 pb-20">
        {/* Category Hero Banner */}
        <div className="relative py-14 sm:py-20 bg-[#f8fafc] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#e51b24] mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Gear</span>
            </Link>

            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#e51b24] mb-2">
              <Flame className="w-4 h-4" />
              <span>Bull Gear Collection</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-gray-900">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mt-3 leading-relaxed">
              {category.description}
            </p>

            {/* Other categories quick pill scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 scrollbar-none">
              {allCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition border ${
                    cat.slug === category.slug
                      ? 'bg-[#e51b24] text-white border-[#e51b24]'
                      : 'bg-white text-gray-600 border-gray-200 hover:text-black hover:border-gray-400'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex items-center justify-between pb-6 border-b border-gray-200 text-xs text-gray-500">
            <span>Showing {products.length} {products.length === 1 ? 'item' : 'items'} in {category.name}</span>
            <span className="text-emerald-600 font-semibold">✓ Verified Fitment Guarantee</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-lg font-bold text-gray-800">New batch arriving soon</p>
              <p className="text-xs text-gray-500">
                Contact our team via WhatsApp to pre-order or check stock dates.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block px-6 py-2.5 bg-[#e51b24] text-white text-xs font-bold rounded-lg uppercase"
              >
                Browse All Gear
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-6 sm:pt-8">
              {products.map((product) => (
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
