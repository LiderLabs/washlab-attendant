'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@devlider001/washlab-backend/api';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationAttendance } from '@/hooks/useStationAttendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Users,
  Timer
} from 'lucide-react';
import { format, startOfToday, endOfToday } from 'date-fns';
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';
import { EmptyState } from '@/components/washstation/EmptyState';

export function AttendanceContent() {
  const { stationToken } = useStationSession();
  const { attendances: activeAttendances, isLoading: activeLoading } = useStationAttendance(stationToken);

  // Get today's attendance history
  const todayStart = startOfToday().getTime();
  const todayEnd = endOfToday().getTime();

  const attendanceHistory = useQuery(
    api.stations.getStationAttendanceHistory,
    stationToken ? {
      stationToken,
      startDate: todayStart,
      endDate: todayEnd,
      limit: 100,
    } : 'skip'
  );

  const isLoading = activeLoading || attendanceHistory === undefined;

  // Track current time for elapsed time calculation
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time for active attendances
  const getElapsedTime = (clockInAt: number) => {
    const diff = currentTime - clockInAt;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Format duration
  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading attendance..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Attendants */}
      {activeAttendances && activeAttendances.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Active Attendants
                </CardTitle>
                <CardDescription className="mt-1">
                  Currently clocked in attendants
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500">
                {activeAttendances.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAttendances.map((attendance) => (
                <div
                  key={attendance._id}
                  className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                      {attendance.attendant?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {attendance.attendant?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {attendance.attendant?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Clocked in: {format(new Date(attendance.clockInAt), 'h:mm a')}</span>
                    <span className="ml-auto font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {getElapsedTime(attendance.clockInAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Attendance History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Attendance Log
              </CardTitle>
              <CardDescription className="mt-1">
                All clock-in and clock-out entries for today
              </CardDescription>
            </div>
            {attendanceHistory && attendanceHistory.length > 0 && (
              <Badge variant="outline">
                {attendanceHistory.length} entries
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!attendanceHistory || attendanceHistory.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No attendance entries"
              description="No attendance entries for today. Attendants can clock in using the Clock In/Out page."
            />
          ) : (
            <div className="space-y-3">
              {attendanceHistory.map((entry) => (
                <div
                  key={entry._id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {entry.isActive ? (
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <LogIn className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">
                            {entry.attendant?.name || 'Unknown'}
                          </p>
                          {entry.isActive && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <LogIn className="w-3 h-3" />
                            {format(new Date(entry.clockInAt), 'h:mm a')}
                          </span>
                          {entry.clockOutAt && (
                            <span className="flex items-center gap-1">
                              <LogOut className="w-3 h-3" />
                              {format(new Date(entry.clockOutAt), 'h:mm a')}
                            </span>
                          )}
                          {entry.durationMinutes !== null && (
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {formatDuration(entry.durationMinutes)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.clockInAt), 'MMM d')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
