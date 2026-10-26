'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, Shield, PhoneCall } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useCart } from '@/lib/cart-context';

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

  const isLight = theme === 'light';

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#e51b24] text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>Free Express Shipping Across India on all orders above ₹4,999! Limited stock on Thar 2026 accessories.</span>
      </div>

      <header
        className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
          isLight
            ? 'bg-white text-gray-900 border-gray-200 shadow-sm'
            : 'bg-[#0a0c10]/95 backdrop-blur-md text-white border-[#1f2533]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Left: Mobile hamburger & Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-md ${
                  isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-[#161a23]'
                }`}
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Bull Gear Logo: Horns on left, text on the RIGHT */}
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

            {/* Right: Search, Account & Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Desktop Search Input */}
              <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className={`w-52 lg:w-64 pl-4 pr-10 py-2 rounded-full text-xs font-normal transition-all focus:outline-none focus:ring-1 focus:ring-[#e51b24] ${
                    isLight
                      ? 'bg-gray-100 text-gray-900 border border-gray-300 placeholder-gray-500'
                      : 'bg-[#141720] text-white border border-[#262c3d] placeholder-gray-400'
                  }`}
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-3 text-gray-400 hover:text-[#e51b24]"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className={`md:hidden p-2 rounded-full ${
                  isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-[#161a23]'
                }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Admin / Account Icon */}
              <Link
                href="/admin"
                className={`p-2 rounded-full transition-colors flex items-center gap-1.5 ${
                  isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-[#161a23]'
                }`}
                title="Admin Dashboard"
                aria-label="Admin Dashboard"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Icon with Live Badge */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full transition-transform active:scale-95 bg-[#e51b24]/10 hover:bg-[#e51b24]/20 text-[#e51b24]"
                aria-label="View shopping cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#e51b24]" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e51b24] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0c10]">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Mobile Search Bar Dropdown */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3 pt-1">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 4x4 gear, bumpers, snorkels..."
                  className={`w-full pl-4 pr-10 py-2.5 rounded-lg text-sm ${
                    isLight
                      ? 'bg-gray-100 text-gray-900 border border-gray-300'
                      : 'bg-[#141720] text-white border border-[#262c3d]'
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-3 text-gray-400"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-4/5 max-w-sm bg-[#0e1117] border-r border-[#222838] h-full flex flex-col p-6 z-10 text-white">
              <div className="flex items-center justify-between pb-6 border-b border-[#1f2533]">
                <Logo variant="white" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
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
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161a24] text-gray-200 hover:text-[#e51b24]"
                >
                  <Shield className="w-4 h-4 text-[#e51b24]" />
                  <span>Admin Dashboard</span>
                </Link>
                <div className="flex items-center gap-2 text-gray-400">
                  <PhoneCall className="w-4 h-4 text-[#e51b24]" />
                  <span>Helpline: +91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
