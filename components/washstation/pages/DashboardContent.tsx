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
  Banknote,
  Clock,
  ArrowRight,
  Globe,
  TrendingUp,
  Loader,
  Truck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardContent() {
  const router = useRouter();
  const { stationToken, sessionData, isLoading: sessionLoading } = useStationSession();
  const isSessionValid = sessionData?.valid ?? false;

  // ✅ stats is now always a fully-typed object — never undefined
  // isLoading covers both "token not ready" and "query in flight"
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

  // ── Removed the 24h resetDashboard logic ────────────────────────────────
  // It was the main reason numbers showed as 0: on every fresh page load
  // (cleared storage, new device, incognito) it wiped all stats to 0 and
  // triggered a reload — but by the time the reload happened Convex had
  // already returned real data which got thrown away.
  // Real data from Convex is always up to date; no local reset needed.
  // ────────────────────────────────────────────────────────────────────────

  if (sessionLoading || !isSessionValid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const isLoading = statsLoading || ordersLoading;

  const totalPending =
    (pendingOrders?.length || 0) + (inProgressOrders?.length || 0);

  const statusCards = [
    {
      label: 'In Progress',
      value: stats.ordersByStatus.in_progress,
      icon: Loader,
      colour: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Ready for Pickup',
      value: stats.ordersByStatus.ready_for_pickup,
      icon: CheckCircle,
      colour: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Delivered',
      value: stats.ordersByStatus.delivered,
      icon: Truck,
      colour: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'Cancelled',
      value: stats.ordersByStatus.cancelled,
      icon: XCircle,
      colour: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Top Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
        <div className="min-w-0 overflow-hidden">
          <StatCard
            title="Revenue"
            value={`₵${stats.totalRevenue.toFixed(2)}`}
            icon={Banknote}
            iconClassName="text-green-500"
          />
        </div>
        <StatCard
          title="Completed"
          value={stats.ordersByStatus.completed}
          icon={CheckCircle}
          iconClassName="text-blue-500"
        />
        <div className="min-w-0 overflow-hidden">
          <StatCard
            title="Avg Order"
            value={`₵${stats.averageOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            iconClassName="text-purple-500"
          />
        </div>
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

      {/* ── Quick Status Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          // ✅ Show skeletons while loading instead of 0s
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
                <div className="h-8 w-12 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : (
          statusCards.map(({ label, value, icon: Icon, colour, bg, border }) => (
            <Card key={label} className={`border-t-4 ${border} overflow-hidden`}>
              <CardContent className="p-4 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${colour}`} />
                  </div>
                  <span className="text-sm text-muted-foreground truncate">{label}</span>
                </div>
                <div className={`text-2xl font-bold truncate ${colour}`}>
                  {value}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────────── */}
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
          ) : recentOrders && recentOrders.length > 0 ? (
            <OrderList
              orders={recentOrders.slice(0, 6)}
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