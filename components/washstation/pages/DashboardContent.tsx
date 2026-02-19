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
  Banknote,
  Clock,
  ArrowRight,
  Globe,
  Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export function DashboardContent() {
  const router = useRouter();
  const { stationToken, sessionData, isLoading: sessionLoading } = useStationSession();
  const isSessionValid = sessionData?.valid ?? false;

  const { stats, isLoading: statsLoading } = useStationStats(stationToken);

  const { orders: pendingOrders, isLoading: ordersLoading } = useStationOrders(
    stationToken,
    { status: 'pending' }
  );

  const { orders: inProgressOrders } = useStationOrders(
    stationToken,
    { status: 'in_progress' }
  );

  const { orders: recentOrders } = useStationOrders(stationToken);

  const isLoading = statsLoading || ordersLoading;

  const totalPending = (pendingOrders?.length || 0) + (inProgressOrders?.length || 0);

  // ── Rolling Recent Orders ───────────────────────────────────────────────
  const [ordersToShow, setOrdersToShow] = useState(recentOrders?.slice(0, 6) ?? []);

  useEffect(() => {
    if (recentOrders?.length) {
      const sortedOrders = [...recentOrders]
        .filter(order => order.status !== 'delivered') // show only active or recently completed
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6);

      setOrdersToShow(sortedOrders);
    }
  }, [recentOrders]);

  // Optional: 24h refresh logic (reload page if day changes)
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msToMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      window.location.reload();
    }, msToMidnight);

    return () => clearTimeout(timer);
  }, []);

  if (sessionLoading || !isSessionValid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Top Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          iconClassName="text-primary"
        />
        <StatCard
          title="Pending"
          value={totalPending}
          icon={Clock}
          iconClassName="text-orange-500"
          subtitle={pendingOrders?.length ? `${pendingOrders.length} new` : undefined}
        />
        <StatCard
          title="Revenue"
          value={`₵${stats.totalRevenue.toFixed(2)}`}
          icon={Banknote}
          iconClassName="text-green-500"
        />
        <StatCard
          title="In Progress"
          value={stats.ordersByStatus.in_progress}
          icon={Loader}
          iconClassName="text-blue-500"
        />
      </div>

      {/* ── Action Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="bg-primary text-primary-foreground cursor-pointer hover:shadow-lg transition-all"
          onClick={() => router.push('/washstation/new-order')}
        >
          <CardContent className="p-6 md:p-8">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-1">Start New Walk-in Order</h3>
            <p className="text-primary-foreground/80 text-sm">Select Service & Customer</p>
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
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">Find Customer</h3>
            <p className="text-muted-foreground text-sm">Search by phone, name, or ID</p>
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
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">Online Orders</h3>
            <p className="text-muted-foreground text-sm">Review and accept incoming requests</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Orders / Live Feed ───────────────────────────────────────── */}
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
          ) : ordersToShow && ordersToShow.length > 0 ? (
            <OrderList
              orders={ordersToShow}
              onOrderClick={(orderId) => router.push(`/washstation/orders/${orderId}`)}
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
    </div>
  );
}
