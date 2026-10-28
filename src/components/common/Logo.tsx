import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'white' | 'black';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'white', className = '', size = 'md' }: LogoProps) {
  // Dimensions based on size: Red bull logo is a bit bigger, and text is reduced smaller
  const iconDimensions = {
    sm: { width: 44, height: 38, textWidth: 95, textHeight: 24 },
    md: { width: 52, height: 46, textWidth: 112, textHeight: 28 },
    lg: { width: 66, height: 58, textWidth: 140, textHeight: 35 },
  }[size];

  const textLogoSrc = variant === 'black' 
    ? '/images/Bull-Gear-logo3.png' 
    : '/images/Bull-Gear-logo2.png';

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02] ${className}`}
      aria-label="Bull Gear - Home"
    >
      {/* Main Red Horn Icon (Bull-Gear-logo1.png) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/images/Bull-Gear-logo1.png"
          alt="Bull Gear Horns"
          width={iconDimensions.width}
          height={iconDimensions.height}
          priority
          className="object-contain filter drop-shadow-[0_0_8px_rgba(229,27,36,0.4)]"
        />
      </div>

      {/* Brand Text Logo on the RIGHT SIDE (NOT at the bottom) */}
      <div className="relative shrink-0 flex items-center">
        <Image
          src={textLogoSrc}
          alt="BULL GEAR"
          width={iconDimensions.textWidth}
          height={iconDimensions.textHeight}
          priority
          className="object-contain"
        />
      </div>
    </Link>
  );
}
