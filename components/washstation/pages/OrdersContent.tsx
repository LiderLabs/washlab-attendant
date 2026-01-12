'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrders } from '@/context/OrderContext';
import { 
  Search,
  Clock,
  Package,
  CheckCircle,
  Truck,
  Eye
} from 'lucide-react';

export function OrdersContent() {
  const router = useRouter();
  const { orders } = useOrders();
  const [filter, setFilter] = useState<'all' | 'processing' | 'ready' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending_dropoff: { label: 'New Order', className: 'bg-primary/10 text-primary', icon: Clock },
      checked_in: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      washing: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      drying: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      folding: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      ready: { label: 'Ready for Pickup', className: 'bg-success/10 text-success', icon: CheckCircle },
      completed: { label: 'Delivered', className: 'bg-muted text-muted-foreground', icon: Truck }
    };
    return statusConfig[status] || statusConfig.pending_dropoff;
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all') {
      if (filter === 'processing') {
        if (!['checked_in', 'washing', 'drying', 'folding'].includes(order.status)) return false;
      } else if (filter === 'ready') {
        if (order.status !== 'ready') return false;
      } else if (filter === 'completed') {
        if (order.status !== 'completed') return false;
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.code?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerPhone?.includes(query)
      );
    }
    return true;
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <>
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by order ID, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-xl p-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'processing', label: 'Processing' },
            { id: 'ready', label: 'Ready' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.id 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="hidden md:table-cell text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service Type</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const status = getStatusBadge(order.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <span className="font-semibold text-foreground">{order.code}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                            {order.customerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'CU'}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[150px]">{order.customerName}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-muted-foreground">
                        {order.items?.[0]?.category?.replace('_', ' & ') || 'Wash & Fold'} ({order.weight || 5}kg)
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.className}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-muted-foreground text-sm">
                        {getTimeAgo(order.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary/80"
                          onClick={() => router.push(`/washstation/orders/${order.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
