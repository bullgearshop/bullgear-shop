'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Monitor, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { Banner } from '@/lib/types';
import { DEFAULT_BANNERS } from '@/lib/db';
import { SingleImageUpload } from '@/components/admin/SingleImageUpload';

const MAX_BANNERS = 3;

const DESKTOP_PRESET_IMAGES = [
  { label: 'Off-Road SUV (Thar)', url: '/images/hero-suv.jpg' },
  { label: 'Mountain Expedition', url: '/images/adventure-banner.jpg' },
  { label: 'River Crossing Trail', url: '/images/gallery-1.jpg' },
];

const MOBILE_PRESET_IMAGES = [
  { label: 'Trail Rig Portrait', url: '/images/gallery-2.jpg' },
  { label: 'Dunes Action Portrait', url: '/images/gallery-3.jpg' },
  { label: 'Overland Camp Portrait', url: '/images/gallery-5.jpg' },
  { label: 'Off-Road SUV (Crop)', url: '/images/hero-suv.jpg' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formHighlight, setFormHighlight] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDesktopImage, setFormDesktopImage] = useState('');
  const [formMobileImage, setFormMobileImage] = useState('');
  const [formButtonLabel, setFormButtonLabel] = useState('Shop Products');
  const [formButtonLink, setFormButtonLink] = useState('/shop');
  const [formIsActive, setFormIsActive] = useState(true);

  // Load from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem('bullgear_admin_banners');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Limit to MAX_BANNERS (3)
          setBanners(parsed.slice(0, MAX_BANNERS));
        }
      } catch {
        // Fall back to default
      }
    }
  }, []);

  const saveToStorage = (updated: Banner[]) => {
    const capped = updated.slice(0, MAX_BANNERS);
    setBanners(capped);
    try {
      localStorage.setItem('bullgear_admin_banners', JSON.stringify(capped));
    } catch {
      // Ignore
    }
  };

  const toggleActive = (id: string) => {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, is_active: !b.is_active } : b
    );
    saveToStorage(updated);
  };

  const handleOpenAdd = () => {
    if (banners.length >= MAX_BANNERS) {
      alert(`Limit reached: You can add a maximum of ${MAX_BANNERS} hero banners.`);
      return;
    }
    setEditingBanner(null);
    setFormTitle('DISCOVER NEW');
    setFormHighlight('HORIZONS');
    setFormSubtitle('Engineered for rugged terrain and uncharted trails across India.');
    setFormDesktopImage('');
    setFormMobileImage('');
    setFormButtonLabel('Shop Collection');
    setFormButtonLink('/shop');
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setFormTitle(b.title);
    setFormHighlight(b.highlight_text);
    setFormSubtitle(b.subtitle);
    setFormDesktopImage(b.desktop_image_url || '/images/hero-suv.jpg');
    setFormMobileImage(b.mobile_image_url || '/images/gallery-2.jpg');
    setFormButtonLabel(b.button_label || 'Shop Products');
    setFormButtonLink(b.button_link || '/shop');
    setFormIsActive(b.is_active ?? true);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (banners.length <= 1) {
      alert('At least one hero banner must be kept.');
      return;
    }
    if (confirm('Are you sure you want to delete this hero banner?')) {
      const updated = banners.filter((b) => b.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      const updated = banners.map((b) =>
        b.id === editingBanner.id
          ? {
              ...b,
              title: formTitle,
              highlight_text: formHighlight,
              subtitle: formSubtitle,
              desktop_image_url: formDesktopImage,
              mobile_image_url: formMobileImage || formDesktopImage,
              button_label: formButtonLabel,
              button_link: formButtonLink,
              is_active: formIsActive,
            }
          : b
      );
      saveToStorage(updated);
    } else {
      if (banners.length >= MAX_BANNERS) {
        alert(`Cannot add more than ${MAX_BANNERS} banners.`);
        return;
      }
      const newBanner: Banner = {
        id: `ban-${Date.now()}`,
        title: formTitle,
        highlight_text: formHighlight,
        subtitle: formSubtitle,
        desktop_image_url: formDesktopImage,
        mobile_image_url: formMobileImage || formDesktopImage,
        button_label: formButtonLabel,
        button_link: formButtonLink,
        display_order: banners.length + 1,
        is_active: formIsActive,
      };
      saveToStorage([...banners, newBanner]);
    }
    setModalOpen(false);
  };

  const isLimitReached = banners.length >= MAX_BANNERS;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
              Hero Banners
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isLimitReached
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {banners.length} / {MAX_BANNERS} Max
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage up to 3 hero banner slides with dedicated 16:9 desktop and 9:16 mobile images.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          disabled={isLimitReached}
          title={isLimitReached ? `Limit of ${MAX_BANNERS} slides reached` : 'Add New Slide'}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-xs ${
            isLimitReached
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              : 'bg-[#e51b24] hover:bg-[#c8141d] text-white cursor-pointer shadow-sm'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isLimitReached ? `Max ${MAX_BANNERS} Slides Reached` : 'Add New Slide'}</span>
        </button>
      </div>

      {/* Info notice about 16:9 and 9:16 aspect ratios & 3-banner limit */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#e51b24] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900 font-bold">Banner Optimization Rules:</strong>
            <span className="ml-1">
              Desktop renders in <strong className="text-gray-900">16:9 widescreen</strong>, while mobile screens automatically switch to <strong className="text-gray-900">9:16 vertical portrait</strong> so images never get cropped. Maximum hard limit is <strong>3 slides</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map((b, index) => (
          <div
            key={b.id}
            className="rounded-lg bg-white border border-gray-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition"
          >
            {/* Dual Responsive Preview */}
            <div className="p-3 bg-gray-950 border-b border-gray-800">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800/80 text-[11px]">
                <span className="font-mono text-[#e51b24] font-black tracking-wider">
                  SLIDE 0{index + 1} OF 0{MAX_BANNERS}
                </span>
                <span className="text-gray-400 font-medium text-[10px]">Dual Responsive View</span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-end">
                {/* Desktop 16:9 Preview */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold mb-1">
                    <Monitor className="w-3 h-3 text-[#e51b24]" />
                    <span>Desktop (16:9)</span>
                  </div>
                  <div className="relative aspect-[16/9] w-full rounded overflow-hidden bg-gray-900 border border-gray-700">
                    <Image
                      src={b.desktop_image_url || '/images/hero-suv.jpg'}
                      alt={b.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 flex flex-col justify-end">
                      <h4 className="text-[11px] font-extrabold uppercase text-white leading-tight line-clamp-1">
                        {b.title} <span className="text-[#e51b24]">{b.highlight_text}</span>
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Mobile 9:16 Preview */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold mb-1">
                    <Smartphone className="w-3 h-3 text-emerald-400" />
                    <span>Mobile (9:16)</span>
                  </div>
                  <div className="relative aspect-[9/16] w-full rounded overflow-hidden bg-gray-900 border border-gray-700">
                    <Image
                      src={b.mobile_image_url || b.desktop_image_url || '/images/gallery-2.jpg'}
                      alt={`${b.title} Mobile`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[9px] font-bold text-white uppercase line-clamp-1">
                        {b.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Meta Info */}
            <div className="p-4 flex flex-col gap-3 text-xs border-t border-gray-100 bg-gray-50/50 flex-1 justify-between">
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold uppercase text-gray-900 leading-tight">
                  {b.title} <span className="text-[#e51b24]">{b.highlight_text}</span>
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{b.subtitle}</p>
                <div className="pt-1 text-[11px] space-y-0.5 text-gray-500">
                  <p>CTA: <strong className="text-gray-900">{b.button_label}</strong> → <span className="text-[#e51b24]">{b.button_link}</span></p>
                  <p className="truncate text-gray-400">Desktop: {b.desktop_image_url}</p>
                  <p className="truncate text-gray-400">Mobile: {b.mobile_image_url || 'Same as desktop'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                <button
                  type="button"
                  onClick={() => toggleActive(b.id)}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition cursor-pointer ${
                    b.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Disabled'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition cursor-pointer"
                    title="Edit banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold uppercase text-gray-900">
                  {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                  {editingBanner ? `Editing` : `Slide ${banners.length + 1} of ${MAX_BANNERS}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-5 text-xs">
              
              {/* DEDICATED SECTION 1: DESKTOP HERO BANNER IMAGE (16:9 RATIO) */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs uppercase">
                    <Monitor className="w-4 h-4 text-[#e51b24]" />
                    <span>Desktop Hero Image (16:9 Ratio)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">
                    Recommended: 1920 × 1080 (16:9)
                  </span>
                </div>

                {/* 16:9 Live Preview */}
                <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden bg-gray-900 border border-gray-300 shadow-inner">
                  <Image
                    src={formDesktopImage || '/images/hero-suv.jpg'}
                    alt="Desktop Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 sm:p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-mono text-[#e51b24] font-bold tracking-wider">
                      DESKTOP 16:9 PREVIEW
                    </span>
                    <h4 className="text-white font-extrabold text-sm sm:text-base uppercase tracking-tight">
                      {formTitle || 'TITLE'} <span className="text-[#e51b24]">{formHighlight || 'HIGHLIGHT'}</span>
                    </h4>
                  </div>
                </div>

                {/* Preset Options for Desktop */}
                <div>
                  <span className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                    Quick Presets (16:9 Landscape):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DESKTOP_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setFormDesktopImage(preset.url)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          formDesktopImage === preset.url
                            ? 'bg-[#e51b24] text-white border-[#e51b24] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <SingleImageUpload
                  label="Desktop Banner Image (16:9)"
                  value={formDesktopImage}
                  onChange={setFormDesktopImage}
                  helperText="Upload landscape banner for desktop & tablet screens"
                  aspectRatioHint="16:9 Landscape"
                />
              </div>

              {/* DEDICATED SECTION 2: MOBILE HERO BANNER IMAGE (9:16 RATIO) */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs uppercase">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Mobile Hero Image (9:16 Ratio)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Recommended: 1080 × 1920 (9:16 Portrait)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* 9:16 Live Phone Mockup Preview */}
                  <div className="flex justify-center sm:justify-start">
                    <div className="relative w-36 aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 border-2 border-gray-700 shadow-md">
                      <Image
                        src={formMobileImage || formDesktopImage || '/images/gallery-2.jpg'}
                        alt="Mobile Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[9px] font-mono text-[#e51b24] font-bold">
                          MOBILE 9:16
                        </span>
                        <h5 className="text-white font-extrabold text-[11px] uppercase leading-tight line-clamp-2">
                          {formTitle || 'TITLE'} <span className="text-[#e51b24]">{formHighlight || 'HIGHLIGHT'}</span>
                        </h5>
                      </div>
                    </div>
                  </div>

                  {/* Preset Options & Description */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-semibold text-gray-600">
                      Quick Presets (9:16 Portrait):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {MOBILE_PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setFormMobileImage(preset.url)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                            formMobileImage === preset.url
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 pt-1 leading-relaxed">
                      Displayed exclusively on mobile screens (&lt;640px) to prevent side-cropping and ensure sharp vertical display.
                    </p>
                  </div>
                </div>

                <SingleImageUpload
                  label="Mobile Hero Image (9:16)"
                  value={formMobileImage}
                  onChange={setFormMobileImage}
                  helperText="Upload vertical photo for mobile screens"
                  aspectRatioHint="9:16 Portrait"
                />
              </div>

              {/* Title & Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Main Title (White Text)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. ENGINEERED FOR"
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-[#e51b24] focus:outline-hidden uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Highlight Text (Red #E51B24)
                  </label>
                  <input
                    type="text"
                    value={formHighlight}
                    onChange={(e) => setFormHighlight(e.target.value)}
                    placeholder="e.g. REAL ADVENTURES"
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-[#e51b24] focus:outline-hidden uppercase"
                    required
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subtitle Description
                </label>
                <textarea
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Short compelling description"
                  rows={2}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-[#e51b24] focus:outline-hidden"
                  required
                />
              </div>

              {/* CTA Button Label & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={formButtonLabel}
                    onChange={(e) => setFormButtonLabel(e.target.value)}
                    placeholder="e.g. Shop Products"
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-[#e51b24] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formButtonLink}
                    onChange={(e) => setFormButtonLink(e.target.value)}
                    placeholder="e.g. /shop or /categories/snorkels"
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-[#e51b24] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-[#e51b24] focus:ring-[#e51b24]"
                />
                <label htmlFor="formIsActive" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Slide is Active and visible on storefront
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold uppercase transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
