'use client';

import React, { useEffect } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title = 'Confirm Deletion',
  itemName,
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  isDeleting = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-40"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          {/* Centered Warning Icon */}
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-[#e51b24] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Trash2 className="w-7 h-7" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight mb-2">
            {title}
          </h3>

          {/* Description Message */}
          <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">
            {message}
          </p>

          {/* Optional Item Name Display */}
          {itemName && (
            <div className="mb-6 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 break-words">
              &quot;{itemName}&quot;
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#e51b24] hover:bg-[#c8141d] text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md shadow-[#e51b24]/20 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
