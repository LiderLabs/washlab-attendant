import { ORDER_STAGES, OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const stage = ORDER_STAGES.find((s) => s.status === status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium text-white',
        sizeClasses[size],
        stage?.color
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
      {stage?.label || status}
    </span>
  );
};
