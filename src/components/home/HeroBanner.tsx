'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/types';

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate slides
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentIndex] || banners[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const thumbnailPreviews = [
    { title: 'Extreme Rock Crawling', img: '/images/hero-suv.jpg' },
    { title: 'Mountain Overland', img: '/images/adventure-banner.jpg' },
    { title: 'Water Forcing Snorkels', img: '/images/gallery-1.jpg' },
  ];

  return (
    <section className="relative w-full min-h-[640px] lg:min-h-[750px] bg-[#0a0c10] flex items-center overflow-hidden border-b border-gray-200">
      {/* Background Hero Image with atmospheric overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src={currentBanner.desktop_image_url || '/images/hero-suv.jpg'}
          alt={currentBanner.title}
          fill
          priority
          className="object-cover object-center lg:object-right-top transition-all duration-700 ease-out transform scale-100"
        />
        {/* Cinematic dark gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/80 to-transparent lg:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-[#0a0c10]/50" />
        {/* Subtle red atmospheric underglow */}
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#e51b24]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline and Call-to-Action */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e51b24]/20 border border-[#e51b24]/40 text-[#ff404a] text-xs font-bold tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e51b24] animate-ping" />
              <span>OFF-ROAD ACCESSORIES</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6 uppercase">
              {currentBanner.title} <br />
              <span className="text-[#e51b24] red-glow">
                {currentBanner.highlight_text}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed mb-8">
              {currentBanner.subtitle}
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={currentBanner.button_link || '/shop'}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-sm uppercase tracking-wider rounded-md transition-all duration-200 transform hover:translate-x-1 shadow-lg shadow-[#e51b24]/30"
              >
                <span>{currentBanner.button_label || 'Shop Products'}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/categories/snorkels"
                className="inline-flex items-center gap-2 px-6 py-4 bg-[#141720]/80 hover:bg-[#1a202c] text-gray-200 font-semibold text-sm rounded-md border border-[#2a3142] transition-colors"
              >
                Explore Snorkels
              </Link>
            </div>

            {/* Slide Pagination Bar */}
            <div className="mt-12 flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-[#e51b24]">
                0{currentIndex + 1}
              </span>
              <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e51b24] transition-all duration-500 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / banners.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-gray-500">
                0{banners.length}
              </span>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5 ml-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded bg-[#161a24] text-gray-300 hover:text-white hover:bg-[#e51b24] transition"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded bg-[#161a24] text-gray-300 hover:text-white hover:bg-[#e51b24] transition"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Desktop Vertical Preview Cards (matches reference layout) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-end justify-center">
            <div className="w-64 flex flex-col gap-3 p-3 rounded-xl bg-[#0c0f15]/90 border border-[#1f2533] backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between px-2 pb-1 text-xs text-gray-400">
                <span className="font-semibold uppercase tracking-wider">Adventure Showcase</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1 text-gray-400 hover:text-white"
                    aria-label="Previous preview"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-1 text-gray-400 hover:text-white"
                    aria-label="Next preview"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {thumbnailPreviews.map((item, idx) => (
                <div
                  key={item.title}
                  onClick={() => setCurrentIndex(idx % banners.length)}
                  className={`group relative h-20 rounded-lg overflow-hidden cursor-pointer border transition-all ${
                    currentIndex === idx % banners.length
                      ? 'border-[#e51b24] ring-1 ring-[#e51b24]'
                      : 'border-[#222838] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[11px] font-bold text-white leading-tight">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
