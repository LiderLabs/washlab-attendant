'use client';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from "@jordan6699/washlab-backend/api";
import { Id } from "@jordan6699/washlab-backend/dataModel";

export interface StationSession {
  valid: boolean;
  branchId?: Id<'branches'>;
  branchName?: string;
  branchCode?: string;
  branchActive?: boolean;
  reason?: string;
  terminalId?: string;
  deviceId?: string;
  sessionId?: string;
}

const CACHE_KEY = 'station_session_cache';

function readCachedSession(): StationSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as StationSession) : null;
  } catch {
    return null;
  }
}

function writeCachedSession(session: StationSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(session));
  } catch {
    // storage full — not critical
  }
}

function clearCachedSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}

/**
 * Hook to manage station session.
 * Offline behaviour: if Convex is unreachable (query still pending) and a
 * previously-verified session exists in localStorage, we treat that cached
 * session as valid so attendants aren't locked out during connectivity drops.
 * The moment Convex responds again it either confirms or revokes the session.
 */
export function useStationSession() {
  const [stationToken, setStationToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  // Load token + track online state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('station_token');
    if (token) setStationToken(token);
    setIsInitialized(true);

    setIsOnline(navigator.onLine);
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Live Convex verification
  const liveSessionData = useQuery(
    api.stations.verifyStationSession,
    stationToken ? { stationToken } : 'skip'
  ) as StationSession | undefined;

  // When Convex returns a valid session, persist it to cache
  useEffect(() => {
    if (liveSessionData?.valid === true) {
      writeCachedSession(liveSessionData);
    }
    // If Convex explicitly says invalid, clear the cache so we don't re-use it
    if (liveSessionData?.valid === false) {
      clearCachedSession();
    }
  }, [liveSessionData]);

  // Resolve effective session:
  // - If Convex has responded: use live data (source of truth)
  // - If Convex is still pending (undefined) AND we're offline: fall back to cache
  // - If Convex is still pending AND we're online: still loading (don't unblock yet)
  const convexPending = stationToken !== null && liveSessionData === undefined;
  // Read cache unconditionally so isLoading resolves on first render when offline
  const cachedSession = readCachedSession();

  const sessionData: StationSession | undefined =
    liveSessionData !== undefined
      ? liveSessionData
      : (convexPending && !isOnline && cachedSession)
        ? cachedSession
        : undefined;

  const isSessionValid = sessionData?.valid === true;

  // Still loading if: not yet initialized, or token exists + Convex pending + online (no cache fallback yet)
  const isLoading =
    !isInitialized ||
    (convexPending && isOnline && !cachedSession);

  const setSession = useCallback((token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('station_token', token);
      setStationToken(token);
    }
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('station_token');
      localStorage.removeItem('station_branch_id');
      localStorage.removeItem('station_device_id');
      localStorage.removeItem('station_session_id');
      localStorage.removeItem('station_branch_name');
      clearCachedSession();
      setStationToken(null);
    }
  }, []);

  return {
    stationToken,
    sessionData,
    isSessionValid,
    isLoading,
    isOnline,
    setSession,
    clearSession,
  };
}
