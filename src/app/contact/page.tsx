'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { MessageSquare, Phone, Mail, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { createWhatsAppChatUrl } from '@/lib/whatsapp';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    message: '',
  });

  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '919876543210';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const text = 'Hello Bull Gear Support, I have a query regarding accessories and compatibility.';
    window.open(createWhatsAppChatUrl(businessNumber, text), '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar theme="light" />

      <main className="flex-1 pb-20">
        <div className="py-14 sm:py-20 bg-[#f8fafc] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e51b24] mb-2 block">
              We&apos;re Here For Your Adventure
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-gray-900">
              Contact Bull Gear
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mt-2">
              Have questions regarding vehicle fitment, bulk orders, or custom fabrication? Speak directly with our off-road engineers.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* WhatsApp direct card */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#25D366]/20 text-[#25D366]">
                    <MessageSquare className="w-6 h-6 fill-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 uppercase">Direct WhatsApp Support</h3>
                    <p className="text-xs text-gray-500">Fastest response for orders & queries</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Chat directly with our technical support team for instant order status, installation advice, and custom vehicle specs.
                </p>
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>Start WhatsApp Chat</span>
                </button>
              </div>

              {/* Info cards */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <Phone className="w-5 h-5 text-[#e51b24] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-900">Phone Hotline</h4>
                    <p className="text-xs text-gray-600 mt-0.5">+91 98765 43210 (Mon–Sat, 10am–7pm IST)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <Mail className="w-5 h-5 text-[#e51b24] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-900">Email Inquiries</h4>
                    <p className="text-xs text-gray-600 mt-0.5">support@bullgear.com / orders@bullgear.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <MapPin className="w-5 h-5 text-[#e51b24] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-900">Headquarters & Fabrication Works</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Bull Gear Automotive Labs, Industrial Corridor, Gurgaon, Haryana 122002, India</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Form */}
            <div className="lg:col-span-7 p-8 rounded-2xl bg-white border border-gray-200 shadow-md">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Message Received!</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    Thank you for reaching out. An off-road specialist will review your vehicle specifications and contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 rounded-lg bg-gray-900 text-xs font-semibold text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold uppercase text-gray-900 tracking-wide mb-2">
                    Send an Inquiry
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Karan"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. karan@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Vehicle Make & Model
                      </label>
                      <input
                        type="text"
                        value={formData.vehicle}
                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                        placeholder="e.g. Mahindra Thar 2024 / Jimny"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Your Message / Inquiry *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what accessory or fitment support you need..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#e51b24] hover:bg-[#c8141d] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#e51b24]/20"
                  >
                    <span>Submit Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
