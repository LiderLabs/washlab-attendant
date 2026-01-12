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
  Smartphone,
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

  if (sessionLoading || !isSessionValid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const isLoading = statsLoading || ordersLoading;
  const totalPending = (pendingOrders?.length || 0) + (inProgressOrders?.length || 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
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
          value={`₵${stats?.totalRevenue.toFixed(2) ?? '0.00'}`}
          icon={DollarSign}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Completed"
          value={stats?.ordersByStatus?.completed ?? 0}
          icon={CheckCircle}
          iconClassName="text-blue-500"
        />
        <StatCard
          title="Avg Order"
          value={`₵${stats?.averageOrderValue.toFixed(2) ?? '0.00'}`}
          icon={TrendingUp}
          iconClassName="text-purple-500"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Start New Walk-in Order */}
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

        {/* Find Customer */}
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

        {/* Online Orders */}
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
          ) : recentOrders && recentOrders.length > 0 ? (
            <OrderList
              orders={recentOrders.slice(0, 6)}
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
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                In Progress
              </div>
              <div className="text-2xl font-bold">
                {stats.ordersByStatus.in_progress}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Ready for Pickup
              </div>
              <div className="text-2xl font-bold">
                {stats.ordersByStatus.ready_for_pickup}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Delivered</div>
              <div className="text-2xl font-bold">
                {stats.ordersByStatus.delivered}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Cancelled</div>
              <div className="text-2xl font-bold">
                {stats.ordersByStatus.cancelled}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
