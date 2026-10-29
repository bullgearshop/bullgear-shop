import React from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ShieldCheck, Lock, Truck, RefreshCw, MessageSquare, Mail, MapPin } from 'lucide-react';
import { createWhatsAppChatUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms | Bull Gear India',
  description: 'Official privacy policy, WhatsApp ordering terms, express shipping policy, and warranty conditions for Bull Gear 4x4 overland accessories.',
};

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();

  const businessNumber = settings.whatsapp_number || '919876543210';
  const email = settings.contact_email || 'Bullgearshope@gmail.com';
  const address = settings.address || 'Bull Gear Automotive Labs, Industrial Corridor, Gurgaon, Haryana 122002, India';
  const freeShipping = settings.free_shipping_threshold || 4999;

  const waSupportUrl = createWhatsAppChatUrl(
    businessNumber,
    'Hello Bull Gear Support, I have a query regarding store policies and ordering.'
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar theme="light" />

      <main className="flex-1 pb-20">
        {/* Hero header */}
        <div className="py-14 sm:py-20 bg-[#f8fafc] border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e51b24] mb-2 block">
              Legal Disclosures & Customer Protection
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-gray-900">
              Privacy Policy & Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mt-3">
              Transparency, security, and reliable off-road engineering. Learn how Bull Gear handles your vehicle fitment inquiries, WhatsApp orders, and data.
            </p>

            {/* Quick feature badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#e51b24] shrink-0" />
                <span className="text-xs font-bold text-gray-800">Lifetime Structural Warranty</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#e51b24] shrink-0" />
                <span className="text-xs font-bold text-gray-800">Free Freight Above ₹{freeShipping.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#e51b24] shrink-0" />
                <span className="text-xs font-bold text-gray-800">Verified WhatsApp Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Policy Text */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Dynamic Admin Policy Content */}
              <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold uppercase text-gray-900 tracking-tight mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#e51b24]" />
                  <span>Store Privacy & Governance</span>
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {settings.privacy_policy || (
                    <p>
                      Bull Gear operates on strict privacy principles. Your contact and vehicle data are never shared or sold.
                    </p>
                  )}
                </div>
              </section>

              {/* Shipping Policy */}
              <section id="shipping" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold uppercase text-gray-900 tracking-tight mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#e51b24]" />
                  <span>Shipping & Delivery Policy</span>
                </h2>
                <div className="text-xs sm:text-sm text-gray-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>Dispatch Timeline:</strong> Ready stock products (snorkels, LED light bars, recovery kits) are dispatched within 24 to 48 hours of order confirmation. Custom vehicle armor (bull bars, bumpers, rock sliders) require precision fabrication and dispatch within 4 to 7 working days.
                  </p>
                  <p>
                    <strong>Free Shipping:</strong> All domestic orders crossing ₹{freeShipping.toLocaleString('en-IN')} qualify for complimentary surface express freight across India.
                  </p>
                  <p>
                    <strong>Live Tracking:</strong> Real-time tracking IDs and courier docket receipts are directly shared with you on WhatsApp immediately upon dispatch.
                  </p>
                </div>
              </section>

              {/* Returns & Warranty Policy */}
              <section id="returns" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold uppercase text-gray-900 tracking-tight mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#e51b24]" />
                  <span>Returns, Exchanges & Warranty</span>
                </h2>
                <div className="text-xs sm:text-sm text-gray-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>7-Day Transit Damage & Fitment Guarantee:</strong> If an accessory arrives damaged in transit or fails verified factory bolt-on fitment, notify us on WhatsApp within 7 days with photos for immediate replacement dispatch.
                  </p>
                  <p>
                    <strong>Lifetime Structural Warranty:</strong> All fabricated heavy-duty steel bumpers, rock sliders, and roof racks include Bull Gear&apos;s structural warranty against weld cracking and metal fatigue under normal off-road usage.
                  </p>
                </div>
              </section>

            </div>

            {/* Right Column: Contact Cards */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-[#0c0e14] text-white border border-[#202634] shadow-md space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Have Policy Questions?
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Speak directly with our technical support team for order inquiries, warranty verification, or data removal requests.
                </p>

                <a
                  href={waSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>Chat on WhatsApp</span>
                </a>

                <div className="pt-4 border-t border-[#1f2636] space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#e51b24] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase font-bold">Email Inquiries</p>
                      <a href={`mailto:${email}`} className="text-white hover:underline font-medium">
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#e51b24] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase font-bold">Store & Fabrication Works</p>
                      <p className="text-gray-300 leading-relaxed">{address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}

