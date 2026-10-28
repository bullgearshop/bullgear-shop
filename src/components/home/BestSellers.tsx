'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductCard } from '../product/ProductCard';

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  const formatBest = (list: Product[]) => {
    const best = list.filter((p) => p.is_best_seller);
    best.sort((a, b) => (a.best_seller_order ?? 99) - (b.best_seller_order ?? 99));
    if (best.length >= 6) return best.slice(0, 6);
    const others = list.filter((p) => !p.is_best_seller);
    return [...best, ...others].slice(0, 6);
  };

  // Storefront displays strictly 6 products, synchronized with admin
  const [displayProducts, setDisplayProducts] = useState<Product[]>(() => formatBest(products));

  // Listen to any updates saved from Admin Products & fetch from API
  useEffect(() => {
    // 1. Check localStorage first
    try {
      const saved = localStorage.getItem('bullgear_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDisplayProducts(formatBest(parsed));
        }
      }
    } catch {}

    // 2. Fetch fresh products from API
    const fetchLatest = () => {
      fetch('/api/products')
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            setDisplayProducts(formatBest(resData.data));
          }
        })
        .catch(() => {});
    };

    fetchLatest();

    // 3. Listen to admin updates
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('bullgear_admin_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDisplayProducts(formatBest(parsed));
            return;
          }
        }
      } catch {}
      fetchLatest();
    };

    window.addEventListener('bullgear_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('bullgear_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Group strictly 6 products into pages of 3 for mobile (exactly 2 pages, 2 dots)
  const pages: Product[][] = [];
  for (let i = 0; i < displayProducts.length; i += 3) {
    pages.push(displayProducts.slice(i, i + 3));
  }

  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const currentIndexRef = useRef(0);
  const isInteracting = useRef(false);
  const isVisibleRef = useRef(false);

  const scrollToPage = (pageIndex: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const targetPage = el.children[pageIndex] as HTMLElement | undefined;
    const target = targetPage ? targetPage.offsetLeft : pageIndex * el.clientWidth;
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
    const index = Math.min(Math.max(0, Math.round(el.scrollLeft / el.clientWidth)), pages.length - 1);
    if (index !== currentIndexRef.current) {
      currentIndexRef.current = index;
      setActiveDot(index);
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

  // Auto-move on mobile every 4 seconds strictly in sequential order (Page 1 -> Page 2 -> Page 1...)
  useEffect(() => {
    if (pages.length <= 1) return;

    const interval = setInterval(() => {
      // Pause if not visible or user is hovering/touching
      if (!isVisibleRef.current || isInteracting.current) return;

      const next = (currentIndexRef.current + 1) % pages.length;
      scrollToPage(next);
    }, 4000);

    return () => clearInterval(interval);
  }, [pages.length]);

  return (
    <section ref={sectionRef} className="py-10 sm:py-16 bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8 px-1 sm:px-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-5 sm:w-2.5 sm:h-6 bg-[#e51b24] rounded-xs" />
            <h2 className="text-[16px] sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-wide uppercase leading-tight">
              Shop Our Best Sellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#e51b24] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile View: 3 Products in One Row, exactly 6 items (2 pages of 3), moves strictly 1 -> 2 -> 1 */}
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
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none py-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {pages.map((pageGroup, pageIdx) => (
              <div
                key={`page-${pageIdx}`}
                className="w-full flex-shrink-0 snap-start grid grid-cols-3 gap-1.5"
              >
                {pageGroup.map((product) => (
                  <div key={product.id} className="min-w-0">
                    <ProductCard product={product} variant="compact" showWhatsAppButton={false} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Pagination Dots for Best Sellers (1 dot per 3 items page = 2 dots total for 6 products) */}
          {pages.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
              {pages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToPage(i)}
                  aria-label={`Go to best sellers page ${i + 1}`}
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

        {/* Desktop View: Exactly 6 Compact Square Cards in 1 Row (completely unchanged) */}
        <div className="hidden md:grid md:grid-cols-6 gap-3.5">
          {displayProducts.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              showWhatsAppButton={false}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
