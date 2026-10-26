import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'white' | 'black';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'white', className = '', size = 'md' }: LogoProps) {
  // Dimensions based on size
  const iconDimensions = {
    sm: { width: 36, height: 32, textWidth: 110, textHeight: 28 },
    md: { width: 44, height: 38, textWidth: 135, textHeight: 34 },
    lg: { width: 56, height: 48, textWidth: 165, textHeight: 42 },
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
