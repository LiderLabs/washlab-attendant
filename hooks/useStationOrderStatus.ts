'use client';

import { useMutation } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { useToast } from '@/hooks/use-toast';

export type OrderStatus = 
  | "pending"
  | "in_progress"
  | "ready_for_pickup"
  | "delivered"
  | "completed"
  | "cancelled";

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
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
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
