'use client';
import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { cacheWrite, cacheRead } from '@/hooks/useOfflineCache';

const defaultStats = {
  totalOrders: 0,
  totalRevenue: 0,
  ordersByStatus: {
    pending: 0, in_progress: 0, ready: 0, completed: 0,
    pending_dropoff: 0, checked_in: 0, sorting: 0,
    washing: 0, drying: 0, folding: 0, cancelled: 0,
    ready_for_pickup: 0, delivered: 0,
  },
  averageOrderValue: 0,
  completionRate: 0,
};

export function useStationStats(
  stationToken: string | null,
  startDate?: number,
  endDate?: number,
) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const cacheKey = stationToken && startDate !== undefined && endDate !== undefined
    ? 'washlab_cache_v1_stats_' + stationToken + '_' + startDate + '_' + endDate
    : null;

  const liveStats = useQuery(
    api.stations.getStationStats,
    stationToken && startDate !== undefined && endDate !== undefined
      ? { stationToken, startDate, endDate }
      : 'skip',
  );

  // Write to cache when live data arrives
  useEffect(() => {
    if (liveStats && cacheKey) {
      cacheWrite(cacheKey, liveStats);
    }
  }, [liveStats, cacheKey]);

  // Always read cache as fallback when Convex hasn't loaded
  const cachedEntry = cacheKey ? cacheRead<typeof defaultStats>(cacheKey) : null;
  const effectiveStats = liveStats ?? cachedEntry?.data ?? defaultStats;
  const isLoading = isOnline && liveStats === undefined && !cachedEntry;

  return { stats: effectiveStats as typeof defaultStats, isLoading };
}
