'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Link as LinkIcon, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface SingleImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  aspectRatioHint?: string;
}

export function SingleImageUpload({
  label,
  value,
  onChange,
  helperText,
  aspectRatioHint,
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        setUploadError(data.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Network error while uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          {label}
        </label>
        {aspectRatioHint && (
          <span className="text-[11px] font-semibold text-[#e51b24] bg-red-50 px-2 py-0.5 rounded">
            {aspectRatioHint}
          </span>
        )}
      </div>

      {value ? (
        /* Preview Card - clicking image triggers file picker to change image */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`relative rounded-xl border p-3 overflow-hidden transition ${
            isDragging ? 'border-[#e51b24] bg-red-50/50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-900 border border-gray-200 cursor-pointer group/img"
            title="Click image to change"
          >
            <Image
              src={value}
              alt={label}
              fill
              className="object-contain transition-transform duration-200 group-hover/img:scale-[1.02]"
              unoptimized={value.startsWith('http')}
            />

            {/* Click to change hover overlay */}
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-3">
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-xs text-white shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Click Image to Change
              </span>
              <span className="text-[10px] text-gray-300">
                or drag and drop a new image here
              </span>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin text-[#e51b24] mb-1" />
                <span className="text-xs font-bold">Uploading new image...</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="text-[11px] text-gray-500 truncate max-w-[220px]" title={value}>
              {value}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-md transition shadow-2xs cursor-pointer"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragging
              ? 'border-[#e51b24] bg-red-50/50 scale-[0.99]'
              : 'border-gray-300 hover:border-[#e51b24] bg-gray-50/50 hover:bg-white'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-8 h-8 text-[#e51b24] animate-spin mb-2" />
              <p className="text-xs font-bold text-gray-700">Uploading image...</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Please wait</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-gray-600 mb-2.5 group-hover:text-[#e51b24] group-hover:scale-105 transition">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-800">
                Click to browse or drag & drop image
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                PNG, JPG, WEBP, or SVG up to 10MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Error display */}
      {uploadError && (
        <p className="text-xs text-red-600 font-medium">{uploadError}</p>
      )}

      {/* Helper text or manual URL toggle */}
      <div className="flex items-center justify-between pt-0.5">
        {helperText && <p className="text-[11px] text-gray-500">{helperText}</p>}
        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="text-[11px] font-semibold text-gray-500 hover:text-[#e51b24] transition flex items-center gap-1 ml-auto cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL input' : 'Or paste image URL'}</span>
        </button>
      </div>

      {/* Manual URL input modal / toggle */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#e51b24]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition cursor-pointer"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
