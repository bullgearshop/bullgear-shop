'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  Car,
  Package,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatRupees, createWhatsAppChatUrl } from '@/lib/whatsapp';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchOrders = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh when new order is placed in any browser tab
    const handleOrderPlaced = () => {
      fetchOrders();
    };

    window.addEventListener('bullgear_orders_updated', handleOrderPlaced);
    return () => {
      window.removeEventListener('bullgear_orders_updated', handleOrderPlaced);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, order_status: newStatus });
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, order_status: newStatus }),
      });
      if (!res.ok) {
        console.error('Failed to update order status on server');
      }
    } catch (err) {
      console.error('Error saving order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return { date: 'Recent', time: '' };
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { date: 'Recent', time: '' };
      return {
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
    } catch {
      return { date: 'Recent', time: '' };
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    const query = search.toLowerCase();
    const matchSearch =
      o.order_number.toLowerCase().includes(query) ||
      o.customer_name.toLowerCase().includes(query) ||
      o.phone_number.includes(query) ||
      (o.vehicle_model && o.vehicle_model.toLowerCase().includes(query)) ||
      (o.delivery_address && o.delivery_address.toLowerCase().includes(query)) ||
      (o.items && o.items.some((i) => i.product_name.toLowerCase().includes(query)));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            WhatsApp Order Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time feed of all customer WhatsApp checkout orders, delivery specs, and order timestamps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-[11px] text-gray-400 font-mono hidden sm:inline-block">
              Updated: {lastRefreshed}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-gray-400 text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#e51b24]' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, phone, or vehicle..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#e51b24] shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24] shadow-xs font-medium"
        >
          <option value="all">All Orders ({orders.length})</option>
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
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#e51b24] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Loading live orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">No Orders Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search || statusFilter !== 'all'
                ? 'No orders match your filter criteria. Try clearing search filters.'
                : 'No customer orders have been received yet. When customers check out via WhatsApp, orders appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b border-gray-200 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Date & Time Placed</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Vehicle Model</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const dt = formatDateTime(order.created_at);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#e51b24] whitespace-nowrap">
                        {order.order_number}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{dt.date}</span>
                        </div>
                        {dt.time && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{dt.time}</span>
                          </div>
                        )}
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{order.customer_name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{order.phone_number}</div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {order.vehicle_model ? (
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{order.vehicle_model}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Universal / Not specified</span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 text-gray-700 max-w-[200px]">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="truncate" title={`${item.product_name} × ${item.quantity}`}>
                              <span className="font-semibold text-gray-900">{item.quantity}×</span> {item.product_name}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">Custom inquiry</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-black text-gray-900 whitespace-nowrap">
                        {formatRupees(order.total_amount)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={order.order_status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleUpdateStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`py-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer transition ${getStatusBadge(
                            order.order_status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Action Buttons: View Details & WhatsApp Chat */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer shadow-2xs"
                            title="View Full Customer & Order Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-600" />
                            <span>View Details</span>
                          </button>

                          <a
                            href={createWhatsAppChatUrl(
                              order.whatsapp_number || order.phone_number,
                              `Hello ${order.customer_name}, Bull Gear update regarding your order ${order.order_number}:`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs shadow-xs transition"
                            title="Chat with Customer on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-black" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Customer & Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Customer & Order Dossier
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h3 className="text-xl font-extrabold font-mono text-[#e51b24]">
                    {selectedOrder.order_number}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Order Date & Time Banner */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-[#e51b24]" />
                  <span className="font-semibold">Order Placed On:</span>
                  <span className="font-bold text-gray-900">
                    {formatDateTime(selectedOrder.created_at).date}
                  </span>
                  <span className="text-gray-400">at</span>
                  <span className="font-bold text-gray-900">
                    {formatDateTime(selectedOrder.created_at).time}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Currency: <strong>{selectedOrder.currency || 'INR'}</strong>
                </div>
              </div>

              {/* Customer Details Card */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white shadow-2xs">
                <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs flex items-center gap-2 border-b border-gray-100 pb-2">
                  <User className="w-4 h-4 text-[#e51b24]" />
                  <span>Customer Contact Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-[11px] font-medium block">Full Name:</span>
                    <p className="text-gray-900 font-bold text-sm mt-0.5">{selectedOrder.customer_name}</p>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[11px] font-medium block">WhatsApp / Phone:</span>
                    <p className="text-gray-900 font-bold font-mono text-sm mt-0.5">{selectedOrder.phone_number}</p>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[11px] font-medium block">Vehicle Model / Compatibility:</span>
                    <p className="text-gray-800 font-medium mt-0.5 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedOrder.vehicle_model || 'Not specified'}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[11px] font-medium block">Payment Status:</span>
                    <p className="font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                      {selectedOrder.payment_status || 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500 text-[11px] font-medium block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>Complete Delivery Address:</span>
                  </span>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200 whitespace-pre-line leading-relaxed font-medium">
                    {selectedOrder.delivery_address}
                  </p>
                </div>

                {selectedOrder.customer_notes && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-500 text-[11px] font-medium block mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span>Special Notes / Fitment Instructions:</span>
                    </span>
                    <p className="text-gray-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 italic leading-relaxed">
                      {selectedOrder.customer_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Ordered Items Breakdown */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white shadow-2xs">
                <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Package className="w-4 h-4 text-[#e51b24]" />
                  <span>Ordered Products</span>
                </h4>

                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{item.product_name}</p>
                          {item.product_sku && (
                            <p className="text-[10px] text-gray-500 font-mono">SKU: {item.product_sku}</p>
                          )}
                          <p className="text-[11px] text-gray-500">
                            Unit Price: {formatRupees(item.unit_price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm text-[#e51b24]">
                            {formatRupees(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic py-2">No product line items attached.</p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="font-bold text-gray-700 uppercase text-xs">Total Order Value:</span>
                  <span className="text-lg font-black text-gray-900">
                    {formatRupees(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="font-bold text-gray-800 uppercase block text-xs">
                    Update Dispatch & Order Status:
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Changes are saved to Supabase immediately.
                  </p>
                </div>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) =>
                    handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="py-2 px-3 rounded-lg bg-white border border-gray-300 font-bold uppercase text-xs focus:outline-none focus:border-[#e51b24] shadow-xs cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>

              <a
                href={createWhatsAppChatUrl(
                  selectedOrder.whatsapp_number || selectedOrder.phone_number,
                  `Hello ${selectedOrder.customer_name}, Bull Gear update regarding your order ${selectedOrder.order_number}:`
                )}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#25D366]/20 transition"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>Chat with Customer on WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
