'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type OrderStatus =
  | 'pending'
  | 'in_progress'
  | 'ready_for_pickup'
  | 'delivered'
  | 'completed'
  | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: {
    label: 'Pending',
    variant: 'outline',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'default',
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    variant: 'secondary',
  },
  delivered: {
    label: 'Delivered',
    variant: 'secondary',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={cn('font-medium', className)}>
      {config.label}
    </Badge>
  );
}
