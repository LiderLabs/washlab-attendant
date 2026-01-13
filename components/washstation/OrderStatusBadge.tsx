'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type OrderStatus =
  | "pending_dropoff"
  | "checked_in"
  | "sorting"
  | "washing"
  | "drying"
  | "folding"
  | "ready"
  | "completed"
  | "cancelled"
  // Legacy statuses for backward compatibility
  | "pending"
  | "in_progress"
  | "ready_for_pickup"
  | "delivered"
  | "pending"
  | "in_progress"
  | "ready_for_pickup"
  | "delivered"
  | "completed"
  | "cancelled"

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  pending_dropoff: {
    label: "Pending Drop-off",
    variant: "outline",
  },
  checked_in: {
    label: "Checked In",
    variant: "default",
  },
  sorting: {
    label: "Sorting",
    variant: "default",
  },
  washing: {
    label: "Washing",
    variant: "default",
  },
  drying: {
    label: "Drying",
    variant: "default",
  },
  folding: {
    label: "Folding",
    variant: "default",
  },
  ready: {
    label: "Ready",
    variant: "secondary",
  },
  completed: {
    label: "Completed",
    variant: "default",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
  },
  // Legacy statuses
  pending: {
    label: "Pending",
    variant: "outline",
  },
  in_progress: {
    label: "In Progress",
    variant: "default",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    variant: "secondary",
  },
  delivered: {
    label: "Delivered",
    variant: "secondary",
  },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={cn('font-medium', className)}>
      {config.label}
    </Badge>
  );
}
