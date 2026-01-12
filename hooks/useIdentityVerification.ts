'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for identity verification before actions
 * Uses biometric verification to verify attendant identity and active attendance
 */
export function useIdentityVerification() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);

  const startVerification = useMutation(api.attendants.startVerification);
  const verifyBiometric = useMutation(api.attendants.verifyBiometric);

  const startActionVerification = async (
    attendantId: Id<'attendants'>,
    actionType: string,
    orderId?: Id<'orders'>
  ) => {
    setIsLoading(true);
    try {
      const result = await startVerification({
        attendantId,
        verificationType: "action",
        actionContext: {
          actionType,
          orderId,
        },
      });
      setChallenge(result.challenge);
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start verification",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeVerification = async (
    attendantId: Id<'attendants'>,
    biometricData: {
      captureType: 'face' | 'hand';
      features: string;
      measurements: string;
      livenessData: string;
      angles: string[];
      captureQuality: number;
      deviceInfo?: string;
    },
    actionType?: string,
    orderId?: Id<'orders'>
  ) => {
    if (!challenge) {
      toast({
        title: "Error",
        description: "Missing challenge. Please start verification first.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const result = await verifyBiometric({
        attendantId,
        challenge,
        verificationType: "action",
        biometricData,
        actionContext: actionType
          ? {
              actionType,
              orderId,
            }
          : undefined,
      });

      if (result.success) {
        setChallenge(null);
        return {
          success: true,
          verificationId: result.verificationId,
          expiresAt: result.expiresAt,
        };
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Biometric verification failed",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    challenge,
    isLoading,
    startActionVerification,
    completeVerification,
  };
}
