'use client';

import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";

export interface StationStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  ordersByStatus: {
    pending: number;
    in_progress: number;
    ready_for_pickup: number;
    delivered: number;
    completed: number;
    cancelled: number;
  };
  averageOrderValue: number;
}

/**
 * Hook to fetch station dashboard statistics
 */
export function useStationStats(
  stationToken: string | null,
  startDate?: number,
  endDate?: number
) {
  const stats = useQuery(
    api.stations.getStationStats,
    stationToken ? {
      stationToken,
      startDate,
      endDate,
    } : 'skip'
  ) as StationStats | undefined;

  return {
    stats,
    isLoading: stats === undefined && stationToken !== null,
  };
}
