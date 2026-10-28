'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/types';

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [activeBanners, setActiveBanners] = useState<Banner[]>(banners);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 1. Check local storage
    try {
      const saved = localStorage.getItem('bullgear_admin_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveBanners(parsed.filter((b: Banner) => b.is_active));
        }
      }
    } catch {}

    // 2. Fetch live banners from API
    fetch('/api/banners')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const active = resData.data.filter((b: Banner) => b.is_active);
          setActiveBanners(active);
          try {
            localStorage.setItem('bullgear_admin_banners', JSON.stringify(resData.data));
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Listen for admin banner updates
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('bullgear_admin_banners');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActiveBanners(parsed.filter((b: Banner) => b.is_active));
          }
        }
      } catch {}
    };
    window.addEventListener('bullgear_banners_updated', handleUpdate);
    return () => window.removeEventListener('bullgear_banners_updated', handleUpdate);
  }, []);

  // Auto rotate slides
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[currentIndex] || activeBanners[0] || {
    id: 'ban-default',
    title: 'ENGINEERED FOR',
    highlight_text: 'REAL ADVENTURES',
    subtitle: 'Premium 4x4 accessories designed for offroaders, travellers, overland and adventure seekers.',
    desktop_image_url: '',
    mobile_image_url: '',
    button_label: 'Shop Products',
    button_link: '/shop',
    display_order: 1,
    is_active: true,
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="relative w-full min-h-[540px] sm:min-h-[640px] lg:min-h-[720px] bg-[#0a0c10] flex items-end sm:items-center overflow-hidden border-b border-gray-200">
      {/* Background Hero Image with atmospheric overlays (16:9 on Desktop, 9:16 on Mobile) */}
      <div className="absolute inset-0 z-0">
        {/* Mobile Background Image (9:16 Portrait) */}
        {(currentBanner.mobile_image_url || currentBanner.desktop_image_url) && (
          <div className="block sm:hidden absolute inset-0">
            <Image
              src={currentBanner.mobile_image_url || currentBanner.desktop_image_url!}
              alt={currentBanner.title}
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        )}

        {/* Desktop Background Image (16:9 Landscape) */}
        {currentBanner.desktop_image_url && (
          <div className="hidden sm:block absolute inset-0">
            <Image
              src={currentBanner.desktop_image_url}
              alt={currentBanner.title}
              fill
              priority
              className="object-cover object-center lg:object-right transition-all duration-700 ease-out transform scale-100"
            />
          </div>
        )}

        {/* Black fade overlay removed per user request - image is crisp and clear */}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28 sm:py-20 lg:py-24 w-full">
        {/* Left Column: Headline and Call-to-Action (right box removed for expansive layout) */}
        <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start">
          
          {/* Pill Tag without blinking dot */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#e51b24]/20 border border-[#e51b24]/40 text-[#ff404a] text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6">
            <span>OFF-ROAD ACCESSORIES</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-5 uppercase">
            {currentBanner.title} <br />
            <span className="text-[#e51b24]">
              {currentBanner.highlight_text}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-xl leading-relaxed mb-8">
            {currentBanner.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={currentBanner.button_link || '/shop'}
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-md transition-all duration-200 transform hover:translate-x-0.5 shadow-md shadow-[#e51b24]/30"
            >
              <span>{currentBanner.button_label || 'Shop Products'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link
              href="/categories/snorkels"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 bg-[#141720]/80 hover:bg-[#1a202c] text-gray-200 font-semibold text-xs sm:text-sm rounded-md border border-[#2a3142] transition-colors"
            >
              Explore Snorkels
            </Link>
          </div>

          {/* Bottom Left Slide Number Selectors (Only plain numbers 01, 02 - no box, no dot, no arrows) */}
          <div className="mt-10 sm:mt-14 flex items-center gap-5">
            {banners.map((b, idx) => {
              const numStr = String(idx + 1).padStart(2, '0');
              const isActive = currentIndex === idx;
              return (
                <button
                  key={b.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${numStr}`}
                  className={`font-mono font-bold text-base sm:text-lg tracking-wider transition-colors cursor-pointer ${
                    isActive ? 'text-[#e51b24]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {numStr}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
