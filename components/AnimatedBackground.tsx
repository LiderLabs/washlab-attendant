import { useEffect, useState } from 'react';
import { Shirt, Droplets, Sparkles } from 'lucide-react';

// SVG laundry icons as components
const TShirtIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <path d="M6 4L4 6V8L2 9V12L4 11V20H20V11L22 12V9L20 8V6L18 4H15L12 7L9 4H6Z" />
  </svg>
);

const HangerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2C13.1046 2 14 2.89543 14 4C14 4.73835 13.5978 5.37778 13 5.73205V7L21 14V16H3V14L11 7V5.73205C10.4022 5.37778 10 4.73835 10 4C10 2.89543 10.8954 2 12 2Z" />
  </svg>
);

const PantsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <path d="M5 3H19V6L17 22H13L12 10L11 22H7L5 6V3Z" />
  </svg>
);

const SockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2V8C8 10 6 12 6 14C6 18 10 20 14 20C18 20 20 18 20 14C20 10 16 8 16 8V2H8Z" />
  </svg>
);

const BubbleIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full bg-current opacity-30 ${className}`} />
);

interface FloatingItem {
  id: number;
  type: 'shirt' | 'hanger' | 'pants' | 'sock' | 'bubble' | 'droplet' | 'sparkle';
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const AnimatedBackground = () => {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const types: FloatingItem['type'][] = ['shirt', 'hanger', 'pants', 'sock', 'bubble', 'droplet', 'sparkle'];
    const newItems: FloatingItem[] = [];
    
    for (let i = 0; i < 20; i++) {
      newItems.push({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 20,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.15 + 0.05,
      });
    }
    setItems(newItems);
  }, []);

  const renderIcon = (item: FloatingItem) => {
    const iconClass = "text-wash-blue";
    
    switch (item.type) {
      case 'shirt':
        return <TShirtIcon className={iconClass} />;
      case 'hanger':
        return <HangerIcon className={iconClass} />;
      case 'pants':
        return <PantsIcon className={iconClass} />;
      case 'sock':
        return <SockIcon className={iconClass} />;
      case 'bubble':
        return <div className="w-full h-full rounded-full border-2 border-wash-blue/30 bg-wash-blue/10" />;
      case 'droplet':
        return <Droplets className={iconClass} />;
      case 'sparkle':
        return <Sparkles className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating laundry icons */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            opacity: item.opacity,
            animation: `float ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {renderIcon(item)}
        </div>
      ))}

      {/* Large decorative bubbles */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full border-2 border-wash-blue/10 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full border-2 border-wash-blue/10 animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-40 left-20 w-24 h-24 rounded-full border-2 border-wash-blue/10 animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-20 right-40 w-12 h-12 rounded-full border-2 border-wash-blue/10 animate-float-slow" style={{ animationDelay: '1s' }} />
    </div>
  );
};
