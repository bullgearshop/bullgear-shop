import React from 'react';
import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { getProducts, getCategories, getOrders } from '@/lib/db';
import { formatRupees, createWhatsAppChatUrl } from '@/lib/whatsapp';

export default async function AdminDashboardPage() {
  const [products, categories, orders] = await Promise.all([
    getProducts(),
    getCategories(),
    getOrders(),
  ]);

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock_status === 'limited_stock');
  const outOfStockProducts = products.filter((p) => p.stock_status === 'out_of_stock');
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'pending');
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const recentOrders = orders.slice(0, 5);
  const bestSellers = products.filter((p) => p.is_best_seller);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Armory Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time telemetry, inventory status, and incoming WhatsApp order requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-[#e51b24] hover:bg-[#c8141d] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-[#e51b24]/20"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-300 transition shadow-xs"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Orders</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{totalOrders}</div>
            <div className="text-[11px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{pendingOrders.length} pending verification</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-[#e51b24]">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Order Volume</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {formatRupees(totalRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 font-semibold block">
              Active WhatsApp funnel
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Catalogued Products</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{totalProducts}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Across {totalCategories} categories
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Inventory Stock Alert */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Inventory Status</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {lowStockProducts.length + outOfStockProducts.length}
            </div>
            <div className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{lowStockProducts.length} low, {outOfStockProducts.length} out of stock</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-[#e51b24]">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-[#e51b24] rounded-sm" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                Recent WhatsApp Order Requests
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#e51b24] hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle Model</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#e51b24]">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div>{order.customer_name}</div>
                      <div className="text-[11px] text-gray-500">{order.phone_number}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {order.vehicle_model || 'Universal'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {formatRupees(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.order_status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : order.order_status === 'processing'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={createWhatsAppChatUrl(
                          order.whatsapp_number || order.phone_number,
                          `Hello ${order.customer_name}, Bull Gear update regarding your order ${order.order_number}:`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366]/15 text-emerald-800 hover:bg-[#25D366] hover:text-black transition text-[11px] font-bold"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        <span>Chat</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers & Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Best Selling Armor
              </h2>
              <span className="text-[11px] text-[#e51b24] font-bold">{bestSellers.length} items</span>
            </div>

            <div className="divide-y divide-gray-100 mt-2">
              {bestSellers.slice(0, 4).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</h3>
                    <p className="text-[11px] text-gray-500">{p.category_name} • {formatRupees(p.price)}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                    {p.stock_quantity} in stock
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Quick Management Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/products"
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition text-center font-semibold text-gray-700"
              >
                Inventory
              </Link>
              <Link
                href="/admin/categories"
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition text-center font-semibold text-gray-700"
              >
                Categories
              </Link>
              <Link
                href="/admin/banners"
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition text-center font-semibold text-gray-700"
              >
                Hero Banners
              </Link>
              <Link
                href="/admin/settings"
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition text-center font-semibold text-gray-700"
              >
                WhatsApp Config
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
