'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Upload, Copy, Check, ExternalLink } from 'lucide-react';

export default function AdminMediaPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mediaFiles = [
    { name: 'Red Horns Main Logo', path: '/images/Bull-Gear-logo1.png', type: 'Logo' },
    { name: 'White Text Logo (Dark Nav)', path: '/images/Bull-Gear-logo2.png', type: 'Logo' },
    { name: 'Black Text Logo (Light Nav)', path: '/images/Bull-Gear-logo3.png', type: 'Logo' },
    { name: 'Hero Off-Road 4x4 SUV', path: '/images/hero-suv.jpg', type: 'Hero Banner' },
    { name: 'Adventure Mountain Expedition', path: '/images/adventure-banner.jpg', type: 'Banner' },
    { name: 'Premium Snorkel Kit', path: '/images/product-snorkel.jpg', type: 'Product' },
    { name: 'Expedition Roof Rack', path: '/images/product-roof-rack.jpg', type: 'Product' },
    { name: 'Dual Row LED Light Bar', path: '/images/product-light-bar.jpg', type: 'Product' },
    { name: 'Heavy Duty Front Bumper', path: '/images/product-bumper.jpg', type: 'Product' },
    { name: 'Tubular Steel Bull Bar', path: '/images/product-bull-bar.jpg', type: 'Product' },
    { name: 'Kinetic Recovery Gear Kit', path: '/images/product-recovery.jpg', type: 'Product' },
    { name: 'Mud-Terrain Off-Road Tyres', path: '/images/product-tyres.jpg', type: 'Product' },
  ];

  const handleCopy = (path: string, idx: number) => {
    navigator.clipboard.writeText(path);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Media & Cloudinary Asset Vault
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Store and manage product photography, banners, and intro video assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-[#e51b24] hover:bg-[#c8141d] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Upload New Media</span>
            <input type="file" className="hidden" accept="image/*,video/*" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaFiles.map((file, idx) => (
          <div
            key={file.path}
            className="rounded-xl bg-white border border-gray-200 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition"
          >
            <div className="relative aspect-video bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100">
              <Image src={file.path} alt={file.name} fill className="object-contain p-2" />
              <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-gray-700 border border-gray-200 shadow-xs">
                {file.type}
              </span>
            </div>

            <div className="p-3 bg-white space-y-2">
              <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-mono truncate max-w-[140px]">{file.path}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(file.path, idx)}
                  className="p-1 text-gray-400 hover:text-gray-900 transition"
                  title="Copy Path"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
