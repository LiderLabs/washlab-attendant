'use client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, pendingCount } = useOfflineSync();

  useEffect(() => {
    if (!isOnline) {
      toast.warning(
        pendingCount > 0
          ? `Offline — ${pendingCount} action${pendingCount > 1 ? 's' : ''} queued locally`
          : 'You are offline — cash payments only',
        { id: 'offline-banner', duration: Infinity }
      );
    } else {
      toast.dismiss('offline-banner');
    }
  }, [isOnline, pendingCount]);

  return <>{children}</>;
}
