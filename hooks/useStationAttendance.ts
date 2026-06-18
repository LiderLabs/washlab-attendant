'use client';

import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from "@jordan6699/washlab-backend/api";
import { Id } from "@jordan6699/washlab-backend/dataModel";
import { cacheWrite, cacheRead, CK } from './useOfflineCache';

interface StationAttendance {
  _id: Id<'attendanceLogs'>;
  clockInAt: number;
  deviceId?: string;
  attendant: {
    _id: Id<'attendants'>;
    name: string;
    email: string;
  } | null;
}

export function useStationAttendance(stationToken: string | null, branchId?: string) {
  // Track online state reactively so changes trigger re-render
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

  const liveAttendances = useQuery(
    api.stations.getActiveStationAttendances,
    stationToken ? { stationToken } : 'skip'
  ) as StationAttendance[] | undefined;

  // Write to cache whenever fresh data arrives
  useEffect(() => {
    if (branchId && liveAttendances !== undefined) {
      cacheWrite(CK.attendances(branchId), liveAttendances);
    }
  }, [liveAttendances, branchId]);

  // Always read cache — use it as fallback when Convex hasn't loaded yet
  // (covers both offline AND the brief loading window on refresh)
  const cachedEntry = branchId
    ? cacheRead<StationAttendance[]>(CK.attendances(branchId))
    : null;

  // Use live data if available, otherwise fall back to cache
  const effectiveAttendances = liveAttendances ?? cachedEntry?.data ?? [];
  const isOffline = !isOnline;
  const isLoading = isOnline && liveAttendances === undefined && !cachedEntry;

  const attendance = effectiveAttendances.length > 0 ? effectiveAttendances[0] : null;

  return {
    attendances: effectiveAttendances,
    attendance,
    isClockedIn: effectiveAttendances.length > 0,
    isOffline,
    cachedAt: cachedEntry?.savedAt ?? null,
    isLoading,
  };
}
