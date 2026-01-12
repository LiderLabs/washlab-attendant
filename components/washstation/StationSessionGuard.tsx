'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { InactiveBranchScreen } from './InactiveBranchScreen';
import { Loader2 } from 'lucide-react';

interface StationSessionGuardProps {
  children: React.ReactNode;
}

export function StationSessionGuard({ children }: StationSessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [stationToken, setStationToken] = useState<string | null>(null);

  // Check for station session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('station_token');
    const branchId = localStorage.getItem('station_branch_id');

    if (!token || !branchId) {
      // No session, redirect to login (except if already on login page)
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    setStationToken(token);
  }, [router, pathname]);

  // Verify station session and check branch status
  const sessionData = useQuery(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.stations as any)?.verifyStationSession ?? null,
    stationToken ? { stationToken } : 'skip'
  ) as {
    valid: boolean;
    branchId?: string;
    branchName?: string;
    branchActive?: boolean;
    reason?: string;
  } | undefined | null;

  // Show loading while checking session
  if (pathname === '/login') {
    // Don't check session on login page
    return <>{children}</>;
  }

  if (!stationToken || sessionData === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Session invalid or expired
  if (!sessionData || !sessionData.valid) {
    // Clear invalid session and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('station_token');
      localStorage.removeItem('station_branch_id');
      localStorage.removeItem('station_device_id');
      localStorage.removeItem('station_session_id');
      localStorage.removeItem('station_branch_name');
    }
    router.push('/login');
    return null;
  }

  // Branch is inactive
  if (sessionData.branchActive === false) {
    return (
      <InactiveBranchScreen
        branchName={sessionData.branchName}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  // Everything is valid, render children
  return <>{children}</>;
}
