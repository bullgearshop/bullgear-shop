'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, PhoneCall } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useCart } from '@/lib/cart-context';
import { DEFAULT_PRODUCTS } from '@/lib/db';
import { Product } from '@/lib/types';
import { formatRupees } from '@/lib/whatsapp';

interface NavbarProps {
  theme?: 'dark' | 'light';
}

export function Navbar({ theme = 'light' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const [productsList, setProductsList] = useState<Product[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bullgear_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProductsList(parsed);
        }
      }
    } catch {}

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

  // Live search suggestions
  const filteredSuggestions = searchQuery.trim().length >= 1
    ? productsList.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.compatibility_models?.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : productsList.slice(0, 5);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      setDesktopSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProduct = (slug: string) => {
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    setDesktopSearchOpen(false);
    setSearchQuery('');
    router.push(`/products/${slug}`);
  };

  // Keyboard shortcut (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setDesktopSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setDesktopSearchOpen(false);
        setShowSuggestions(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when desktop search modal opens
  useEffect(() => {
    if (desktopSearchOpen) {
      setTimeout(() => {
        desktopSearchInputRef.current?.focus();
      }, 50);
    }
  }, [desktopSearchOpen]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Red announcement bar removed as requested */}

      <header
        className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
          isLight
            ? 'bg-white text-gray-900 border-gray-200 shadow-xs'
            : 'bg-[#0a0c10]/95 backdrop-blur-md text-white border-[#1f2533]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Left: Brand Logo */}
            <div className="flex items-center">
              <Logo variant={isLight ? 'black' : 'white'} size="md" />
            </div>

            {/* Middle: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium tracking-wider uppercase transition-colors py-1 ${
                      isActive
                        ? 'text-[#e51b24] font-semibold border-b-2 border-[#e51b24]'
                        : isLight
                        ? 'text-gray-700 hover:text-[#e51b24]'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search & Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Desktop Search Button Trigger (Opens Center-Top Pop-up Modal) */}
              <button
                type="button"
                onClick={() => setDesktopSearchOpen(true)}
                className={`hidden md:flex items-center justify-between gap-3 w-52 lg:w-72 px-4 py-2 rounded-full text-xs transition-all border cursor-pointer hover:border-[#e51b24] shadow-2xs group ${
                  isLight
                    ? 'bg-gray-100/90 text-gray-500 border-gray-300 hover:bg-gray-100'
                    : 'bg-[#141720] text-gray-400 border-[#262c3d] hover:border-gray-500'
                }`}
                aria-label="Open search dialog"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#e51b24] transition-colors" />
                  <span className="truncate">{searchQuery.trim() ? searchQuery : 'Search products...'}</span>
                </div>
                <kbd className="text-[10px] bg-gray-200/80 text-gray-600 px-1.5 py-0.5 rounded font-mono font-semibold shrink-0">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search Toggle (Opens Center-Top Pop-up Modal) */}
              <button
                type="button"
                onClick={() => setDesktopSearchOpen(true)}
                className={`md:hidden p-2 rounded-full cursor-pointer ${
                  isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-[#161a23]'
                }`}
                aria-label="Open search dialog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Icon with Live Badge */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full transition-transform active:scale-95 bg-[#e51b24]/10 hover:bg-[#e51b24]/20 text-[#e51b24] cursor-pointer"
                aria-label="View shopping cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#e51b24]" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e51b24] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0c10]">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Mobile 3-line Hamburger Menu Button placed on the RIGHT side */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-[#161a23]'
                }`}
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer: Animates in from the RIGHT side */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content sliding in from right */}
            <div className="relative w-4/5 max-w-sm bg-[#0e1117] border-l border-[#222838] h-full flex flex-col p-6 z-10 text-white animate-in slide-in-from-right duration-300 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#1f2533]">
                <Logo variant="white" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-semibold tracking-wide hover:text-[#e51b24] transition-colors py-1 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <span className="text-gray-500 text-sm">→</span>
                  </Link>
                ))}
              </nav>

              {/* Categories Quick Links */}
              <div className="pt-4 border-t border-[#1f2533]">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-3">
                  Shop Categories
                </span>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <Link
                    href="/categories/snorkels"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded bg-[#161a24] hover:bg-[#e51b24]/20 hover:text-white transition"
                  >
                    Snorkels
                  </Link>
                  <Link
                    href="/categories/roof-racks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded bg-[#161a24] hover:bg-[#e51b24]/20 hover:text-white transition"
                  >
                    Roof Racks
                  </Link>
                  <Link
                    href="/categories/led-light-bars"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded bg-[#161a24] hover:bg-[#e51b24]/20 hover:text-white transition"
                  >
                    LED Lights
                  </Link>
                  <Link
                    href="/categories/bumpers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded bg-[#161a24] hover:bg-[#e51b24]/20 hover:text-white transition"
                  >
                    Bumpers
                  </Link>
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="mt-auto pt-6 border-t border-[#1f2533] text-xs text-gray-400 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <PhoneCall className="w-4 h-4 text-[#e51b24]" />
                  <span>Helpline: +91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Center-Top Pop-up Search Modal (Mobile & Desktop Responsive) */}
      {desktopSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-20 px-2.5 sm:px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDesktopSearchOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 flex flex-col max-h-[88vh]">
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-white">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#e51b24] shrink-0" />
              <input
                ref={desktopSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                placeholder="Search accessories, snorkels, roof racks..."
                className="w-full text-xs sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer shrink-0"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setDesktopSearchOpen(false)}
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 px-2 sm:px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 transition shrink-0 cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Popular Quick Search Tags */}
            <div className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none text-xs">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider shrink-0">Popular:</span>
              {['Snorkels', 'Roof Racks', 'LED Light Bars', 'Bumpers', 'Thar', 'Jimny'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition shrink-0 border cursor-pointer ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
                      ? 'bg-[#e51b24] text-white border-[#e51b24]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#e51b24] hover:text-[#e51b24]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Searched Products Results */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 p-1.5 sm:p-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {searchQuery.trim().length > 0 ? `Searched Products (${filteredSuggestions.length})` : 'Popular Accessories'}
              </div>
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod.slug)}
                    className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-50 border border-gray-200 shrink-0 overflow-hidden">
                      {prod.images?.[0]?.image_url ? (
                        <Image
                          src={prod.images[0].image_url}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 font-bold uppercase text-center p-1">
                          {prod.name}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {/* Category Badge - whitespace-nowrap prevents words from wrapping vertically */}
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap shrink-0">
                          {prod.category_name}
                        </span>
                        {prod.compatibility_models && prod.compatibility_models.length > 0 && (
                          <span className="text-[10px] text-gray-400 truncate min-w-0">
                            Fit: {prod.compatibility_models.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#e51b24] transition truncate mt-0.5 sm:mt-1">
                        {prod.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0 pl-1">
                      <p className="text-xs sm:text-sm font-black text-gray-900 whitespace-nowrap">
                        {formatRupees(prod.sale_price ?? prod.price)}
                      </p>
                      {prod.sale_price && (
                        <p className="text-[10px] sm:text-[11px] text-gray-400 line-through whitespace-nowrap">
                          {formatRupees(prod.price)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-gray-500">
                  <p className="font-bold text-gray-800">No products matching &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for snorkels, racks, bumpers, or vehicle names.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span className="hidden sm:inline">Press <strong>Enter ↵</strong> to search entire catalog</span>
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="font-bold text-[#e51b24] hover:underline cursor-pointer ml-auto flex items-center gap-1 text-[11px] sm:text-xs"
              >
                <span>View all catalog results</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
