import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ShieldCheck, Compass, Award, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Bull Gear | The Off-Road Armor Story',
  description: 'Learn about Bull Gear - India’s premier manufacturer of high-end overland expedition gear and rugged vehicle accessories.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar theme="light" />

      <main className="flex-1 pb-20">
        {/* Hero */}
        <div className="relative py-20 sm:py-28 bg-[#f8fafc] border-b border-gray-200 overflow-hidden">
          <Image
            src="/images/adventure-banner.jpg"
            alt="About Bull Gear"
            fill
            className="object-cover opacity-15"
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e51b24] mb-3 block">
              Our Heritage & Philosophy
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight max-w-2xl text-gray-900">
              Engineered For Those Who <span className="text-[#e51b24]">Chase The Horizon</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mt-4 leading-relaxed">
              Bull Gear was born in the rugged dunes of Rajasthan and the treacherous mountain passes of the Himalayas. We build automotive armor that never compromises.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#e51b24]/10 text-[#e51b24] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900 mb-2">
                Uncompromising Durability
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                From cold-drawn structural steel to virgin UV-resistant LLDPE polymers, every Bull Gear component is built to survive extreme impacts, vibrations, and climate extremes.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#e51b24]/10 text-[#e51b24] flex items-center justify-center mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900 mb-2">
                Precision 3D Fitment
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We 3D laser-scan factory vehicle bodies (Thar, Fortuner, Hilux, Jimny, Gurkha) to ensure bolt-on precision without rattles, leaks, or body damage.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#e51b24]/10 text-[#e51b24] flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900 mb-2">
                Proven On Trail
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Before any product goes into production, it undergoes hundreds of hours of torture-testing on real expeditions, rock crawls, and deep water crossings.
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-16 p-8 sm:p-12 rounded-2xl bg-[#f8fafc] border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 uppercase">Ready to Armor Your Vehicle?</h3>
              <p className="text-sm text-gray-600 mt-1">Explore our product range or speak with our technical advisors on WhatsApp.</p>
            </div>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shrink-0 flex items-center gap-2"
            >
              <span>Explore The Gear</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
