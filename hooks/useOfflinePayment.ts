// hooks/useOfflinePayment.ts
// Offline-aware wrapper for cash payments only.
// Online → calls Convex directly.
// Offline + cash → writes to IndexedDB outbox.
// Offline + non-cash → rejects with a clear message (non-cash requires connection).
'use client';
import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { enqueue } from '@/lib/offlineOutbox';
import { toast } from 'sonner';

export function useOfflinePayment() {
  const createPayment       = useMutation((api as any).payments.create);
  const finalizePaymentSafe = useMutation((api as any).payments.finalizePaymentSafe);

  const createCashPayment = useCallback(async (args: {
    orderId: string;
    amount: number;
    paymentMethod: string;
    verificationId?: string;
  }) => {
    if (navigator.onLine) {
      return createPayment(args as any);
    }

    if (args.paymentMethod !== 'cash') {
      throw new Error('Non-cash payments require an internet connection. Please use cash or reconnect.');
    }

    const action = await enqueue('createPayment', args as Record<string, unknown>);
    toast.warning('You are offline. Cash payment saved locally and will sync when connection returns.', {
      duration: 5000,
    });
    return { _offlineId: action.id, paymentId: `offline_${action.id}` };
  }, [createPayment]);

  const finalizeCashPayment = useCallback(async (args: {
    orderId: string;
    verificationId?: string;
    gatewayTransactionId?: string | null;
    confirmedPaymentMethod: string;
  }) => {
    if (navigator.onLine) {
      return finalizePaymentSafe(args as any);
    }

    if (args.confirmedPaymentMethod !== 'cash') {
      throw new Error('Non-cash payments require an internet connection.');
    }

    await enqueue('finalizePayment', args as Record<string, unknown>);
    return { _offline: true };
  }, [finalizePaymentSafe]);

  return { createCashPayment, finalizeCashPayment };
}
