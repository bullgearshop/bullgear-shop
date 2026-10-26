'use client';

import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatRupees, createWhatsAppChatUrl } from '@/lib/whatsapp';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-1',
      order_number: 'BG-2026-0001',
      customer_name: 'Vikram Singh Rathore',
      phone_number: '+91 98765 43210',
      whatsapp_number: '919876543210',
      delivery_address: 'Plot 42, Overland Ridge, DLF Phase 5, Gurgaon, Haryana 122002',
      vehicle_model: 'Mahindra Thar (2020+)',
      total_amount: 24999,
      currency: 'INR',
      order_status: 'confirmed',
      payment_status: 'pending',
      created_at: '2026-10-26T08:00:00.000Z',
      updated_at: '2026-10-26T10:00:00.000Z',
      items: [
        {
          id: 'item-1',
          product_name: 'Premium Snorkel Kit',
          product_sku: 'BG-SNK-001',
          quantity: 1,
          unit_price: 24999,
          subtotal: 24999,
        },
      ],
    },
    {
      id: 'ord-2',
      order_number: 'BG-2026-0002',
      customer_name: 'Rahul Sharma',
      phone_number: '+91 99887 76655',
      whatsapp_number: '919988776655',
      delivery_address: 'Flat 304, Green Heights, Indiranagar, Bangalore, Karnataka 560038',
      vehicle_model: 'Toyota Fortuner (2016+)',
      total_amount: 18995,
      currency: 'INR',
      order_status: 'processing',
      payment_status: 'paid',
      created_at: '2026-10-25T14:00:00.000Z',
      updated_at: '2026-10-26T02:00:00.000Z',
      items: [
        {
          id: 'item-2',
          product_name: 'Roof Rack',
          product_sku: 'BG-RR-002',
          quantity: 1,
          unit_price: 18995,
          subtotal: 18995,
        },
      ],
    },
    {
      id: 'ord-3',
      order_number: 'BG-2026-0003',
      customer_name: 'Karan Mehra',
      phone_number: '+91 91234 56789',
      whatsapp_number: '919123456789',
      delivery_address: 'House No 18, Sector 15, Chandigarh 160015',
      vehicle_model: 'Suzuki Jimny (5-Door)',
      total_amount: 12999,
      currency: 'INR',
      order_status: 'pending',
      payment_status: 'pending',
      created_at: '2026-10-26T09:30:00.000Z',
      updated_at: '2026-10-26T09:30:00.000Z',
      items: [
        {
          id: 'item-3',
          product_name: 'LED Light Bar',
          product_sku: 'BG-LED-003',
          quantity: 1,
          unit_price: 12999,
          subtotal: 12999,
        },
      ],
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone_number.includes(search);
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, order_status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          WhatsApp Order Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review customer order submissions, update dispatch state, and chat via WhatsApp.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#e51b24] shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24] shadow-xs"
        >
          <option value="all">All Statuses ({orders.length})</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">WhatsApp Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#e51b24]">
                    {order.order_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">{order.customer_name}</div>
                    <div className="text-[11px] text-gray-500">{order.phone_number}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {order.items?.map((item) => (
                      <div key={item.product_name}>
                        {item.product_name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {order.vehicle_model || 'Universal 4x4'}
                  </td>
                  <td className="py-3.5 px-4 font-black text-gray-900">
                    {formatRupees(order.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.order_status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleUpdateStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="py-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-300 text-gray-800 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={createWhatsAppChatUrl(
                        order.whatsapp_number || order.phone_number,
                        `Hello ${order.customer_name}, Bull Gear update regarding your order ${order.order_number}:`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-black font-extrabold text-xs shadow-xs hover:bg-[#20ba5a] transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-black" />
                      <span>Chat</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-10 p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-gray-500">Order Details</span>
                <h3 className="text-base font-bold font-mono text-[#e51b24]">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-gray-500 font-semibold block">Customer Information:</span>
                <p className="text-gray-900 font-bold text-sm mt-0.5">{selectedOrder.customer_name}</p>
                <p className="text-gray-600">Phone: {selectedOrder.phone_number}</p>
                {selectedOrder.vehicle_model && (
                  <p className="text-gray-600">Vehicle: {selectedOrder.vehicle_model}</p>
                )}
              </div>

              <div>
                <span className="text-gray-500 font-semibold block">Delivery Address:</span>
                <p className="text-gray-700 mt-0.5">{selectedOrder.delivery_address}</p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold block">Order Items:</span>
                <div className="mt-1 space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.product_name} className="flex justify-between">
                      <span className="text-gray-900">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="font-bold text-[#e51b24]">
                        {formatRupees(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm border-t border-gray-200">
                <span className="text-gray-500">Total Amount:</span>
                <span className="text-lg font-black text-gray-900">
                  {formatRupees(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
              <a
                href={createWhatsAppChatUrl(
                  selectedOrder.whatsapp_number || selectedOrder.phone_number,
                  `Hello ${selectedOrder.customer_name}, Bull Gear update regarding your order ${selectedOrder.order_number}:`
                )}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#25D366] text-black font-extrabold flex items-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
