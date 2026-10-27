'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="relative py-12 sm:py-20 bg-[#f8fafc] overflow-hidden border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[240px] sm:min-h-[300px] flex items-center border border-gray-200 shadow-xl p-6 sm:p-12">
          
          {/* Background image */}
          <Image
            src="/images/hero-suv.jpg"
            alt="Join the adventure"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/60" />

          {/* Content */}
          <div className="relative z-10 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-xl text-left">
              <h2 className="text-[21px] sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight">
                Join The Adventure
              </h2>
              <p className="text-xs sm:text-base text-gray-300 mt-2 font-normal leading-relaxed">
                Get the latest updates, new vehicle compatibility releases, and exclusive member discounts.
              </p>
            </div>

            {/* Email form */}
            <div className="w-full lg:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Welcome to the Bull Gear tribe! Check your inbox for your 10% off code.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-[450px]"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl bg-[#141720]/90 border border-[#2c3345] text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-[#e51b24] shadow-inner"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#e51b24]/30 cursor-pointer"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
