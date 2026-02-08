'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Id } from '@devlider001/washlab-backend/dataModel';
import { 
  Clock,
  Package,
  CheckCircle,
  Truck,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type OrderStatus = 
  | 'pending_dropoff'
  | 'checked_in'
  | 'sorting'
  | 'washing'
  | 'drying'
  | 'folding'
  | 'ready'
  | 'completed'
  | 'cancelled'
  // Legacy statuses
  | 'pending'
  | 'in_progress'
  | 'ready_for_pickup'
  | 'delivered';

interface Order {
  _id: Id<'orders'>;
  orderNumber: string;
  status: OrderStatus;
  serviceType?: string;
  actualWeight?: number;
  estimatedWeight?: number;
  finalPrice: number;
  createdAt: number;
  customer?: {
    name: string;
    phoneNumber: string;
    email?: string;
  } | null;
}

interface OrdersTableProps {
  orders: Order[];
  onOrderClick?: (orderId: Id<'orders'>) => void;
}

const getStatusBadge = (status: OrderStatus) => {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending_dropoff: { label: 'New Order', className: 'bg-primary/10 text-primary', icon: Clock },
    pending: { label: 'New Order', className: 'bg-primary/10 text-primary', icon: Clock },
    checked_in: { label: 'Checked in', className: 'bg-warning/10 text-warning', icon: Package },
    sorting: { label: 'sorting', className: 'bg-warning/10 text-warning', icon: Package },
    washing: { label: 'washing', className: 'bg-warning/10 text-warning', icon: Package },
    drying: { label: 'drying', className: 'bg-warning/10 text-warning', icon: Package },
    folding: { label: 'folding', className: 'bg-warning/10 text-warning', icon: Package },
    in_progress: { label: 'in progress', className: 'bg-warning/10 text-warning', icon: Package },
    ready: { label: 'Ready for Pickup', className: 'bg-success/10 text-success', icon: CheckCircle },
    ready_for_pickup: { label: 'Ready for Pickup', className: 'bg-success/10 text-success', icon: CheckCircle },
    completed: { label: 'Delivered', className: 'bg-muted text-muted-foreground', icon: Truck },
    delivered: { label: 'Delivered', className: 'bg-muted text-muted-foreground', icon: Truck },
    cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive', icon: Clock },
  };
  return statusConfig[status] || statusConfig.pending_dropoff;
};

export function OrdersTable({ orders, onOrderClick }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service Type</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const status = getStatusBadge(order.status);
            const StatusIcon = status.icon;
            const weight = order.actualWeight || order.estimatedWeight || 0;
            const serviceType = order.serviceType?.replace('_', ' & ') || 'Wash & Fold';
            
            return (
              <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <span className="font-semibold text-foreground">{order.orderNumber}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {order.customer?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'CU'}
                    </div>
                    <span className="font-medium text-foreground">{order.customer?.name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {serviceType} ({weight.toFixed(1)}kg)
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.className}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => onOrderClick?.(order._id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
