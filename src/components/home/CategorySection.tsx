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
    // Check localStorage first
    try {
      const saved = localStorage.getItem('bullgear_admin_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveCategories(parsed);
        }
      }
    } catch {}

    // Fetch dynamic categories from API
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setActiveCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter by ticked (is_featured === true). If fewer than 4 are ticked, pick the ticked then fill with active.
  const featured = activeCategories.filter((c) => c.is_featured);
  const displayCategories = (
    featured.length > 0
      ? featured
      : activeCategories
  ).slice(0, 4);

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

  // Track visibility with ref to prevent re-renders
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

  // Auto-move on mobile every 4 seconds when visible
  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
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

        {/* Mobile View: 2 Cards Visible at a time (4 total, exactly 2 dots) */}
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
                  className="group relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-xs block bg-white"
                >
                  {/* Category Image: Full height matching desktop so image is clearly visible and not cropped */}
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-contain p-3 pb-14 group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-50" />
                  )}

                  {/* Clean text at the bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-2 bg-gradient-to-t from-white via-white/90 to-transparent pt-6">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-extrabold text-black uppercase tracking-wide group-hover:text-[#e51b24] transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-1 leading-snug">
                        {cat.description || 'Explore collection'}
                      </p>
                    </div>

                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/90 group-hover:bg-[#e51b24] border border-black/10 flex items-center justify-center text-white transition-colors duration-200 shadow-md">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Dots (Exactly 2 dots for 4 categories) */}
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

        {/* Desktop View: Exactly 4 Cards in One Row */}
        <div className="hidden md:grid md:grid-cols-4 gap-5">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative h-64 lg:h-72 w-full rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 block bg-white"
            >
              {/* Category Image filling card */}
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-contain p-4 pb-16 group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-50" />
              )}

              {/* Text on top of image */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-3 bg-gradient-to-t from-white via-white/90 to-transparent pt-8">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-black uppercase tracking-wide group-hover:text-[#e51b24] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-1 leading-snug font-normal">
                    {cat.description || 'Explore collection'}
                  </p>
                </div>

                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black/90 group-hover:bg-[#e51b24] border border-black/10 flex items-center justify-center text-white transition-colors duration-200 shadow-md">
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
