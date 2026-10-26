import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'Bull Gear | Premium Off-Road Accessories & Overland Gear',
  description: 'Engineered for extreme off-road adventures. Premium 4x4 snorkels, heavy-duty roof racks, LED light bars, bumpers, and recovery gear in India.',
  keywords: [
    'offroad accessories',
    '4x4 accessories India',
    'Mahindra Thar snorkel',
    'Thar roof rack',
    'LED light bar',
    'Bull Gear',
    'overland gear',
    'off road bumpers',
  ],
  authors: [{ name: 'Bull Gear India' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Bull Gear',
    title: 'Bull Gear | Premium Automotive & Off-Road Accessories',
    description: 'Ride. Chase. Conquer. Premium 4x4 vehicle armor and overland expedition accessories.',
    images: [
      {
        url: '/images/hero-suv.jpg',
        width: 1200,
        height: 630,
        alt: 'Bull Gear Off-Road',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bull Gear | Premium Off-Road Accessories',
    description: 'Engineered for extreme off-road adventures.',
    images: ['/images/hero-suv.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-white text-gray-900 flex flex-col font-sans antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
