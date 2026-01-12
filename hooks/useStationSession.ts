'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";

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

/**
 * Hook to manage station session
 * Handles station token validation and session state
 */
export function useStationSession() {
  const [stationToken, setStationToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('station_token');
    if (token) {
      setStationToken(token);
    }
    setIsInitialized(true);
  }, []);

  // Verify session
  const sessionData = useQuery(
    api.stations.verifyStationSession,
    stationToken ? { stationToken } : 'skip'
  ) as StationSession | undefined;

  const isSessionValid = sessionData?.valid === true;
  const isLoading = !isInitialized || (stationToken && sessionData === undefined);

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
      setStationToken(null);
    }
  }, []);

  return {
    stationToken,
    sessionData,
    isSessionValid,
    isLoading,
    setSession,
    clearSession,
  };
}
