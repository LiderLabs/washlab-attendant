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
  branchName?: string;
  terminalId?: string;
  pendingCount?: number;
  onNotificationClick?: () => void;
}

export function WashStationLayout({
  children,
  title,
  branchName,
  terminalId,
  pendingCount,
  onNotificationClick,
}: WashStationLayoutProps) {
  const { getPendingOrders } = useOrders();
  const { stationToken, sessionData } = useStationSession();
  const { attendances } = useStationAttendance(stationToken);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState(
    branchName || 'Central Branch'
  );

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
            numItems: 100, // Get up to 100 orders for monitoring
            cursor: null
          }
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

  // Determine pending orders count
  const actualPendingCount =
    pendingCount !== undefined ? pendingCount : getPendingOrders().length;

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTUIGWi68OScTgwMUKvm8LNgGgU7k9nyz3gsBS1/zPLaizsKGGS66OihUBELTKXh8bllHAU2jdTxz38vBSl+zPDaizwLGGa67+idUBELTqfi8bllHAU3jdXyz38vBSp+zPDaizwKF2W57+idUREKTqXi8bhlHAU3jdXxz38vBSl+y/HajDsLF2S57umeUBELTqXi8bhlHAU2jdXxz38vBSl+y/HajDsLGGS57umeUBELTabh8bllHAU2jdXxz38vBSl+y/HajDsLGGS47umeTxALTabh8bllHAU2jdXxz38vBSl+y/HajDsLGGS47umeTxALTabh8bllHAU2jdXxz38vBSl+y/HajDwLGGO67+meTxALTabh8bllHAU2jdXxz38vBSl+y/HajDwLGGO67+meTxALTabh8blmHAU1jdXxz38vBSl+y/HajDwLGGO67+meTxALTabh8blmHAU1jdXxz38vBSl+y/HajDwLGGO67+mdTxALTabh8blmHAU1jdXxz38vBSl+y/HajDwLGGO67+mdTxALTabh8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz38vBSl+y/HbjDwLGGO67+mdTxALTabg8blmHAU1jdXxz3');
    }
  }, []);

  // Monitor orders for ready status
  useEffect(() => {
    if (!allOrders || allOrders.length === 0) return;

    // Map legacy statuses to new ones
    const mapLegacyStatus = (status: string): string => {
      const mapping: Record<string, string> = {
        'pending': 'pending_dropoff',
        'in_progress': 'washing',
        'ready_for_pickup': 'ready',
        'delivered': 'completed',
      };
      return mapping[status] || status;
    };

    // Check for any order that just became ready
    const newlyReadyOrders = allOrders.filter(order => {
      const mappedStatus = mapLegacyStatus(order.status);
      const orderKey = order._id.toString(); // Convert Id to string for Set comparison
      
      // If it's ready and we haven't shown notification for this order yet
      if (mappedStatus === 'ready' && !shownOrdersRef.current.has(orderKey)) {
        return true;
      }
      return false;
    });

    if (newlyReadyOrders.length > 0) {
      // Show notification for the first newly ready order
      const order = newlyReadyOrders[0];
      
      setReadyOrder({
        _id: order._id.toString(), // Convert Id to string
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || 'Unknown Customer',
        finalPrice: order.finalPrice
      });
      
      setShowReadyPopup(true);
      
      // Mark this order as shown (ensures it only pops up once)
      shownOrdersRef.current.add(order._id.toString());
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowReadyPopup(false);
      }, 5000);
    }
  }, [allOrders]);

  // Clean up shown orders that are no longer in ready status
  useEffect(() => {
    if (allOrders) {
      const mapLegacyStatus = (status: string): string => {
        const mapping: Record<string, string> = {
          'pending': 'pending_dropoff',
          'in_progress': 'washing',
          'ready_for_pickup': 'ready',
          'delivered': 'completed',
        };
        return mapping[status] || status;
      };

      const currentReadyOrderIds = new Set(
        allOrders
          .filter(o => mapLegacyStatus(o.status) === 'ready')
          .map(o => o._id.toString()) // Convert Id to string
      );
      
      // Remove orders from shownOrders that are no longer ready
      shownOrdersRef.current.forEach(orderId => {
        if (!currentReadyOrderIds.has(orderId)) {
          shownOrdersRef.current.delete(orderId);
        }
      });
    }
  }, [allOrders]);

  // Load branch name & sidebar collapse from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Branch name
    const storedBranchName = localStorage.getItem('station_branch_name');
    if (storedBranchName) {
      setCurrentBranchName(storedBranchName);
    } else if (branchName) {
      setCurrentBranchName(branchName);
    }

    // Sidebar collapse state
    const storedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (storedCollapsed === 'true') setCollapsed(true);
  }, [branchName]);

  // Persist collapse state
  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_collapsed', newState.toString());
      }
      return newState;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Order Ready Notification Popup */}
      {showReadyPopup && readyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Order Ready! 🎉
                </h2>
                <p className="text-lg font-semibold text-primary">
                  #{readyOrder.orderNumber}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {readyOrder.customerName}'s laundry is ready for pickup
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total: ₵{readyOrder.finalPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowReadyPopup(false)}
                  className="flex-1"
                  size="lg"
                  variant="outline"
                >
                  Dismiss
                </Button>
                <Button 
                  onClick={() => {
                    setShowReadyPopup(false);
                    // Use string interpolation for the ID
                    window.location.href = `/washstation/orders/${readyOrder._id}`;
                  }}
                  className="flex-1"
                  size="lg"
                >
                  View Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <WashStationSidebar
        branchName={currentBranchName}
        collapsed={collapsed}
        onToggle={handleToggleCollapse}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        branchName={currentBranchName}
      />

      {/* Main Content */}
      <main
        className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <WashStationHeader
          title={title}
          branchName={currentBranchName}
          activeAttendances={attendances}
          pendingCount={actualPendingCount}
          onNotificationClick={onNotificationClick}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <div className="p-4 md:p-6 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}