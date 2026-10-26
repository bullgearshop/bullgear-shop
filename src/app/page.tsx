import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategorySection } from '@/components/home/CategorySection';
import { AdventureBanner } from '@/components/home/AdventureBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CustomerGallery } from '@/components/home/CustomerGallery';
import { BestSellers } from '@/components/home/BestSellers';
import { Newsletter } from '@/components/home/Newsletter';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { getBanners, getCategories, getProducts } from '@/lib/db';

export const metadata = {
  title: 'Bull Gear | Premium Off-Road Accessories & 4x4 Armor',
  description: 'Engineered for extreme off-road adventures. Premium 4x4 snorkels, heavy-duty roof racks, LED light bars, bumpers, and recovery gear in India.',
  openGraph: {
    title: 'Bull Gear | Premium Off-Road Accessories',
    description: 'Ride. Chase. Conquer. Premium 4x4 vehicle armor and overland expedition accessories.',
    images: ['/images/hero-suv.jpg'],
  },
};

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts(),
  ]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-[#e51b24] selection:text-white">
      {/* Light Theme Header with Black Brand Text */}
      <Navbar theme="light" />

      <main className="flex-1">
        {/* Hero Banner with Slides, Indicators, and Showcase Previews */}
        <HeroBanner banners={banners} />

        {/* Shop By Category */}
        <CategorySection categories={categories} />

        {/* Secondary Adventure Banner with Video Trigger */}
        <AdventureBanner />

        {/* Featured Products with Add to Cart and WhatsApp Order */}
        <FeaturedProducts products={products} />

        {/* Real Adventures Real People */}
        <CustomerGallery />

        {/* Shop Our Best Sellers */}
        <BestSellers products={products} />

        {/* Join The Adventure Newsletter */}
        <Newsletter />
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Brand Footer */}
      <Footer />
    </div>
  );
}
