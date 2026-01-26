'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationStats } from '@/hooks/useStationStats';
import { useStationOrders } from '@/hooks/useStationOrders';
import { StatCard } from '../StatCard';
import { OrderList } from '../OrderList';
import { LoadingSpinner } from '../LoadingSpinner';
import { EmptyState } from '../EmptyState';
import {
  Plus,
  ShoppingBag,
  Users,
  Package,
  CheckCircle,
  DollarSign,
  Clock,
  ArrowRight,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export function DashboardContent() {
  const router = useRouter();
  const { stationToken, sessionData, isLoading: sessionLoading } = useStationSession();
  const isSessionValid = sessionData?.valid ?? false;

  // Get dashboard stats
  const { stats, isLoading: statsLoading } = useStationStats(stationToken);

  // Get recent orders (pending and in_progress)
  const { orders: pendingOrders, isLoading: ordersLoading } = useStationOrders(
    stationToken,
    { status: 'pending' }
  );

  const { orders: inProgressOrders } = useStationOrders(
    stationToken,
    { status: 'in_progress' }
  );

  // Get all recent orders for activity feed
  const { orders: recentOrders } = useStationOrders(stationToken);

  // --- 24-Hour Reset Logic ---
  const [resetDashboard, setResetDashboard] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const LAST_RESET_KEY = 'dashboardLastReset';
    const now = new Date().getTime();
    const lastReset = parseInt(localStorage.getItem(LAST_RESET_KEY) || '0');

    if (!lastReset || now - lastReset > 24 * 60 * 60 * 1000) {
      // It's been 24h or more
      localStorage.setItem(LAST_RESET_KEY, now.toString());
      setResetDashboard(true);

      // Auto-refresh page after 1 second to show cleared dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, []);

  if (sessionLoading || !isSessionValid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const isLoading = statsLoading || ordersLoading;

  // If dashboard reset, show empty/0 values
  const displayedStats = resetDashboard
    ? {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {
          completed: 0,
          in_progress: 0,
          ready_for_pickup: 0,
          delivered: 0,
          cancelled: 0,
        },
      }
    : stats || {};

  const displayedPendingOrders = resetDashboard ? [] : pendingOrders;
  const displayedInProgressOrders = resetDashboard ? [] : inProgressOrders;
  const displayedRecentOrders = resetDashboard ? [] : recentOrders;

  const totalPending =
    (displayedPendingOrders?.length || 0) + (displayedInProgressOrders?.length || 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Orders"
          value={displayedStats.totalOrders ?? 0}
          icon={ShoppingBag}
          iconClassName="text-primary"
        />
        <StatCard
          title="Pending"
          value={totalPending}
          icon={Clock}
          iconClassName="text-orange-500"
          subtitle={displayedPendingOrders?.length ? `${displayedPendingOrders.length} new` : undefined}
        />
        <StatCard
          title="Revenue"
          value={`₵${displayedStats.totalRevenue?.toFixed(2) ?? '0.00'}`}
          icon={DollarSign}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Completed"
          value={displayedStats.ordersByStatus?.completed ?? 0}
          icon={CheckCircle}
          iconClassName="text-blue-500"
        />
        <StatCard
          title="Avg Order"
          value={`₵${displayedStats.averageOrderValue?.toFixed(2) ?? '0.00'}`}
          icon={TrendingUp}
          iconClassName="text-purple-500"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="bg-primary text-primary-foreground cursor-pointer hover:shadow-lg transition-all"
          onClick={() => router.push('/washstation/new-order')}
        >
          <CardContent className="p-6 md:p-8">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-1">
              Start New Walk-in Order
            </h3>
            <p className="text-primary-foreground/80 text-sm">
              Select Service & Customer
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => router.push('/washstation/customers')}
        >
          <CardContent className="p-6 md:p-8">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
              Find Customer
            </h3>
            <p className="text-muted-foreground text-sm">
              Search by phone, name, or ID
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all relative"
          onClick={() => router.push('/washstation/online-orders')}
        >
          {totalPending > 0 && (
            <div className="absolute top-4 right-4 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
              {totalPending} Pending
            </div>
          )}
          <CardContent className="p-6 md:p-8">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
              Online Orders
            </h3>
            <p className="text-muted-foreground text-sm">
              Review and accept incoming requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/washstation/orders">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text="Loading orders..." />
          ) : displayedRecentOrders && displayedRecentOrders.length > 0 ? (
            <OrderList
              orders={displayedRecentOrders.slice(0, 6)}
              onOrderClick={(orderId) =>
                router.push(`/washstation/orders/${orderId}`)
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="Start by creating a new walk-in order or wait for online orders to come in."
              action={{
                label: 'Create New Order',
                onClick: () => router.push('/washstation/new-order'),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Stats by Status */}
      {displayedStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                In Progress
              </div>
              <div className="text-2xl font-bold">
                {displayedStats.ordersByStatus?.in_progress ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Ready for Pickup
              </div>
              <div className="text-2xl font-bold">
                {displayedStats.ordersByStatus?.ready_for_pickup ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Delivered</div>
              <div className="text-2xl font-bold">
                {displayedStats.ordersByStatus?.delivered ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Cancelled</div>
              <div className="text-2xl font-bold">
                {displayedStats.ordersByStatus?.cancelled ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
