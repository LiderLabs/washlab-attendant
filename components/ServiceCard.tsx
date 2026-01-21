import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
  price?: string;
}

export const ServiceCard = ({
  icon: Icon,
  title,
  description,
  isSelected,
  onClick,
  price,
}: ServiceCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left w-full',
        'hover:shadow-lg hover:-translate-y-1',
        isSelected
          ? 'border-wash-blue bg-wash-blue/5 shadow-glow'
          : 'border-border bg-card hover:border-wash-blue/50'
      )}
    >
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300',
        isSelected
          ? 'bg-gradient-to-br from-wash-blue to-wash-orange text-primary-foreground'
          : 'bg-muted text-muted-foreground group-hover:bg-wash-blue/10 group-hover:text-wash-blue'
      )}>
        <Icon className="w-7 h-7" />
      </div>
      
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      
      {price && (
        <div className="mt-4 pt-4 border-t border-border">
          <span className="text-wash-blue font-semibold">{price}</span>
        </div>
      )}

      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-wash-blue flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
