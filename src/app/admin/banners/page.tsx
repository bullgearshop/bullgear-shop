'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sliders, Plus, Edit2, Trash2, CheckCircle, Eye } from 'lucide-react';
import { Banner } from '@/lib/types';
import { DEFAULT_BANNERS } from '@/lib/db';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);

  const toggleActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Hero & Adventure Banners
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage homepage cinematic slides, red highlights, and CTA destination links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((b, index) => (
          <div
            key={b.id}
            className="rounded-2xl bg-white border border-gray-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-56 w-full bg-gray-900">
              <Image
                src={b.desktop_image_url}
                alt={b.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 flex flex-col justify-end">
                <span className="text-[10px] font-mono text-[#e51b24] font-bold">
                  SLIDE 0{index + 1}
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-1">
                  {b.title} <span className="text-[#e51b24]">{b.highlight_text}</span>
                </h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-1">{b.subtitle}</p>
              </div>
            </div>

            <div className="p-5 flex items-center justify-between text-xs border-t border-gray-100 bg-gray-50/50">
              <div className="space-y-1">
                <p className="text-gray-500">
                  CTA Label: <strong className="text-gray-900">{b.button_label}</strong>
                </p>
                <p className="text-gray-500">
                  Destination: <strong className="text-[#e51b24]">{b.button_link}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                    b.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
