"use client"

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTheme } from 'next-themes';


interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {

  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'h-[80px]',  // mobile / small
  md: 'h-[100px]',  // default desktop
  lg: 'h-[200px]',  // large
  };

  // Choose logo depending on theme
  const logoSrc =
    theme === 'dark'
      ? '/assets/washlab logo-dark.png'
      : '/assets/washlab logo-light.png';

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src={logoSrc}
        alt="WashLab - Life made simple"
        className={cn(sizeClasses[size], 'w-auto')}
  height={size === 'sm' ? 40 : size === 'md' ? 56 : 80}  // exact pixel height
      width={size === 'sm' ? 150 : size === 'md' ? 250 : 280}
      />
    </div>
  );
};



