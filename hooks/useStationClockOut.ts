'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for station clock-out flow with biometric verification
 */
export function useStationClockOut(stationToken: string | null) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);

  const startVerification = useMutation(api.stations.startClockOutVerification);
  const completeClockOut = useMutation(api.stations.completeClockOut);

  const startClockOut = async (attendanceId: Id<'attendanceLogs'>) => {
    if (!stationToken) {
      toast({
        title: "Error",
        description: "Station session not available",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const result = await startVerification({
        stationToken,
        attendanceId,
      });
      setChallenge(result.challenge);
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start clock-out",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const finishClockOut = async (
    attendanceId: Id<'attendanceLogs'>,
    biometricData: {
      captureType: 'face' | 'hand';
      features: string;
      measurements: string;
      livenessData: string;
      angles: string[];
      captureQuality: number;
      deviceInfo?: string;
    },
    notes?: string
  ) => {
    if (!stationToken || !challenge) {
      toast({
        title: "Error",
        description: "Missing session or challenge",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await completeClockOut({
        stationToken,
        attendanceId,
        challenge,
        biometricData,
        notes,
      });

      toast({
        title: "Clocked Out Successfully",
        description: `Duration: ${result.durationMinutes} minutes`,
      });

      setChallenge(null);
      return true;
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Biometric verification failed",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    challenge,
    isLoading,
    startClockOut,
    finishClockOut,
  };
}
