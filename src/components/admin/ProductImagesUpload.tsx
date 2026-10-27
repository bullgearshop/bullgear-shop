'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  Star,
  Loader2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  ArrowUpDown,
} from 'lucide-react';
import { ProductImage } from '@/lib/types';

interface ProductImagesUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productId?: string;
}

const MAX_IMAGES = 6;

export function ProductImagesUpload({
  images,
  onChange,
  productId = 'temp-prod',
}: ProductImagesUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mainImage = images[0];
  const galleryImages = images.slice(1);
  const remainingSlots = MAX_IMAGES - images.length;

  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.url) {
      throw new Error(data.error || `Failed to upload ${file.name}`);
    }

    return data.url;
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    if (files.length === 0) {
      setUploadError('Please select valid image files (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (remainingSlots <= 0) {
      setUploadError(`Maximum ${MAX_IMAGES} images reached (1 Main + 5 Gallery). Remove an image before adding more.`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setUploadError(`Only ${remainingSlots} more image(s) can be added (Maximum 6 total). Additional files were omitted.`);
    } else {
      setUploadError('');
    }

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit.`);
        }
        const url = await uploadSingleFile(file);
        uploadedUrls.push(url);
      }

      const newProductImages: ProductImage[] = uploadedUrls.map((url, i) => {
        const order = images.length + i + 1;
        return {
          id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          product_id: productId,
          image_url: url,
          alt_text: `Product image ${order}`,
          display_order: order,
          is_primary: images.length === 0 && i === 0,
        };
      });

      const updated = [...images, ...newProductImages].slice(0, MAX_IMAGES);
      // Guarantee first image has is_primary true
      const normalized = updated.map((img, idx) => ({
        ...img,
        display_order: idx + 1,
        is_primary: idx === 0,
      }));

      onChange(normalized);
    } catch (err: any) {
      setUploadError(err.message || 'Error occurred while uploading image(s).');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetMain = (targetIndex: number) => {
    if (targetIndex === 0 || targetIndex >= images.length) return;
    const targetImage = images[targetIndex];
    const rest = images.filter((_, idx) => idx !== targetIndex);
    const reordered = [targetImage, ...rest].map((img, idx) => ({
      ...img,
      display_order: idx + 1,
      is_primary: idx === 0,
    }));
    onChange(reordered);
  };

  const handleRemoveImage = (targetIndex: number) => {
    const updated = images.filter((_, idx) => idx !== targetIndex).map((img, idx) => ({
      ...img,
      display_order: idx + 1,
      is_primary: idx === 0,
    }));
    onChange(updated);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInputValue.trim()) return;

    if (remainingSlots <= 0) {
      setUploadError(`Maximum ${MAX_IMAGES} images reached. Remove an image to add a new one.`);
      return;
    }

    const newImg: ProductImage = {
      id: `img-${Date.now()}`,
      product_id: productId,
      image_url: urlInputValue.trim(),
      alt_text: `Product image ${images.length + 1}`,
      display_order: images.length + 1,
      is_primary: images.length === 0,
    };

    const updated = [...images, newImg].slice(0, MAX_IMAGES);
    const normalized = updated.map((img, idx) => ({
      ...img,
      display_order: idx + 1,
      is_primary: idx === 0,
    }));

    onChange(normalized);
    setUrlInputValue('');
    setShowUrlInput(false);
    setUploadError('');
  };

  return (
    <div className="space-y-4">
      {/* Header bar with Count Indicator */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-100">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-900">
            Product Images (Max 6 Images)
          </label>
          <p className="text-[11px] text-gray-500 mt-0.5">
            1 Main Image (Cover photo) + up to 5 additional gallery photos
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold text-gray-700">
          <span>{images.length}</span>
          <span className="text-gray-400">/</span>
          <span>{MAX_IMAGES}</span>
          <span className="text-[10px] uppercase text-gray-500 ml-1 font-semibold">Images</span>
        </div>
      </div>

      {/* Grid of 6 image slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, idx) => {
          const isMain = idx === 0;
          return (
            <div
              key={img.id || idx}
              className={`relative rounded-xl border overflow-hidden p-2 bg-white transition-all shadow-xs group ${
                isMain
                  ? 'border-[#e51b24] ring-2 ring-[#e51b24]/20'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                {isMain ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e51b24] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    <span>Main Cover</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Gallery {idx}
                  </span>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-sm"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Image Preview */}
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                <Image
                  src={img.image_url}
                  alt={img.alt_text || `Product image ${idx + 1}`}
                  fill
                  className="object-contain"
                  unoptimized={img.image_url.startsWith('http')}
                />
              </div>

              {/* Card Footer: Set as Main or indicator */}
              <div className="mt-2 flex items-center justify-between">
                {isMain ? (
                  <span className="text-[10px] font-bold text-[#e51b24] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Primary Storefront Cover</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetMain(idx)}
                    className="text-[10px] font-bold text-gray-600 hover:text-[#e51b24] transition flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Star className="w-3 h-3" />
                    <span>Set as Main Cover</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty / Add Slots if remaining < 6 */}
        {remainingSlots > 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px] ${
              isDragging
                ? 'border-[#e51b24] bg-red-50/50 scale-[0.99]'
                : 'border-gray-300 hover:border-[#e51b24] bg-gray-50/70 hover:bg-white'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2">
                <Loader2 className="w-6 h-6 text-[#e51b24] animate-spin mb-1.5" />
                <span className="text-[11px] font-bold text-gray-700">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-gray-600 mb-1.5 group-hover:text-[#e51b24] group-hover:scale-105 transition">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-800">
                  {images.length === 0 ? 'Upload Main Image' : '+ Add Gallery Image'}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input supporting multiple selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Error message */}
      {uploadError && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Manual URL toggle if user needs to paste link */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-gray-400">
          Tip: You can select up to 6 images at once or drag & drop.
        </span>

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => setShowUrlInput((prev) => !prev)}
            className="text-[11px] font-semibold text-gray-500 hover:text-[#e51b24] transition flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL' : 'Or add via image URL'}</span>
          </button>
        )}
      </div>

      {showUrlInput && remainingSlots > 0 && (
        <form onSubmit={handleAddUrl} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="https://example.com/product-view.jpg"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#e51b24]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition cursor-pointer"
          >
            Add Image
          </button>
        </form>
      )}
    </div>
  );
}
