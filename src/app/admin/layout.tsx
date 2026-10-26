'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Image as ImageIcon,
  Sliders,
  Globe,
  Settings,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Hero Banners', href: '/admin/banners', icon: Sliders },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'SEO & Sitemap', href: '/admin/seo', icon: Globe },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar in White Theme */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 shadow-xs ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header with Black Logo */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <Logo variant="black" size="sm" />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Badge */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Admin Portal
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-[#e51b24] border border-red-200 font-bold">
            v2.4
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#e51b24] text-white shadow-md shadow-[#e51b24]/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-700 font-semibold transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#e51b24]" />
              <span>Live Storefront</span>
            </span>
            <span className="text-gray-400 text-[10px]">↗</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Compact Admin Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 hidden sm:block">
              Bull Gear Armory Console
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Live Inventory Engine</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#e51b24] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              BG
            </div>
          </div>
        </header>

        {/* Child Pages Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
