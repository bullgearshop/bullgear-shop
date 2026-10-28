'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Check, ArrowUpDown, ChevronDown, RotateCcw } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';

interface ShopCatalogProps {
  categories: Category[];
  allProducts: Product[];
  initialCategory?: string;
  initialSearch?: string;
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'name_asc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured & Best Matches' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'name_asc', label: 'Product Name: A to Z' },
];

export function ShopCatalog({
  categories,
  allProducts,
  initialCategory = '',
  initialSearch = '',
}: ShopCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Products state (hydrated with live updates from admin/API)
  const [productsList, setProductsList] = useState<Product[]>(allProducts);

  // Sync with live API and localStorage so admin uploaded images appear immediately
  useEffect(() => {
    // 1. Check localStorage first for instant display of recent admin edits
    try {
      const saved = localStorage.getItem('bullgear_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProductsList(parsed);
        }
      }
    } catch {}

    // 2. Fetch latest from API
    const fetchLatest = () => {
      fetch('/api/products')
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            setProductsList(resData.data);
          }
        })
        .catch(() => {});
    };

    fetchLatest();

    // 3. Listen to live updates from admin edits
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('bullgear_admin_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProductsList(parsed);
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

  // Active filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const sort = (searchParams.get('sort') as SortOption) || 'featured';
    const q = searchParams.get('q') || '';
    setSelectedCategory(cat);
    if (SORT_OPTIONS.some((s) => s.id === sort)) {
      setSortBy(sort);
    }
    setSearchQuery(q);
  }, [searchParams]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of productsList) {
      if (p.category_slug) {
        counts[p.category_slug] = (counts[p.category_slug] || 0) + 1;
      }
    }
    return counts;
  }, [productsList]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category_slug === selectedCategory || p.category_id === selectedCategory
      );
    }

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.compatibility_models?.some((m: string) => m.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        break;
      case 'newest':
        result.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.is_best_seller && !b.is_best_seller) return -1;
          if (!a.is_best_seller && b.is_best_seller) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [productsList, selectedCategory, searchQuery, sortBy]);

  const updateUrl = (cat: string, sort: SortOption) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (sort && sort !== 'featured') params.set('sort', sort);
    if (searchQuery) params.set('q', searchQuery);
    const queryStr = params.toString();
    router.replace(`/shop${queryStr ? `?${queryStr}` : ''}`, { scroll: false });
  };

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    updateUrl(slug, sortBy);
  };

  const handleSelectSort = (sort: SortOption) => {
    setSortBy(sort);
    updateUrl(selectedCategory, sort);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSortBy('featured');
    setSearchQuery('');
    router.replace('/shop', { scroll: false });
  };

  const currentCategoryName = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory
    : 'All Categories';

  const activeFilterCount = (selectedCategory ? 1 : 0) + (sortBy !== 'featured' ? 1 : 0);

  return (
    <div>
      {/* Category Navigation: Clean Modern Mobile Filter Button & Desktop Category Pills */}
      <div className="pt-3 pb-1">
        {/* Modern Clean Mobile Filter Button (Mobile Screen Only) */}
        <div className="flex sm:hidden items-center justify-between gap-2 pb-2">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-full text-xs font-semibold text-gray-800 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#e51b24]" />
            <span>Filter & Sort</span>
            {selectedCategory && (
              <span className="text-[#e51b24] font-bold text-[11px] truncate max-w-[120px]">
                : {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {(selectedCategory || sortBy !== 'featured') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-[#e51b24] hover:underline px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills - Visible ONLY on Desktop (sm:flex), completely hidden on mobile so it doesn't show duplicate categories */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectCategory('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition border cursor-pointer ${
              !selectedCategory
                ? 'bg-[#e51b24] text-white border-[#e51b24]'
                : 'bg-white text-gray-700 border-gray-200 hover:text-black hover:border-gray-400'
            }`}
          >
            All Gear ({allProducts.length})
          </button>
          {categories.map((cat) => {
            const count = categoryCounts[cat.slug] || 0;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition border cursor-pointer ${
                  isSelected
                    ? 'bg-[#e51b24] text-white border-[#e51b24]'
                    : 'bg-white text-gray-700 border-gray-200 hover:text-black hover:border-gray-400'
                }`}
              >
                {cat.name} {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Status Bar + Desktop Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-gray-200 text-xs text-gray-600 mt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#e51b24]" />
          <span>
            Category: <strong className="text-gray-900">{currentCategoryName}</strong>
          </span>
          <span>•</span>
          <span>
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {searchQuery ? ` for "${searchQuery}"` : ''}
          </span>
          {sortBy !== 'featured' && (
            <>
              <span>•</span>
              <span className="text-gray-900 font-semibold">
                Sorted by: {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Sort Dropdown */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-gray-500 font-semibold uppercase text-[11px]">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSelectSort(e.target.value as SortOption)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs font-semibold focus:outline-none focus:border-[#e51b24] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {(selectedCategory || sortBy !== 'featured' || searchQuery) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[#e51b24] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-bold text-gray-800">No matching accessories found</p>
          <p className="text-xs text-gray-500 mt-1">
            Try resetting your filters or browsing all armory gear.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-5 inline-block px-6 py-2.5 bg-[#e51b24] text-white text-xs font-bold rounded-lg uppercase cursor-pointer shadow-md"
          >
            Reset Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-6 sm:pt-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile Filter Modal / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Bottom Sheet Drawer */}
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
            {/* Handle & Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#e51b24]" />
                <h3 className="text-base font-extrabold uppercase text-gray-900 tracking-tight">
                  Filters & Sort
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {(selectedCategory || sortBy !== 'featured') && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-[#e51b24] hover:underline"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category Filter Section */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3">
                  Shop by Category
                </h4>
                <div className="space-y-1.5">
                  {/* All Products Option */}
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('')}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition border cursor-pointer ${
                      !selectedCategory
                        ? 'bg-red-50 text-[#e51b24] border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          !selectedCategory
                            ? 'border-[#e51b24] bg-[#e51b24] text-white'
                            : 'border-gray-400 bg-white'
                        }`}
                      >
                        {!selectedCategory && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>All Products (All Gear)</span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 font-bold">
                      {allProducts.length}
                    </span>
                  </button>

                  {/* Each Category */}
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.slug;
                    const count = categoryCounts[cat.slug] || 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition border cursor-pointer ${
                          isSelected
                            ? 'bg-red-50 text-[#e51b24] border-red-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#e51b24] bg-[#e51b24] text-white'
                                : 'border-gray-400 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-500 font-bold">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By Filter Section */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#e51b24]" />
                  <span>Sort Catalog By</span>
                </h4>
                <div className="space-y-1.5">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectSort(opt.id)}
                        className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition border cursor-pointer ${
                          isSelected
                            ? 'bg-red-50 text-[#e51b24] border-red-200 font-bold'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#e51b24] bg-[#e51b24] text-white'
                              : 'border-gray-400 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Button */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#e51b24]/30 cursor-pointer"
              >
                Apply Filters & Show {filteredProducts.length} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
