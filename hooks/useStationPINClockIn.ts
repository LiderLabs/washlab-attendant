'use client';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from "@jordan6699/washlab-backend/api";
import { Id } from "@jordan6699/washlab-backend/dataModel";
import { useToast } from '@/hooks/use-toast';
import { enqueue } from '@/lib/offlineOutbox';

export function useStationPINClockIn(stationToken: string | null) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const completeClockInWithPIN  = useMutation((api as any).stations.completeClockInWithPIN);
  const completeClockOutWithPIN = useMutation((api as any).stations.completeClockOutWithPIN);

  const clockInWithPIN = async (attendantId: Id<'attendants'>, pin: string) => {
    if (!stationToken) return false;

    // Offline: queue with current timestamp — PIN verified on sync
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueue('clockIn', {
        stationToken,
        attendantId,
        pin,
        offlineClockInAt: Date.now(),
      } as Record<string, unknown>);
      toast({
        title: 'Clocked In (offline)',
        description: 'Clock-in saved locally and will sync when connection returns.',
      });
      return true;
    }

    setIsLoading(true);
    try {
      const result = await completeClockInWithPIN({ stationToken, attendantId, pin });
      toast({ title: 'Clocked In', description: 'Welcome, ' + result.attendant.name + '!' });
      return true;
    } catch (error) {
      toast({
        title: 'Clock In Failed',
        description: error instanceof Error ? error.message : 'Invalid PIN',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clockOutWithPIN = async (attendanceId: Id<'attendanceLogs'>, pin: string) => {
    if (!stationToken) return false;

    // Offline: queue with current timestamp — clock-out time recorded now
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueue('clockOut', {
        stationToken,
        attendanceId,
        pin,
        offlineClockOutAt: Date.now(),
      } as Record<string, unknown>);
      toast({
        title: 'Clocked Out (offline)',
        description: 'Clock-out saved locally and will sync when connection returns.',
      });
      return true;
    }

    setIsLoading(true);
    try {
      const result = await completeClockOutWithPIN({ stationToken, attendanceId, pin });
      toast({ title: 'Clocked Out', description: 'Goodbye, ' + result.attendant.name + '!' });
      return true;
    } catch (error) {
      toast({
        title: 'Clock Out Failed',
        description: error instanceof Error ? error.message : 'Invalid PIN',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, clockInWithPIN, clockOutWithPIN };
}
