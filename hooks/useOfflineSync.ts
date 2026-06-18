// hooks/useOfflineSync.ts
// Watches navigator.onLine and replays the outbox when connection returns.
'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { getPending, markSynced, incrementRetry, getPendingCount, deleteOld } from '@/lib/offlineOutbox';
import { toast } from 'sonner';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const isSyncing = useRef(false);

  const createWalkInOrder      = useMutation((api as any).stations.createWalkInOrder);
  const createGuestCustomer    = useMutation((api as any).customers.createGuest);
  const createPayment          = useMutation((api as any).payments.create);
  const finalizePaymentSafe    = useMutation((api as any).payments.finalizePaymentSafe);
  const updateOrderStatus      = useMutation((api as any).stations.updateStationOrderStatus);
  const completeClockInWithPIN  = useMutation((api as any).stations.completeClockInWithPIN);
  const completeClockOutWithPIN = useMutation((api as any).stations.completeClockOutWithPIN);

  const refreshCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const syncOutbox = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    const pending = await getPending();
    if (pending.length === 0) { isSyncing.current = false; return; }

    toast.info('Syncing ' + pending.length + ' offline action' + (pending.length > 1 ? 's' : '') + '...');
    let successCount = 0;

    for (const action of pending) {
      try {
        if (action.type === 'createGuestCustomer') {
          await createGuestCustomer(action.payload as any);
        } else if (action.type === 'createWalkInOrder') {
          await createWalkInOrder(action.payload as any);
        } else if (action.type === 'createPayment') {
          await createPayment(action.payload as any);
        } else if (action.type === 'finalizePayment') {
          await finalizePaymentSafe(action.payload as any);
        } else if (action.type === 'updateOrderStatus') {
          await updateOrderStatus(action.payload as any);
        } else if (action.type === 'clockIn') {
          await completeClockInWithPIN(action.payload as any);
        } else if (action.type === 'clockOut') {
          await completeClockOutWithPIN(action.payload as any);
        }
        await markSynced(action.id);
        successCount++;
      } catch (err) {
        await incrementRetry(action.id);
        console.error('[offlineSync] failed to replay action', action.id, err);
      }
    }

    await refreshCount();
    isSyncing.current = false;

    if (successCount > 0) {
      toast.success(successCount + ' offline action' + (successCount > 1 ? 's' : '') + ' synced successfully.');
    }
    const remaining = await getPendingCount();
    if (remaining > 0) {
      toast.warning(remaining + ' action' + (remaining > 1 ? 's' : '') + ' still pending - will retry automatically.');
    }
    // Prune synced records older than 7 days so IndexedDB stays lean
    await deleteOld();
  }, [createWalkInOrder, createGuestCustomer, createPayment, finalizePaymentSafe,
      updateOrderStatus, completeClockInWithPIN, completeClockOutWithPIN, refreshCount]);

  useEffect(() => {
    refreshCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncOutbox();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOutbox, refreshCount]);

  return { isOnline, pendingCount, syncOutbox };
}
