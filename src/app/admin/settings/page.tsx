'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettings } from '@/lib/settings-context';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Truck,
  Video,
  FileText,
  Loader2,
} from 'lucide-react';
import { createWhatsAppChatUrl } from '@/lib/whatsapp';

export default function AdminSettingsPage() {
  const { settings, updateSettings, isLoading } = useSettings();

  const [whatsapp, setWhatsapp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [shippingThreshold, setShippingThreshold] = useState('4999');
  const [videoUrl, setVideoUrl] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever settings loads
  useEffect(() => {
    if (settings) {
      setWhatsapp(settings.whatsapp_number || '');
      setPhoneNumber(settings.phone_number || '+91 98765 43210');
      setContactEmail(settings.contact_email || 'Bullgearshope@gmail.com');
      setAddress(
        settings.address ||
          'Bull Gear Automotive Labs, Industrial Corridor, Gurgaon, Haryana 122002, India'
      );
      setShippingThreshold(String(settings.free_shipping_threshold ?? 4999));
      setVideoUrl(
        settings.intro_video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      );
      setAnnouncementText(
        settings.announcement_bar?.text ||
          '🔥 Free Express Shipping Across India on all orders above ₹4,999!'
      );
      setPrivacyPolicy(settings.privacy_policy || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    // Sanitize WhatsApp number (remove +, spaces, dashes)
    const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
    if (!cleanWhatsapp || cleanWhatsapp.length < 8) {
      setErrorMessage('Please provide a valid WhatsApp number with country code (e.g. 919876543210)');
      setIsSaving(false);
      return;
    }

    const cleanEmail = contactEmail.trim() || 'Bullgearshope@gmail.com';

    try {
      const ok = await updateSettings({
        whatsapp_number: cleanWhatsapp,
        phone_number: phoneNumber.trim(),
        contact_email: cleanEmail,
        address: address.trim(),
        free_shipping_threshold: Number(shippingThreshold) || 4999,
        intro_video_url: videoUrl.trim(),
        announcement_bar: {
          enabled: true,
          text: announcementText.trim(),
        },
        privacy_policy: privacyPolicy.trim(),
      });

      if (ok) {
        setWhatsapp(cleanWhatsapp);
        setContactEmail(cleanEmail);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage('Failed to save settings. Please verify your connection or Supabase status.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewWaNumber = whatsapp.replace(/[^0-9]/g, '') || '919876543210';
  const testWaUrl = createWhatsAppChatUrl(
    previewWaNumber,
    'Hello Bull Gear! Testing store WhatsApp routing from Admin Console.'
  );

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          Store & WhatsApp Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your WhatsApp business routing, customer support email, physical store location, and public policies. Changes apply immediately across the entire site.
        </p>
      </div>

      {/* Notifications */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Settings Successfully Saved & Applied!</p>
            <p className="text-emerald-700 font-normal text-xs mt-0.5">
              All checkout buttons, WhatsApp inquiry flows, contact info, and policies are now dynamically updated.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: WHATSAPP & CONTACT ROUTING */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              1. WhatsApp Routing & Communication
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* WhatsApp Number */}
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                WhatsApp Business Number (Checkout & Inquiries) *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-sm font-mono"
                />
                <a
                  href={testWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Test WhatsApp Link</span>
                </a>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                Enter your full WhatsApp number including country code (e.g. <strong>91</strong> for India followed by your 10 digits). 
                <strong> No &apos;+&apos; sign, dashes, or spaces.</strong> Every WhatsApp checkout and contact button across Bull Gear connects to this number.
              </p>
            </div>

            {/* Official Email */}
            <div>
              <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                Official Support Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Bullgearshope@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Official customer email displayed on contact page and footer. Default: <strong>Bullgearshope@gmail.com</strong>
              </p>
            </div>

            {/* Phone Helpline */}
            <div>
              <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                Customer Phone Helpline (Display Format)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210 (Mon–Sat, 10am–7pm IST)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Customer-facing telephone number shown on contact page.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: LOCATION & WORKSHOP */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <MapPin className="w-5 h-5 text-[#e51b24]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              2. Store & Fabrication Location
            </h2>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
              Store Headquarters & Workshop Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full physical address, City, State, Pincode, India"
              className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-sm leading-relaxed"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Shown to customers on the contact page and legal disclosures.
            </p>
          </div>
        </div>

        {/* SECTION 3: STORE LOGISTICS & MEDIA */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              3. Shipping Rules & Announcement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                Free Express Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={shippingThreshold}
                onChange={(e) => setShippingThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-sm"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Orders above this amount receive free express freight India-wide.
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                Homepage Intro Video URL (YouTube / MP4)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                Top Announcement Bar Notice
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Notice displayed at the top of every page..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PRIVACY POLICY & STORE POLICIES */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-gray-700" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                4. Privacy Policy & Terms Content
              </h2>
            </div>
            <Link
              href="/privacy-policy"
              target="_blank"
              className="text-xs font-bold text-[#e51b24] hover:underline flex items-center gap-1"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
              Privacy Policy, Terms of Service & Shipping Disclosures
            </label>
            <textarea
              rows={10}
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
              placeholder="Enter your store privacy policy, warranty guidelines, and shipping terms..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#e51b24] focus:bg-white text-xs font-mono leading-relaxed"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              This content is published on the live <Link href="/privacy-policy" target="_blank" className="text-[#e51b24] underline">/privacy-policy</Link> page. You can customize clauses, return conditions, warranty information, and WhatsApp order processing guidelines at any time.
            </p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#e51b24] hover:bg-[#c8141d] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 shadow-lg shadow-[#e51b24]/20 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
