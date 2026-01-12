'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";

interface SessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  attendantId: Id<'attendants'> | null;
  sessionToken: string | null;
  refreshToken: string | null;
}

/**
 * Hook to manage attendant session state
 * Checks localStorage for session tokens and validates them
 */
export function useAttendantSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    isAuthenticated: false,
    isLoading: true,
    attendantId: null,
    sessionToken: null,
    refreshToken: null,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem('attendant_session_token');
    const refreshToken = localStorage.getItem('attendant_refresh_token');
    const attendantId = localStorage.getItem('attendant_id');

    if (sessionToken && refreshToken && attendantId) {
      setSessionState({
        isAuthenticated: true,
        isLoading: false,
        attendantId: attendantId as Id<'attendants'>,
        sessionToken,
        refreshToken,
      });
    } else {
      setSessionState({
        isAuthenticated: false,
        isLoading: false,
        attendantId: null,
        sessionToken: null,
        refreshToken: null,
      });
    }
  }, []);

  /**
   * Set session after successful login
   */
  const setSession = (
    attendantId: Id<'attendants'>,
    sessionToken: string,
    refreshToken: string
  ) => {
    localStorage.setItem('attendant_session_token', sessionToken);
    localStorage.setItem('attendant_refresh_token', refreshToken);
    localStorage.setItem('attendant_id', attendantId);

    setSessionState({
      isAuthenticated: true,
      isLoading: false,
      attendantId,
      sessionToken,
      refreshToken,
    });
  };

  /**
   * Clear session on logout
   */
  const clearSession = () => {
    localStorage.removeItem('attendant_session_token');
    localStorage.removeItem('attendant_refresh_token');
    localStorage.removeItem('attendant_id');

    setSessionState({
      isAuthenticated: false,
      isLoading: false,
      attendantId: null,
      sessionToken: null,
      refreshToken: null,
    });
  };

  return {
    ...sessionState,
    setSession,
    clearSession,
  };
}
