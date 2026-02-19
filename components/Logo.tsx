"use client"

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeConfig = {
    sm: { height: 28, width: 100 },
    md: { height: 40, width: 160 },
    lg: { height: 80, width: 280 },
  };

  const { height, width } = sizeConfig[size];

  const logoSrc =
    mounted && resolvedTheme === 'dark'
      ? '/assets/washlab-logo-dark.png'
      : '/assets/washlab-logo-light.png';

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src={logoSrc}
        alt="WashLab - Life made simple"
        height={height}
        width={width}
        className="w-auto h-auto"
        priority
      />
    </div>
  );
};
