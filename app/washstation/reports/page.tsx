'use client';

import { useState } from 'react';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationStats } from '@/hooks/useStationStats';
import { StatCard } from '@/components/washstation/StatCard';
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUp, DollarSign, ShoppingBag, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const { stationToken, isSessionValid } = useStationSession();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { stats, isLoading } = useStationStats(
    stationToken,
    startDate ? startDate.getTime() : undefined,
    endDate ? endDate.getTime() : undefined
  );

  if (!isSessionValid) {
    return (
      <WashStationLayout title="Reports">
        <LoadingSpinner text="Verifying session..." />
      </WashStationLayout>
    );
  }

  return (
    <WashStationLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Start Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'End Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        {isLoading ? (
          <LoadingSpinner text="Loading analytics..." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Orders"
                value={stats?.totalOrders ?? 0}
                icon={ShoppingBag}
                iconClassName="text-primary"
              />
              <StatCard
                title="Total Revenue"
                value={`₵${stats?.totalRevenue.toFixed(2) ?? '0.00'}`}
                icon={DollarSign}
                iconClassName="text-green-500"
              />
              <StatCard
                title="Completed Orders"
                value={stats?.ordersByStatus?.completed ?? 0}
                icon={CheckCircle}
                iconClassName="text-blue-500"
              />
              <StatCard
                title="Average Order Value"
                value={`₵${stats?.averageOrderValue.toFixed(2) ?? '0.00'}`}
                icon={TrendingUp}
                iconClassName="text-purple-500"
              />
            </div>

            {/* Orders by Status Breakdown */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{stats.ordersByStatus.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{stats.ordersByStatus.in_progress}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{stats.ordersByStatus.ready_for_pickup}</p>
                      <p className="text-sm text-muted-foreground">Ready</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{stats.ordersByStatus.delivered}</p>
                      <p className="text-sm text-muted-foreground">Delivered</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{stats.ordersByStatus.completed}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{stats.ordersByStatus.cancelled}</p>
                      <p className="text-sm text-muted-foreground">Cancelled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </WashStationLayout>
  );
}
