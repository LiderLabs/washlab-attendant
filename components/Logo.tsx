'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <Image 
        src="/washlab-logo.png" 
        alt="WashLab - Life made simple" 
        width={120}
        height={40}
        className={cn(sizeClasses[size], 'w-auto')}
        priority
      />
    </div>
  );
};
