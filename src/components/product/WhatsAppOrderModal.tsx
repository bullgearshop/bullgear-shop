'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, MessageSquare, ShieldCheck, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatRupees, createWhatsAppChatUrl, generateWhatsAppOrderMessage } from '@/lib/whatsapp';

interface WhatsAppOrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialQuantity?: number;
  initialModel?: string;
}

export function WhatsAppOrderModal({
  product,
  isOpen,
  onClose,
  initialQuantity = 1,
  initialModel = '',
}: WhatsAppOrderModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedModel, setSelectedModel] = useState(initialModel || (product.compatibility_models?.[0] || ''));
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const unitPrice = product.sale_price ?? product.price;
  const totalAmount = unitPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !phoneNumber.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone_number: phoneNumber,
          delivery_address: deliveryAddress,
          vehicle_model: selectedModel,
          customer_notes: customerNotes,
          total_amount: totalAmount,
          currency: 'INR',
          items: [
            {
              product_id: product.id,
              product_name: product.name,
              product_sku: product.sku,
              quantity: quantity,
              unit_price: unitPrice,
              subtotal: totalAmount,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order request');
      }

      setOrderComplete(data.order);

      // Generate WhatsApp link
      const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '919876543210';
      const msg = generateWhatsAppOrderMessage(data.order);
      const waUrl = createWhatsAppChatUrl(businessNumber, msg);

      // Open WhatsApp in new tab
      window.open(waUrl, '_blank');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#12151c] border border-[#222838] rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1f2533] bg-[#0d0f15]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#25D366]/20 text-[#25D366]">
              <MessageSquare className="w-5 h-5 fill-[#25D366]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Order via WhatsApp
              </h3>
              <p className="text-xs text-gray-400">Direct order request with Bull Gear specialist</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1f2c] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {orderComplete ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-white">Order Request Saved!</h4>
              <p className="text-sm text-gray-300">
                Order ID: <span className="font-mono font-bold text-[#e51b24]">{orderComplete.order_number}</span>
              </p>
              <div className="bg-[#181d28] p-4 rounded-xl border border-[#222838] text-xs text-gray-300 text-left space-y-2">
                <p>
                  <strong>Important:</strong> We have opened WhatsApp with your prefilled order message. Please click <strong>Send</strong> in WhatsApp so our team can immediately confirm stock and dispatch!
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <a
                  href={createWhatsAppChatUrl(
                    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '919876543210',
                    generateWhatsAppOrderMessage(orderComplete)
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-5 h-5 fill-black" />
                  <span>Re-open WhatsApp Chat</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#1b202c] hover:bg-[#222838] text-gray-300 text-xs font-semibold rounded-lg transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product preview */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0c0e14] border border-[#1f2533]">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  {product.images?.[0]?.image_url ? (
                    <Image
                      src={product.images[0].image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 font-bold uppercase text-center p-1">
                      {product.name}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                  <p className="text-xs text-[#e51b24] font-semibold mt-0.5">
                    {formatRupees(unitPrice)} each
                  </p>
                  <p className="text-[11px] text-gray-400">SKU: {product.sku || 'N/A'}</p>
                </div>
              </div>

              {/* Quantity & Vehicle Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <div className="flex items-center border border-[#2a3142] rounded-lg bg-[#0c0e14] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Vehicle Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-xs text-white focus:outline-none focus:border-[#e51b24]"
                  >
                    {product.compatibility_models?.length ? (
                      product.compatibility_models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))
                    ) : (
                      <option value="Universal 4x4">Universal 4x4</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikram Singh Rathore"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-sm text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-sm text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House/Plot No, Street, City, State, Pincode"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-sm text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Special Notes / Custom Requirements (Optional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Need urgent dispatch before Saturday"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-xs text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Total Summary */}
              <div className="pt-2 border-t border-[#1f2533] flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Payable Amount:</span>
                <span className="text-lg font-extrabold text-[#e51b24]">
                  {formatRupees(totalAmount)}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-sm uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#25D366]/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order Request...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 fill-black" />
                    <span>Submit & Open WhatsApp</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Orders are verified by official Bull Gear support before dispatch</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
