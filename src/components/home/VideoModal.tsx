'use client';

import React from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#10131a] border border-[#222838] rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1f2533] bg-[#0c0e14]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#e51b24]/20 text-[#e51b24]">
              <Play className="w-4 h-4 fill-[#e51b24]" />
            </span>
            <span className="font-bold text-white text-sm uppercase tracking-wider">
              Bull Gear — The Expedition Story
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1f2c] transition"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {videoUrl && videoUrl.includes('youtube.com') ? (
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Bull Gear Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e51b24]/20 flex items-center justify-center text-[#e51b24] mb-4">
                <Play className="w-8 h-8 fill-[#e51b24] ml-1" />
              </div>
              <h3 className="text-lg font-bold text-white">Bull Gear Off-Road Cinema</h3>
              <p className="text-sm text-gray-400 max-w-md mt-2">
                Manage and link your Cloudinary 4K expedition video directly from the Admin Media Dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
