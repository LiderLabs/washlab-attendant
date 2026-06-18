'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from "@jordan6699/washlab-backend/api";
import { InactiveBranchScreen } from '@/components/washstation/InactiveBranchScreen';
import { Loader2 } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const CACHE_KEY = 'station_session_cache';

function readCachedSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function WashStationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [stationToken, setStationToken] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  const isClockInPage = pathname === '/washstation/clock-in';

  // Mount outbox sync — watches navigator.onLine and replays queued mutations on reconnect
  useOfflineSync();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('station_token');
    const branchId = localStorage.getItem('station_branch_id');

    if (!token || !branchId) {
      // No session at all — but check cache before redirecting
      const cached = readCachedSession();
      if (!cached?.valid) {
        setShouldRedirect(true);
        return;
      }
    }

    setStationToken(token);

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
    (api.stations as any)?.verifyStationSession ?? null,
    stationToken ? { stationToken } : 'skip'
  ) as {
    valid: boolean;
    branchId?: string;
    branchName?: string;
    branchActive?: boolean;
    reason?: string;
  } | undefined | null;

  // Write to cache when live data confirms valid
  useEffect(() => {
    if (liveSessionData?.valid === true) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(liveSessionData)); } catch {}
    }
    if (liveSessionData?.valid === false) {
      try { localStorage.removeItem(CACHE_KEY); } catch {}
    }
  }, [liveSessionData]);

  // Resolve effective session: live data takes priority; fall back to cache when offline
  const cachedSession = readCachedSession();
  const sessionData =
    liveSessionData !== undefined
      ? liveSessionData
      : (!isOnline && cachedSession)
        ? cachedSession
        : undefined;

  // Get all active attendances
  const attendanceData = useQuery(
    api.stations.getActiveStationAttendances,
    stationToken ? { stationToken } : 'skip'
  ) as Array<{
    _id: string;
    clockInAt: number;
    attendant: { _id: string; name: string; email: string; } | null;
  }> | undefined;

  // Handle redirects
  useEffect(() => {
    if (shouldRedirect) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('station_token');
        localStorage.removeItem('station_branch_id');
        localStorage.removeItem('station_device_id');
        localStorage.removeItem('station_session_id');
        localStorage.removeItem('station_branch_name');
        router.push('/login');
      }
      return;
    }

    // Only redirect on explicit invalid from Convex — not on undefined (pending/offline)
    if (liveSessionData && !liveSessionData.valid) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('station_token');
        localStorage.removeItem('station_branch_id');
        localStorage.removeItem('station_device_id');
        localStorage.removeItem('station_session_id');
        localStorage.removeItem('station_branch_name');
        localStorage.removeItem(CACHE_KEY);
        router.push('/login');
      }
      return;
    }
  }, [shouldRedirect, liveSessionData, router]);

  // Still loading: no token yet, OR Convex pending AND online AND no cache
  if (
    shouldRedirect ||
    !stationToken ||
    (sessionData === undefined && (isOnline || !cachedSession))
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>
            {shouldRedirect
              ? 'Redirecting to login...'
              : 'Verifying session...'}
          </p>
        </div>
      </div>
    );
  }

  // Session explicitly invalid
  if (!sessionData || !sessionData.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Session expired. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Branch inactive
  if (sessionData.branchActive === false) {
    return (
      <InactiveBranchScreen
        branchName={sessionData.branchName}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  return <>{children}</>;
}
