import React from 'react';
import Link from 'next/link';
import { Logo } from '../common/Logo';
import { Compass, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#07080b] text-gray-400 border-t border-[#181d27] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#181d27]">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo variant="white" size="md" />
            <p className="text-xs tracking-widest text-[#e51b24] font-semibold mt-1">
              RIDE • CHASE • CONQUER
            </p>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Engineered for extreme off-road enthusiasts. Premium vehicle armor, snorkels, expedition roof racks, and recovery gear manufactured to withstand the world&apos;s toughest terrains.
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-300 bg-[#12151c] py-2 px-3 rounded border border-[#202634] w-fit">
              <ShieldCheck className="w-4 h-4 text-[#e51b24]" />
              <span>Official Bull Gear Lifetime Structural Warranty</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#e51b24] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#e51b24] transition-colors">
                  Shop All Gear
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#e51b24] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e51b24] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#e51b24] transition-colors text-xs text-gray-500">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="hover:text-[#e51b24] transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e51b24] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e51b24] transition-colors">
                  Vehicle Fitment Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e51b24] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Built for Adventure Badge */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#12151c] border border-[#222838] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#e51b24] hover:bg-[#e51b24]/20 transition-all"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#12151c] border border-[#222838] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#e51b24] hover:bg-[#e51b24]/20 transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#12151c] border border-[#222838] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#e51b24] hover:bg-[#e51b24]/20 transition-all"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#12151c] border border-[#222838] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#e51b24] hover:bg-[#e51b24]/20 transition-all"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>

            {/* Built for Adventure Emblem */}
            <div className="mt-4 p-3 rounded-lg bg-[#11141c] border border-[#202634] flex items-center gap-3">
              <div className="p-2 rounded-md bg-[#e51b24]/20 text-[#e51b24]">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Built for Adventure
                </p>
                <p className="text-[11px] text-gray-400">
                  Tested in Thar Desert & Himalayas
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 Bull Gear. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-300">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-300">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
