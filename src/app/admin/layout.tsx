'use client';

import React, { useState, useEffect } from 'react';
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
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

const ADMIN_USERNAME = 'BUllgear@shop.cim';
const ADMIN_PASSWORD = 'Bullgear@shop';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [adminEmail, setAdminEmail] = useState(
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'BUllgear@shop.cim'
  );

  // Check session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem('bullgear_admin_session');
      const savedUser = localStorage.getItem('bullgear_admin_user');
      if (savedUser) setAdminEmail(savedUser);
      if (session === 'authenticated') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('bullgear_admin_session', 'authenticated');
        if (data.user) {
          setAdminEmail(data.user);
          localStorage.setItem('bullgear_admin_user', data.user);
        }
        setIsAuthenticated(true);
        setUsernameInput('');
        setPasswordInput('');
      } else {
        setLoginError(data.message || 'Invalid username or password. Please verify credentials.');
      }
    } catch {
      // Fallback check against env variable if network issue
      const expectedUser = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'BUllgear@shop.cim').trim();
      const expectedPass = (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Bullgear@shop').trim();
      const inputUser = usernameInput.trim();
      const inputPass = passwordInput.trim();

      if (
        (inputUser === expectedUser || inputUser.toLowerCase() === expectedUser.toLowerCase()) &&
        inputPass === expectedPass
      ) {
        localStorage.setItem('bullgear_admin_session', 'authenticated');
        setIsAuthenticated(true);
        setUsernameInput('');
        setPasswordInput('');
      } else {
        setLoginError('Invalid username or password. Please verify credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('bullgear_admin_session');
      localStorage.removeItem('bullgear_admin_user');
    } catch {}
    setIsAuthenticated(false);
  };

  // Loading state while checking localStorage
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e51b24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4 selection:bg-[#e51b24] selection:text-white">
        <div className="w-full max-w-md bg-[#12161f] border border-[#232936] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Red atmospheric blur */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#e51b24]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <Logo variant="white" size="lg" />
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e51b24]/15 border border-[#e51b24]/30 text-[#ff404a] text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Armory Console Access</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-3">
              Admin Authentication
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Enter your Bull Gear administrator credentials to manage products, banners, and catalog data.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/80 flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-[#ff404a] shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 relative z-10 text-xs">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Admin Username / Email
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="BUllgear@shop.cim"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a202c] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#e51b24] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#1a202c] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#e51b24] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-[#e51b24]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Armory Console</span>
            </button>
          </form>

          {/* Return to storefront */}
          <div className="mt-6 pt-5 border-t border-gray-800 text-center relative z-10">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <span>← Return to Public Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Sidebar Footer with Sign Out */}
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

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between w-full p-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs text-red-700 font-semibold transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Sign Out Admin</span>
            </span>
          </button>
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] text-gray-700 font-semibold">{adminEmail}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
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
