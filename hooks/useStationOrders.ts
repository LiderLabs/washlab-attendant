'use client';

import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";

export type OrderStatus = 
  | "pending"
  | "in_progress"
  | "ready_for_pickup"
  | "delivered"
  | "completed"
  | "cancelled";

export interface StationOrderFilters {
  status?: OrderStatus;
}

/**
 * Hook to fetch and manage station orders
 * Provides paginated order list with filtering
 */
export function useStationOrders(
  stationToken: string | null,
  filters?: StationOrderFilters
) {
  const result = usePaginatedQuery(
    api.stations.getStationOrders,
    stationToken ? {
      stationToken,
      status: filters?.status,
    } : 'skip',
    { initialNumItems: 20 }
  );

  return {
    orders: result.results ?? [],
    isLoading: result.status === 'LoadingFirstPage' || result.status === 'LoadingMore',
    loadMore: result.loadMore,
    hasMore: result.status === 'CanLoadMore',
  };
}

/**
 * Hook to fetch single order details
 */
export function useStationOrder(
  stationToken: string | null,
  orderId: Id<'orders'> | null
) {
  const order = useQuery(
    api.stations.getStationOrderDetails,
    stationToken && orderId ? {
      stationToken,
      orderId,
    } : 'skip'
  );

  return {
    order: order ?? null,
    isLoading: order === undefined && stationToken !== null && orderId !== null,
  };
}
