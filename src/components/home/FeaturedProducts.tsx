'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductCard } from '../product/ProductCard';

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const formatFeatured = (list: Product[]) => {
    const featured = list.filter((p) => p.is_featured);
    featured.sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99));
    if (featured.length >= 4) return featured.slice(0, 4);
    const others = list.filter((p) => !p.is_featured);
    return [...featured, ...others].slice(0, 4);
  };

  const [activeProducts, setActiveProducts] = useState<Product[]>(() => formatFeatured(products));

  useEffect(() => {
    // 1. Check localStorage first
    try {
      const saved = localStorage.getItem('bullgear_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveProducts(formatFeatured(parsed));
        }
      }
    } catch {}

    // 2. Fetch fresh products from API
    const fetchLatest = () => {
      fetch('/api/products')
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            setActiveProducts(formatFeatured(resData.data));
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
            setActiveProducts(formatFeatured(parsed));
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

  const displayProducts = activeProducts.slice(0, 4);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeDot, setActiveDot] = useState(0);
  const currentIndexRef = useRef(0);
  const isInteracting = useRef(false);
  const isVisibleRef = useRef(false);

  const scrollToItem = (targetIndex: number) => {
    const container = scrollRef.current;
    const card = cardRefs.current[targetIndex];
    if (!container || !card) return;

    // Calculate exact scrollLeft to place this card dead-center
    const targetScroll = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
    currentIndexRef.current = targetIndex;
    setActiveDot(targetIndex);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== currentIndexRef.current) {
      currentIndexRef.current = closestIndex;
      setActiveDot(closestIndex);
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

  // Auto-move on mobile every 4 seconds strictly in sequential order (1 -> 2 -> 3 -> 4 -> 1)
  useEffect(() => {
    if (displayProducts.length <= 1) return;

    const interval = setInterval(() => {
      // Pause if not visible or user is hovering/touching
      if (!isVisibleRef.current || isInteracting.current) return;

      const next = (currentIndexRef.current + 1) % displayProducts.length;
      scrollToItem(next);
    }, 4000);

    return () => clearInterval(interval);
  }, [displayProducts.length]);

  return (
    <section ref={sectionRef} className="py-10 sm:py-16 bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-5 sm:w-2.5 sm:h-6 bg-[#e51b24] rounded-xs" />
            <h2 className="text-[17px] sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-wide uppercase leading-tight">
              Featured Products
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

        {/* Mobile View: Balanced Centered Carousel with peek on both sides, moves strictly 1, 2, 3, 4 */}
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
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-2 -mx-4 px-[10vw]"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {displayProducts.map((product, idx) => (
              <div
                key={product.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className="w-[80vw] max-w-[310px] flex-shrink-0 snap-center"
              >
                <ProductCard product={product} variant="standard" />
              </div>
            ))}
          </div>

          {/* Pagination Dots Below Carousel (Moves strictly in order) */}
          {displayProducts.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
              {displayProducts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToItem(i)}
                  aria-label={`Go to featured product ${i + 1}`}
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

        {/* Desktop View: Clean 4 Products Grid (completely unchanged) */}
        <div className="hidden md:grid md:grid-cols-4 gap-5">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="standard" />
          ))}
        </div>

      </div>
    </section>
  );
}
