'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useSettings } from '@/lib/settings-context';
import { formatRupees, createWhatsAppChatUrl, generateWhatsAppOrderMessage } from '@/lib/whatsapp';

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const { settings } = useSettings();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phoneNumber || !deliveryAddress) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone_number: phoneNumber,
          delivery_address: deliveryAddress,
          vehicle_model: vehicleModel,
          customer_notes: notes,
          total_amount: totalAmount,
          currency: 'INR',
          items: items.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            product_sku: item.product.sku,
            quantity: item.quantity,
            unit_price: item.product.sale_price ?? item.product.price,
            subtotal: (item.product.sale_price ?? item.product.price) * item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit order');
      }

      setCompletedOrder(data.order);
      setCheckoutStep('success');
      clearCart();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bullgear_orders_updated'));
      }

      // Open WhatsApp
      const businessNumber = settings.whatsapp_number || '919876543210';
      const msg = generateWhatsAppOrderMessage(data.order);
      const url = createWhatsAppChatUrl(businessNumber, msg);
      window.open(url, '_blank');
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0e1117] border-l border-[#202636] h-full flex flex-col z-10 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1f2533] bg-[#0c0e14]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#e51b24]/20 text-[#e51b24]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
                Your Gear Cart
              </h3>
              <p className="text-xs text-gray-400">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1f2c] transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && checkoutStep !== 'success' ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#161a24] text-gray-500 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-gray-300">Your cart is empty</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Discover heavy-duty snorkels, expedition racks, and armor for your 4x4.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2.5 rounded-lg bg-[#e51b24] hover:bg-[#c8141d] text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Start Exploring
              </button>
            </div>
          ) : checkoutStep === 'cart' ? (
            items.map((item) => {
              const product = item.product;
              const price = product.sale_price ?? product.price;
              const itemTotal = price * item.quantity;
              return (
                <div
                  key={`${product.id}-${item.selected_model}`}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-[#131620] border border-[#202636]"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {product.images?.[0]?.image_url ? (
                      <Image
                        src={product.images[0].image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold uppercase text-center p-1">
                        {product.name}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="text-gray-500 hover:text-[#e51b24] transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selected_model && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Model: {item.selected_model}
                        </p>
                      )}

                      <p className="text-xs font-semibold text-[#e51b24] mt-1">
                        {formatRupees(price)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1a1f2b]">
                      <div className="flex items-center border border-[#272e3d] rounded bg-[#0a0c10] text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-gray-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-white">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-white">
                        {formatRupees(itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : checkoutStep === 'details' ? (
            <form id="cart-order-form" onSubmit={handleWhatsAppCheckout} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#202636]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#e51b24]">
                  Delivery Information
                </span>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  ← Back to Cart
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-xs text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10-digit WhatsApp number"
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-xs text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Vehicle make and model (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-xs text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street address, City, Pincode"
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-xs text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Order Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special dispatch requests"
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0e14] border border-[#2a3142] text-xs text-white focus:outline-none focus:border-[#e51b24]"
                />
              </div>
            </form>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <MessageSquare className="w-8 h-8 fill-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-white">Order Sent to WhatsApp!</h4>
              <p className="text-xs text-gray-300">
                Order ID: <span className="font-mono font-bold text-[#e51b24]">{completedOrder?.order_number}</span>
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Please make sure you hit <strong>Send</strong> in WhatsApp. Our team will verify fitment and dispatch details promptly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCheckoutStep('cart');
                  setIsCartOpen(false);
                }}
                className="mt-4 px-6 py-2.5 rounded-lg bg-[#1a202c] hover:bg-[#252e3f] text-white text-xs font-bold transition"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && checkoutStep !== 'success' && (
          <div className="p-5 border-t border-[#1f2533] bg-[#0c0e14] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total:</span>
              <span className="text-xl font-extrabold text-[#e51b24]">
                {formatRupees(totalAmount)}
              </span>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={() => setCheckoutStep('details')}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#25D366]/20 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>Checkout via WhatsApp</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                form="cart-order-form"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>{isSubmitting ? 'Submitting...' : 'Confirm & Open WhatsApp'}</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct WhatsApp order directly with Bull Gear specialists</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
