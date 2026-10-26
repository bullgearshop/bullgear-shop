import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera } from 'lucide-react';

export function CustomerGallery() {
  const galleryPhotos = [
    { src: '/images/gallery-1.jpg', alt: 'River Crossing in Mahindra Thar' },
    { src: '/images/gallery-2.jpg', alt: 'Mountain expedition in Fortuner' },
    { src: '/images/gallery-3.jpg', alt: 'Desert Dune Bashing with Bull Gear' },
    { src: '/images/gallery-4.jpg', alt: 'Night trail with LED Light Bars' },
    { src: '/images/gallery-5.jpg', alt: 'Rock Crawling in Himalayas' },
    { src: '/images/gallery-6.jpg', alt: 'Expedition Rooftop Camp Setup' },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#f8fafc] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e51b24]/10 border border-[#e51b24]/20 text-[#e51b24] text-[11px] font-bold uppercase tracking-wider mb-4">
              <Camera className="w-3.5 h-3.5" />
              <span>Community Stories</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase leading-[1.1]">
              Real Adventures <br />
              <span className="text-[#e51b24]">Real People</span>
            </h2>

            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              See how our customers gear up and conquer extreme trails across India with Bull Gear armor and recovery systems.
            </p>

            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition group"
            >
              <span>View Gallery</span>
              <ArrowRight className="w-4 h-4 text-[#e51b24] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Column: 6 Photos Grid (expanded) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {galleryPhotos.map((photo, index) => (
              <div
                key={index}
                className="group relative h-36 sm:h-44 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-xs hover:shadow-lg transition-all"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end">
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    {photo.alt}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
