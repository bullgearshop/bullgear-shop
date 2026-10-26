import React from 'react';
import Link from 'next/link';
import { Globe, CheckCircle2, ExternalLink } from 'lucide-react';
import { getProducts, getCategories } from '@/lib/db';

export default async function AdminSeoPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          Technical SEO & Indexing Console
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review dynamic sitemap, canonical slug mappings, and structured JSON-LD schemas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-sm">Dynamic XML Sitemap</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Automatically generates valid schema-compliant XML sitemaps for search engine crawlers.
          </p>
          <Link
            href="/sitemap.xml"
            target="_blank"
            className="text-xs font-bold text-[#e51b24] hover:underline flex items-center gap-1"
          >
            <span>View /sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-sm">Robots Protocol</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
              CONFIGURED
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Allows public storefront pages while disallowing indexing of admin portal routes.
          </p>
          <Link
            href="/robots.txt"
            target="_blank"
            className="text-xs font-bold text-[#e51b24] hover:underline flex items-center gap-1"
          >
            <span>View /robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Indexable Routes List */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Current Indexable Product Slugs ({products.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100 text-xs">
          {products.map((p) => (
            <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition">
              <div>
                <span className="font-bold text-gray-900">{p.name}</span>
                <span className="text-gray-500 block font-mono text-[11px]">
                  /products/{p.slug}
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>JSON-LD Product Schema Ready</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
