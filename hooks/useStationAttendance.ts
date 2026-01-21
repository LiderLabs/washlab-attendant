'use client';

import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";

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

/**
 * Hook to get active station attendances
 * Returns all active attendance logs for the station's branch
 * Multiple attendants can be clocked in simultaneously
 */
export function useStationAttendance(stationToken: string | null) {
  // Get active attendances
  const attendances = useQuery(
    api.stations.getActiveStationAttendances,
    stationToken ? { stationToken } : 'skip'
  ) as StationAttendance[] | undefined;

  // For backward compatibility, return first attendance if any
  const attendance = attendances && attendances.length > 0 ? attendances[0] : null;

  return {
    attendances: attendances ?? [],
    attendance,
    isClockedIn: attendances !== undefined && attendances.length > 0,
    isLoading: attendances === undefined,
  };
}
