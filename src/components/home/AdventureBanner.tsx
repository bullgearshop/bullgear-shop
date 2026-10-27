'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { VideoModal } from './VideoModal';

export function AdventureBanner() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section className="relative w-full py-12 sm:py-16 bg-white overflow-hidden border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Card with Background Image - subtle corner radius */}
          <div className="relative rounded-lg overflow-hidden min-h-[380px] sm:min-h-[440px] flex flex-col justify-end border border-gray-200 shadow-xs">
            {/* Background Image */}
            <Image
              src="/images/adventure-banner.jpg"
              alt="Built to Explore Beyond Limits"
              fill
              className="object-cover object-center"
              priority
            />

            {/* Dark gradient overlay for text readability on left/bottom while keeping vehicle visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent sm:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

            {/* Content Container positioned near bottom-left */}
            <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12 max-w-xl">
              <h2 className="text-[21px] sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight uppercase leading-[1.15]">
                Built To Explore <br />
                <span className="text-[#e51b24]">Beyond Limits</span>
              </h2>
              <p className="text-xs sm:text-base text-gray-200 mt-2.5 font-normal max-w-md leading-relaxed">
                More than accessories, it&apos;s a lifestyle. Engineered for those who dare to venture off the beaten path.
              </p>

              {/* Watch Story Action below description */}
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="mt-6 inline-flex items-center gap-3.5 group cursor-pointer"
                aria-label="Watch the Bull Gear story"
              >
                <div className="w-11 h-11 rounded-full bg-[#e51b24] group-hover:bg-[#c8141d] flex items-center justify-center text-white shadow-md shadow-[#e51b24]/30 transition-transform group-hover:scale-105">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white group-hover:text-[#e51b24] transition-colors">
                  Watch the Story
                </span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />
    </>
  );
}
