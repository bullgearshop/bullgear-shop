'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [whatsapp, setWhatsapp] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '919876543210'
  );
  const [shippingThreshold, setShippingThreshold] = useState('4999');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [announcementText, setAnnouncementText] = useState(
    '🔥 Free Express Shipping Across India on all orders above ₹4,999! Limited stock on Thar 2026 accessories.'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          Store & WhatsApp Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure business routing, customer checkout thresholds, and media links.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6 text-xs">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Store settings saved successfully!</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-gray-700 uppercase mb-1">
            WhatsApp Business Number *
          </label>
          <input
            type="text"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="919876543210"
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] text-sm"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Include country code without &apos;+&apos; or spaces (e.g. 91 for India followed by 10 digits).
          </p>
        </div>

        <div>
          <label className="block font-bold text-gray-700 uppercase mb-1">
            Free Express Shipping Threshold (₹)
          </label>
          <input
            type="number"
            value={shippingThreshold}
            onChange={(e) => setShippingThreshold(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] text-sm"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 uppercase mb-1">
            Homepage Intro Video URL (Cloudinary / YouTube)
          </label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] text-sm"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 uppercase mb-1">
            Header Announcement Bar Text
          </label>
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] text-sm"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#e51b24]/20"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
