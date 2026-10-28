'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';

function getEmbedUrl(url: string, autoplay = true) {
  if (!url) return '';
  try {
    let id = '';
    if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      const parsed = new URL(url);
      id = parsed.searchParams.get('v') || '';
    } else if (url.includes('youtube.com/embed/')) {
      id = url.split('youtube.com/embed/')[1]?.split('?')[0];
    }
    if (id) {
      return `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? '1' : '0'}&rel=0`;
    }
    return url;
  } catch {
    return url;
  }
}

export function AdventureBanner() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  useEffect(() => {
    // Check localStorage first for instant hydration
    try {
      const local = localStorage.getItem('bullgear_explore_video_url');
      if (local) setVideoUrl(local);
    } catch {}

    // Fetch from settings API
    fetch('/api/settings?key=explore_video_url')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.value) {
          setVideoUrl(data.value);
        }
      })
      .catch(() => {});
  }, []);

  const embedUrl = getEmbedUrl(videoUrl, true);

  return (
    <section className="relative w-full py-12 sm:py-16 bg-white overflow-hidden border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card with Background Image or Inline Video Player */}
        <div className="relative rounded-xl overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-end border border-gray-200 shadow-sm bg-black">
          {isPlaying ? (
            /* Inline Video Player playing directly inside this card */
            <div className="relative w-full h-[380px] sm:h-[460px] bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Built to Explore Beyond Limits"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  Video source unavailable.
                </div>
              )}

              {/* Close Button to return to Card */}
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-[#e51b24] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer border border-white/20"
                aria-label="Close video and return to banner"
              >
                <X className="w-4 h-4" />
                <span>Close Video</span>
              </button>
            </div>
          ) : (
            /* Original Banner Content */
            <>
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

                {/* Watch Story Action playing inside card */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
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
            </>
          )}
        </div>

      </div>
    </section>
  );
}
