'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for station clock-in flow with biometric verification
 */
export function useStationClockIn(stationToken: string | null) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);

  const startVerification = useMutation(api.stations.startClockInVerification);
  const completeClockIn = useMutation(api.stations.completeClockIn);

  const startClockIn = async (attendantId: Id<'attendants'>) => {
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
        attendantId,
      });
      setChallenge(result.challenge);
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start clock-in",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const finishClockIn = async (
    attendantId: Id<'attendants'>,
    biometricData: {
      captureType: 'face' | 'hand';
      features: string;
      measurements: string;
      livenessData: string;
      angles: string[];
      captureQuality: number;
      deviceInfo?: string;
    }
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
      const result = await completeClockIn({
        stationToken,
        attendantId,
        challenge,
        biometricData,
      });

      toast({
        title: "Clocked In Successfully",
        description: `Welcome, ${result.attendant.name}!`,
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
    startClockIn,
    finishClockIn,
  };
}
