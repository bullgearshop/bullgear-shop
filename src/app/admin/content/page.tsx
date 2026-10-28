'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Video,
  Camera,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { SingleImageUpload } from '@/components/admin/SingleImageUpload';

interface StoryItem {
  src: string;
  alt: string;
}

const DEFAULT_STORIES: StoryItem[] = [
  { src: '/images/gallery-1.jpg', alt: 'River Crossing in Mahindra Thar' },
  { src: '/images/gallery-2.jpg', alt: 'Mountain expedition in Fortuner' },
  { src: '/images/gallery-3.jpg', alt: 'Desert Dune Bashing with Bull Gear' },
  { src: '/images/gallery-4.jpg', alt: 'Night trail with LED Light Bars' },
  { src: '/images/gallery-5.jpg', alt: 'Rock Crawling in Himalayas' },
  { src: '/images/gallery-6.jpg', alt: 'Expedition Rooftop Camp Setup' },
];

const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// Helper to convert any YouTube URL into an embed link
function getEmbedUrl(url: string) {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtube.com/watch')) {
      const parsed = new URL(url);
      const v = parsed.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : url;
    }
    return url;
  } catch {
    return url;
  }
}

export default function AdminContentPage() {
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [stories, setStories] = useState<StoryItem[]>(DEFAULT_STORIES);
  const [loading, setLoading] = useState(true);
  const [savingVideo, setSavingVideo] = useState(false);
  const [savingStories, setSavingStories] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load saved content from API / Supabase / localStorage
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);

        // Fetch settings from API
        const [videoRes, storiesRes] = await Promise.all([
          fetch('/api/settings?key=explore_video_url'),
          fetch('/api/settings?key=community_stories'),
        ]);

        const videoData = await videoRes.json();
        const storiesData = await storiesRes.json();

        if (videoData.success && videoData.value) {
          setVideoUrl(videoData.value);
        } else {
          const localVideo = localStorage.getItem('bullgear_explore_video_url');
          if (localVideo) setVideoUrl(localVideo);
        }

        if (storiesData.success && Array.isArray(storiesData.value) && storiesData.value.length === 6) {
          setStories(storiesData.value);
        } else {
          const localStories = localStorage.getItem('bullgear_community_stories');
          if (localStories) {
            const parsed = JSON.parse(localStories);
            if (Array.isArray(parsed) && parsed.length === 6) {
              setStories(parsed);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load content settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVideo(true);

    try {
      localStorage.setItem('bullgear_explore_video_url', videoUrl);

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'explore_video_url',
          value: videoUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'YouTube URL updated successfully! Video is live on homepage.');
      } else {
        showToast('error', data.error || 'Saved locally, but failed to sync to database.');
      }
    } catch {
      showToast('error', 'Network error saving YouTube URL');
    } finally {
      setSavingVideo(false);
    }
  };

  const handleStoryImageChange = (index: number, newSrc: string) => {
    const updated = [...stories];
    updated[index] = { ...updated[index], src: newSrc };
    setStories(updated);
  };

  const handleStoryAltChange = (index: number, newAlt: string) => {
    const updated = [...stories];
    updated[index] = { ...updated[index], alt: newAlt };
    setStories(updated);
  };

  const handleSaveStories = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStories(true);

    try {
      localStorage.setItem('bullgear_community_stories', JSON.stringify(stories));

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'community_stories',
          value: stories,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'All 6 Community Stories photos updated successfully!');
      } else {
        showToast('error', data.error || 'Saved locally, but failed to sync to database.');
      }
    } catch {
      showToast('error', 'Network error saving stories');
    } finally {
      setSavingStories(false);
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-semibold shadow-md transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e51b24]/10 text-[#e51b24] text-[11px] font-bold uppercase tracking-wider mb-2">
         
          <span>Homepage Media & Story Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          Built To Explore & Community Stories
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Update the &quot;Built To Explore Beyond Limits&quot; video and manage the 6 customer expedition photos in one place.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#e51b24] mb-2" />
          <p className="text-xs font-semibold uppercase tracking-wider">Loading homepage content...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* SECTION 1: Built To Explore Beyond Limits (YouTube URL) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#e51b24] flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-gray-900">
                    Built To Explore — Beyond Limits
                  </h2>
                  <p className="text-xs text-gray-500">
                    Configure the YouTube video URL triggered when visitors click &quot;Watch the Story&quot;.
                  </p>
                </div>
              </div>

              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#e51b24] font-semibold hover:underline self-start sm:self-auto"
              >
                <span>Test Video Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  YouTube Video URL or Video ID *
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24] shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={savingVideo}
                    className="px-6 py-2.5 bg-[#e51b24] hover:bg-[#c8141d] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#e51b24]/20 cursor-pointer disabled:opacity-50"
                  >
                    {savingVideo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Video</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Supports full YouTube URLs (e.g. <code>https://www.youtube.com/watch?v=...</code>) or short links (<code>https://youtu.be/...</code>).
                </p>
              </div>

              {/* Live Preview Embed */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                  Live Preview:
                </label>
                <div className="relative aspect-video max-w-xl rounded-xl overflow-hidden bg-black border border-gray-200 shadow-md">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title="Built to Explore Beyond Limits Video Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                      Enter a valid YouTube URL to preview
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* SECTION 2: Community Stories (6 Images) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-gray-900">
                    Community Stories — 6 Expedition Photos
                  </h2>
                  <p className="text-xs text-gray-500">
                    Upload and manage the 6 featured customer off-road photos shown in the &quot;Real Adventures, Real People&quot; section.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveStories}
                disabled={savingStories}
                className="px-6 py-2.5 bg-[#e51b24] hover:bg-[#c8141d] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#e51b24]/20 cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                {savingStories ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save All 6 Stories</span>
              </button>
            </div>

            <form onSubmit={handleSaveStories} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                          Story Slot #{index + 1}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">Card {index + 1} of 6</span>
                      </div>

                      {/* Image Preview & Upload */}
                      <SingleImageUpload
                        label={`Photo ${index + 1}`}
                        value={story.src}
                        onChange={(url) => handleStoryImageChange(index, url)}
                        helperText="Expedition photo or customer rig"
                        aspectRatioHint="16:9 or 4:3"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                        Caption / Trail Tag
                      </label>
                      <input
                        type="text"
                        value={story.alt}
                        onChange={(e) => handleStoryAltChange(index, e.target.value)}
                        placeholder="e.g. River Crossing in Mahindra Thar"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#e51b24]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={savingStories}
                  className="px-8 py-3 bg-[#e51b24] hover:bg-[#c8141d] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#e51b24]/30 cursor-pointer disabled:opacity-50"
                >
                  {savingStories ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save All 6 Stories</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
