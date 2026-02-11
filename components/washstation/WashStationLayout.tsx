'use client';

import { useState, useEffect, useRef } from 'react';
import WashStationSidebar from './WashStationSidebar';
import { MobileSidebar } from './MobileSidebar';
import WashStationHeader from './WashStationHeader';
import { useOrders } from '@/context/OrderContext';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationAttendance } from '@/hooks/useStationAttendance';
import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Id } from "@devlider001/washlab-backend/dataModel";

interface WashStationLayoutProps {
  children: React.ReactNode;
  title: string;
  terminalId?: string;
  pendingCount?: number;
  onNotificationClick?: () => void;
}

export function WashStationLayout({
  children,
  title,
  terminalId,
  pendingCount,
  onNotificationClick,
}: WashStationLayoutProps) {
  const { getPendingOrders } = useOrders();
  const { stationToken } = useStationSession();
  const { attendances } = useStationAttendance(stationToken);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Order Ready Notification States
  const [showReadyPopup, setShowReadyPopup] = useState(false);
  const [readyOrder, setReadyOrder] = useState<{
    _id: string;
    orderNumber: string;
    customerName: string;
    finalPrice: number;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shownOrdersRef = useRef<Set<string>>(new Set());

  // Fetch all orders for monitoring (with pagination)
  const allOrdersData = useQuery(
    api.stations.getStationOrders,
    stationToken
      ? {
          stationToken,
          paginationOpts: {
            numItems: 100,
            cursor: null,
          },
        }
      : 'skip'
  );

  const allOrders = allOrdersData?.page as Array<{
    _id: Id<'orders'>;
    orderNumber: string;
    status: string;
    finalPrice: number;
    customer?: {
      name: string;
      phoneNumber: string;
      email?: string;
    } | null;
  }> | undefined;

  const actualPendingCount =
    pendingCount !== undefined ? pendingCount : getPendingOrders().length;

  // Init audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.wav');
    }
  }, []);

  // Monitor orders for ready status
  useEffect(() => {
    if (!allOrders || allOrders.length === 0) return;

    const mapLegacyStatus = (status: string): string => {
      const mapping: Record<string, string> = {
        pending: 'pending_dropoff',
        in_progress: 'washing',
        ready_for_pickup: 'ready',
        delivered: 'completed',
      };
      return mapping[status] || status;
    };

    const newlyReadyOrders = allOrders.filter(order => {
      const mappedStatus = mapLegacyStatus(order.status);
      const orderKey = order._id.toString();
      return mappedStatus === 'ready' && !shownOrdersRef.current.has(orderKey);
    });

    if (newlyReadyOrders.length > 0) {
      const order = newlyReadyOrders[0];

      setReadyOrder({
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || 'Unknown Customer',
        finalPrice: order.finalPrice,
      });

      setShowReadyPopup(true);
      shownOrdersRef.current.add(order._id.toString());

      audioRef.current?.play().catch(() => {});
      setTimeout(() => setShowReadyPopup(false), 5000);
    }
  }, [allOrders]);

  // Persist collapse state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (storedCollapsed === 'true') setCollapsed(true);
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', next.toString());
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {showReadyPopup && readyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-bold">Order Ready 🎉</h2>
              <p className="text-lg font-semibold text-primary">
                #{readyOrder.orderNumber}
              </p>

              <p className="text-sm text-muted-foreground">
                {readyOrder.customerName}'s laundry is ready
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReadyPopup(false)}
                >
                  Dismiss
                </Button>

                <Button
                  className="flex-1"
                  onClick={() =>
                    (window.location.href = `/washstation/orders/${readyOrder._id}`)
                  }
                >
                  View Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WashStationSidebar
        collapsed={collapsed}
        onToggle={handleToggleCollapse}
      />

      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <WashStationHeader
          title={title}
          activeAttendances={attendances}
          pendingCount={actualPendingCount}
          onNotificationClick={onNotificationClick}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
