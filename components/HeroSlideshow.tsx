'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
  '/hero-laundry.jpg',
  '/laundry-hero-1.jpg',
  '/laundry-hero-2.jpg',
  '/stacked-clothes.jpg'
];

export const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Full-screen slideshow images */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image 
            src={img as string} 
            alt="" 
            className="w-full h-full object-cover"
            fill
            priority={index === 0}
          />
        </div>
      ))}
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-primary/20" />
    </div>
  );
};
