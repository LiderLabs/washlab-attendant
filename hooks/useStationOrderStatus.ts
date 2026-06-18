'use client';
import { useMutation } from 'convex/react';
import { api } from "@jordan6699/washlab-backend/api";
import { Id } from "@jordan6699/washlab-backend/dataModel";
import { useToast } from '@/hooks/use-toast';
import { enqueue } from '@/lib/offlineOutbox';
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
  | "delivered";
/**
 * Hook to update order status
 * Provides mutation for updating order status with error handling
 */
export function useStationOrderStatus(stationToken: string | null) {
  const { toast } = useToast();
  const updateStatus = useMutation(api.stations.updateStationOrderStatus);
  const changeStatus = async (
    orderId: Id<'orders'>,
    newStatus: OrderStatus,
    notes?: string,
    attendantId?: Id<'attendants'>,
    attendanceId?: Id<'attendanceLogs'>
  ) => {
    if (!stationToken) {
      toast({
        title: "Error",
        description: "Station session not available",
        variant: "destructive",
      });
      return false;
    }

    // Offline: queue to outbox — UI already updated optimistically in OrderRowExpander
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueue('updateOrderStatus', {
        stationToken,
        orderId,
        newStatus,
        notes,
        attendantId,
        attendanceId,
      } as Record<string, unknown>);
      toast({
        title: "Saved offline",
        description: 'Status change queued — will sync when connection returns.',
      });
      return true;
    }

    try {
      await updateStatus({
        stationToken,
        orderId,
        newStatus,
        notes,
        attendantId,
        attendanceId,
      });
      toast({
        title: "Success",
        description: 'Order status updated to ' + newStatus.replace('_', ' '),
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
      return false;
    }
  };
  return {
    changeStatus,
  };
}
