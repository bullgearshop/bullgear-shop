import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug, getProducts } from '@/lib/db';
import { ProductDetailView } from '@/components/product/ProductDetailView';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((prod) => ({
    slug: prod.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Bull Gear',
    };
  }

  const primaryImage = product.images?.[0]?.image_url || '';

  return {
    title: product.seo_title || `${product.name} | Bull Gear 4x4 Accessories`,
    description: product.seo_description || product.short_description || product.description,
    openGraph: {
      title: product.name,
      description: product.short_description || product.description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  // Generate Google Product JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img) => img.image_url) || [],
    description: product.description,
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Bull Gear',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.sale_price ?? product.price,
      availability:
        product.stock_status === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={product} relatedProducts={related} />
    </>
  );
}
