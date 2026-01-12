'use client';

import { useState } from 'react';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationOrders, type OrderStatus } from '@/hooks/useStationOrders';
import { OrderList } from '@/components/washstation/OrderList';
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';
import { EmptyState } from '@/components/washstation/EmptyState';
import { OrderStatusBadge } from '@/components/washstation/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const { stationToken, isSessionValid } = useStationSession();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders based on selected status
  const { orders, isLoading, loadMore, hasMore } = useStationOrders(
    stationToken,
    selectedStatus !== 'all' ? { status: selectedStatus } : undefined
  );

  // Filter orders by search query
  const filteredOrders = orders?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.customer?.name.toLowerCase().includes(query) ||
      order.customer?.phoneNumber.includes(query)
    );
  });

  if (!isSessionValid) {
    return (
      <WashStationLayout title="Orders">
        <LoadingSpinner text="Verifying session..." />
      </WashStationLayout>
    );
  }

  return (
    <WashStationLayout title="Orders">
      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>All Orders</CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order number, customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Status Tabs */}
        <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as OrderStatus | 'all')}>
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
            {statusOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value} className="text-xs">
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-6">
            {isLoading ? (
              <LoadingSpinner text="Loading orders..." />
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <>
                <OrderList
                  orders={filteredOrders}
                  onOrderClick={(orderId) =>
                    window.location.href = `/washstation/orders/${orderId}`
                  }
                />
                {hasMore && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" onClick={() => loadMore(20)}>
                      Load More Orders
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Filter}
                title={`No ${selectedStatus === 'all' ? '' : selectedStatus.replace('_', ' ')} orders found`}
                description={
                  searchQuery
                    ? 'Try adjusting your search query'
                    : 'Orders will appear here once they are created'
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WashStationLayout>
  );
}
