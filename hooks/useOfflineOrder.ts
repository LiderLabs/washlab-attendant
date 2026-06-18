// hooks/useOfflineOrder.ts
// Drop-in replacement for the createWalkInOrder mutation call.
// Online → calls Convex directly (same as before).
// Offline → writes to IndexedDB outbox and returns a fake optimistic result.
'use client';
import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { enqueue } from '@/lib/offlineOutbox';
import { toast } from 'sonner';

export function useOfflineOrder() {
  const createWalkInOrder = useMutation((api as any).stations.createWalkInOrder);

  const createOrder = useCallback(async (args: Record<string, unknown>) => {
    if (navigator.onLine) {
      // Online: normal path
      return createWalkInOrder(args as any);
    }

    // Offline: save to outbox
    const action = await enqueue('createWalkInOrder', args);
    toast.warning('You are offline. Order saved locally and will sync when connection returns.', {
      duration: 5000,
    });

    // Return an optimistic stub so the calling code can still redirect
    return {
      orderId: `offline_${action.id}`,
      bagCardNumber: (args.bagCardNumber as string) ?? 'OFFLINE',
      _offlineId: action.id,
    };
  }, [createWalkInOrder]);

  return { createOrder };
}
