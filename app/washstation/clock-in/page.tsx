'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { ClockInOut } from '@/components/washstation/ClockInOut';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationAttendance } from '@/hooks/useStationAttendance';
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';

export default function ClockInPage() {
  const router = useRouter();
  const { stationToken, sessionData, isSessionValid, isLoading: sessionLoading } = useStationSession();
  const { attendances, isLoading: attendanceLoading } = useStationAttendance(stationToken);

  // Don't redirect - allow attendants to clock in/out even if someone is already clocked in
  // Multiple attendants can work simultaneously

  if (sessionLoading || !isSessionValid) {
    return (
      <WashStationLayout title="Clock In">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Verifying session..." />
        </div>
      </WashStationLayout>
    );
  }

  return (
    <WashStationLayout title="Clock In">
      <div className="max-w-md mx-auto">
        <ClockInOut />
      </div>
    </WashStationLayout>
  );
}
