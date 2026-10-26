'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { VideoModal } from './VideoModal';

export function AdventureBanner() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section className="relative w-full py-14 sm:py-20 bg-white overflow-hidden border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Card with Background Image */}
          <div className="relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[440px] flex items-center border border-gray-200 shadow-xl">
            {/* Background Image */}
            <Image
              src="/images/adventure-banner.jpg"
              alt="Built to Explore Beyond Limits"
              fill
              className="object-cover object-center"
            />

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 w-full p-8 sm:p-12 lg:p-16 flex flex-col items-start justify-center max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase leading-[1.1]">
                Built To Explore <br />
                <span className="text-[#e51b24] red-glow">Beyond Limits</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-200 mt-4 font-normal">
                More than accessories, it&apos;s a lifestyle.
              </p>

              {/* Watch Story Action */}
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="mt-8 inline-flex items-center gap-3.5 group cursor-pointer"
                aria-label="Watch the Bull Gear story"
              >
                <div className="w-12 h-12 rounded-full bg-[#e51b24] group-hover:bg-[#ff2430] flex items-center justify-center text-white shadow-lg shadow-[#e51b24]/40 transition-transform group-hover:scale-110">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-[#e51b24] transition-colors">
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
