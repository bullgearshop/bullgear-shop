'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function IntroAnimation() {
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  const [stage, setStage] = useState<'dark' | 'ignite' | 'laser' | 'settle' | 'exit' | 'done'>('dark');

  useEffect(() => {
    // Skip on admin routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    const checkAndPlay = () => {
      try {
        const hasPlayed = sessionStorage.getItem('bullgear_intro_played');
        if (!hasPlayed) {
          setShouldRender(true);
          setStage('dark');

          // Modern cinematic timing choreography
          const t1 = setTimeout(() => setStage('ignite'), 180);
          const t2 = setTimeout(() => setStage('laser'), 850);
          const t3 = setTimeout(() => setStage('settle'), 1500);
          const t4 = setTimeout(() => setStage('exit'), 2450);
          const t5 = setTimeout(() => {
            setStage('done');
            setShouldRender(false);
            sessionStorage.setItem('bullgear_intro_played', 'true');
          }, 3100);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
          };
        }
      } catch {
        // Fallback
      }
    };

    const cleanup = checkAndPlay();

    // Custom replay event for testing anytime
    const handleReplay = () => {
      try {
        sessionStorage.removeItem('bullgear_intro_played');
      } catch {}
      setShouldRender(true);
      setStage('dark');
      setTimeout(() => setStage('ignite'), 180);
      setTimeout(() => setStage('laser'), 850);
      setTimeout(() => setStage('settle'), 1500);
      setTimeout(() => setStage('exit'), 2450);
      setTimeout(() => {
        setStage('done');
        setShouldRender(false);
        try {
          sessionStorage.setItem('bullgear_intro_played', 'true');
        } catch {}
      }, 3100);
    };

    window.addEventListener('bullgear_replay_intro', handleReplay);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('bullgear_replay_intro', handleReplay);
    };
  }, [pathname]);

  const handleSkip = () => {
    setStage('exit');
    setTimeout(() => {
      setStage('done');
      setShouldRender(false);
      try {
        sessionStorage.setItem('bullgear_intro_played', 'true');
      } catch {}
    }, 300);
  };

  if (!shouldRender || stage === 'done') {
    return null;
  }

  const isDark = stage === 'dark';
  const isIgnite = stage !== 'dark';
  const isLaser = stage === 'laser' || stage === 'settle' || stage === 'exit';
  const isSettle = stage === 'settle' || stage === 'exit';
  const isExit = stage === 'exit';

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#000000] flex items-center justify-center overflow-hidden select-none transition-all duration-700 ease-out ${
        isExit ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Crimson Core Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] rounded-full bg-[radial-gradient(circle,rgba(229,27,36,0.3)_0%,rgba(229,27,36,0.06)_45%,rgba(0,0,0,0)_70%)] blur-2xl sm:blur-[100px] pointer-events-none transition-all duration-1000 ${
          isIgnite ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      />

      {/* Subtle Cinematic Film Vignette & Scanlines */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.35)_51%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />

      {/* Modern Minimalist Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-gray-400 hover:text-white hover:border-[#e51b24]/50 text-[10px] font-mono uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg group"
      >
        <span>SKIP</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#e51b24] group-hover:scale-125 transition-transform" />
      </button>

      {/* ======================================================== */}
      {/* DESKTOP 16:9 VIEW (Visible on >= 640px)                  */}
      {/* ======================================================== */}
      <div className="hidden sm:flex relative w-full max-w-5xl aspect-[16/9] items-center justify-center p-6 md:p-10">
        
        {/* Subtle Precision Framing Lines */}
        <div className="absolute inset-x-12 top-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-12 bottom-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-y-10 left-6 w-[1px] bg-gradient-to-b from-transparent via-[#e51b24]/30 to-transparent" />
        <div className="absolute inset-y-10 right-6 w-[1px] bg-gradient-to-b from-transparent via-[#e51b24]/30 to-transparent" />

        <div className="relative w-full h-full flex flex-col items-center justify-center">
          
          {/* Main 16:9 Desktop Image Container */}
          <div
            className={`relative w-full h-full transition-all duration-1000 ease-out flex items-center justify-center ${
              isDark ? 'opacity-0 scale-[0.95] blur-xs' : 'opacity-100 scale-100 blur-0'
            }`}
          >
            <Image
              src="/images/intro-desktop.png"
              alt="Bull Gear Off-Road"
              fill
              priority
              className="object-contain"
            />

            {/* Glowing Red Drop Shadow Accent on Ignite */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
                isIgnite ? 'opacity-85 filter drop-shadow-[0_0_40px_rgba(229,27,36,0.8)]' : 'opacity-0'
              }`}
            />

            {/* Razor-sharp Laser Sweep Streak */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-30 pointer-events-none transition-transform duration-1000 ease-in-out ${
                isLaser ? 'translate-x-[250%]' : '-translate-x-[250%]'
              }`}
            />
          </div>

          {/* Under-Logo Brand Line */}
          <div
            className={`absolute bottom-6 sm:bottom-10 flex items-center gap-3 transition-all duration-700 ease-out ${
              isSettle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e51b24]" />
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.35em] text-gray-300">
              BUILT TO EXPLORE <span className="text-[#e51b24]">BEYOND LIMITS</span>
            </span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e51b24]" />
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MOBILE 9:16 VIEW (Visible on < 640px)                    */}
      {/* ======================================================== */}
      <div className="flex sm:hidden relative w-full h-full max-w-md max-h-[95vh] aspect-[9/16] items-center justify-center p-4">
        
        {/* Subtle Framing Accents */}
        <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#e51b24]/40" />
        <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#e51b24]/40" />
        <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-[#e51b24]/40" />
        <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-[#e51b24]/40" />

        <div className="relative w-full h-full flex flex-col items-center justify-center">
          
          {/* Main 9:16 Mobile Image Container */}
          <div
            className={`relative w-full h-full transition-all duration-1000 ease-out flex items-center justify-center ${
              isDark ? 'opacity-0 scale-[0.95] blur-xs' : 'opacity-100 scale-100 blur-0'
            }`}
          >
            <Image
              src="/images/intro-mobile.png"
              alt="Bull Gear Off-Road"
              fill
              priority
              className="object-contain"
            />

            {/* Glowing Red Drop Shadow Accent on Mobile */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
                isIgnite ? 'opacity-90 filter drop-shadow-[0_0_35px_rgba(229,27,36,0.85)]' : 'opacity-0'
              }`}
            />

            {/* Razor-sharp Laser Sweep Streak Mobile */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-30 pointer-events-none transition-transform duration-1000 ease-in-out ${
                isLaser ? 'translate-x-[250%]' : '-translate-x-[250%]'
              }`}
            />
          </div>

          {/* Under-Logo Brand Line Mobile */}
          <div
            className={`absolute bottom-8 flex items-center gap-2 transition-all duration-700 ease-out px-4 text-center ${
              isSettle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#e51b24]" />
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.25em] text-gray-300">
              BUILT TO EXPLORE <span className="text-[#e51b24]">BEYOND LIMITS</span>
            </span>
            <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#e51b24]" />
          </div>

        </div>

      </div>

      {/* Precision Hairline Red Progress Beam at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className={`h-full bg-gradient-to-r from-[#e51b24] via-red-500 to-[#e51b24] shadow-[0_0_10px_#e51b24] transition-all duration-[2400ms] ease-out ${
            isIgnite ? 'w-full' : 'w-0'
          }`}
        />
      </div>
    </div>
  );
}
