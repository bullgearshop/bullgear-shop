'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const [activeCategories, setActiveCategories] = useState<Category[]>(categories);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bullgear_admin_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveCategories(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Only 4 categories displayed (2 per page = exactly 2 dots)
  const displayCategories = activeCategories.slice(0, 4);

  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const currentIndexRef = useRef(0);
  const isInteracting = useRef(false);
  const isVisibleRef = useRef(false);

  // 4 categories, 2 per page on mobile => exactly 2 dots
  const totalPages = Math.ceil(displayCategories.length / 2);

  const scrollToPage = (pageIndex: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const targetCard = el.children[pageIndex * 2] as HTMLElement | undefined;
    const target = targetCard ? targetCard.offsetLeft : pageIndex * el.clientWidth;
    el.scrollTo({
      left: target,
      behavior: 'smooth',
    });
    currentIndexRef.current = pageIndex;
    setActiveDot(pageIndex);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth <= 0) return;
    const page = Math.min(Math.max(0, Math.round(el.scrollLeft / el.clientWidth)), totalPages - 1);
    if (page !== currentIndexRef.current) {
      currentIndexRef.current = page;
      setActiveDot(page);
    }
  };

  // Track visibility with ref to completely prevent re-renders, jitter, and shuttering
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-move on mobile every 4 seconds strictly when visible in viewport
  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      // Pause if not visible or user is hovering/touching
      if (!isVisibleRef.current || isInteracting.current) return;

      const next = (currentIndexRef.current + 1) % totalPages;
      scrollToPage(next);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalPages]);

  return (
    <section ref={sectionRef} className="py-8 sm:py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-1.5 sm:w-2.5 h-4 sm:h-5 bg-[#e51b24] rounded-xs flex-shrink-0" />
            <h2 className="text-[17px] sm:text-2xl font-extrabold text-gray-900 tracking-wide uppercase leading-tight">
              Shop By Category
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#e51b24] transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>View All</span>
            <span className="text-[#e51b24] group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* Mobile View: 2 Cards Visible at a time (4 total, 2 dots) */}
        <div
          className="md:hidden"
          onMouseEnter={() => { isInteracting.current = true; }}
          onMouseLeave={() => { isInteracting.current = false; }}
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={() => { isInteracting.current = true; }}
            onTouchEnd={() => {
              setTimeout(() => { isInteracting.current = false; }, 3500);
            }}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {displayCategories.map((cat) => (
              <div key={cat.id} className="w-[calc(50%-6px)] flex-shrink-0 snap-start">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group relative aspect-[16/11] sm:aspect-auto sm:h-64 lg:h-72 w-full rounded-lg overflow-hidden border border-gray-200/90 shadow-xs block bg-gray-900"
                >
                  {/* Category Image as Background */}
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
                  )}

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Bottom Text & Small Circular Arrow */}
                  <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wide group-hover:text-[#e51b24] transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-gray-300 mt-0.5 line-clamp-1 leading-snug">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/90 group-hover:bg-[#e51b24] border border-white/20 flex items-center justify-center text-white transition-colors duration-200 shadow-md">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Dots Below Carousel (Exactly 2 dots for 4 categories) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToPage(i)}
                  aria-label={`Go to category slide ${i + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    activeDot === i
                      ? 'w-5 h-1.5 bg-[#e51b24]'
                      : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop View: Exactly 4 Cards in One Row (completely unchanged) */}
        <div className="hidden md:grid md:grid-cols-4 gap-5">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative h-64 lg:h-72 w-full rounded-lg overflow-hidden border border-gray-200/90 shadow-xs hover:shadow-md transition-all duration-300 block bg-gray-900"
            >
              {/* Category Image as Background */}
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
              )}

              {/* Subtle Dark Gradient Overlay at Bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Bottom Text & Small Circular Black Arrow */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-wide group-hover:text-[#e51b24] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5 line-clamp-1 leading-snug font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black/90 group-hover:bg-[#e51b24] border border-white/20 flex items-center justify-center text-white transition-colors duration-200 shadow-md">
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
