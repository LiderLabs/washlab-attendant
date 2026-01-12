'use client';

import { useParams, useRouter } from 'next/navigation';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationOrder } from '@/hooks/useStationOrders';
import { useStationOrderStatus } from '@/hooks/useStationOrderStatus';
import { useStationAttendance } from '@/hooks/useStationAttendance';
import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';
import { EmptyState } from '@/components/washstation/EmptyState';
import { OrderStatusBadge } from '@/components/washstation/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { type OrderStatus } from '@/hooks/useStationOrders';
import { ActionVerification } from '@/components/washstation/ActionVerification';
import { Id } from "@devlider001/washlab-backend/dataModel";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { stationToken, isSessionValid } = useStationSession();
  const { order, isLoading } = useStationOrder(stationToken, orderId as any);
  const { changeStatus } = useStationOrderStatus(stationToken);
  
  // Get active attendances to find attendanceId
  const activeAttendances = useQuery(
    api.stations.getActiveStationAttendances,
    stationToken ? { stationToken } : 'skip'
  ) as Array<{
    _id: Id<'attendanceLogs'>;
    attendantId: Id<'attendants'>;
    attendant?: {
      _id: Id<'attendants'>;
      name: string;
      email: string;
    } | null;
  }> | undefined;

  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    status: OrderStatus;
    notes?: string;
  } | null>(null);

  const handleStatusUpdateClick = () => {
    if (!newStatus || !order) return;
    // Store the update and show verification
    setPendingStatusUpdate({ status: newStatus, notes: notes || undefined });
    setShowVerification(true);
  };

  const handleVerificationComplete = async (
    attendantId: Id<'attendants'>,
    verificationId: Id<'biometricVerifications'>
  ) => {
    if (!pendingStatusUpdate || !order) return;

    setShowVerification(false);
    setIsUpdating(true);

    // Find the attendance record for this attendant
    const attendance = activeAttendances?.find(
      (a) => a.attendantId === attendantId
    );
    const attendanceId = attendance?._id;

    // Now perform the status update with verification context
    const success = await changeStatus(
      order._id,
      pendingStatusUpdate.status,
      pendingStatusUpdate.notes,
      attendantId,
      attendanceId
    );
    
    if (success) {
      setNewStatus('');
      setNotes('');
      setPendingStatusUpdate(null);
    }

    setIsUpdating(false);
  };

  if (!isSessionValid) {
    return (
      <WashStationLayout title="Order Details">
        <LoadingSpinner text="Verifying session..." />
      </WashStationLayout>
    );
  }

  if (isLoading) {
    return (
      <WashStationLayout title="Order Details">
        <LoadingSpinner text="Loading order details..." />
      </WashStationLayout>
    );
  }

  if (!order) {
    return (
      <WashStationLayout title="Order Details">
        <EmptyState
          icon={Package}
          title="Order not found"
          description="The order you're looking for doesn't exist or you don't have access to it."
          action={{
            label: 'Back to Orders',
            onClick: () => router.push('/washstation/orders'),
          }}
        />
      </WashStationLayout>
    );
  }

  return (
    <WashStationLayout title={`Order #${order.orderNumber}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/washstation/orders')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {format(new Date(order.createdAt), 'PPp')}
                    </p>
                    {order.statusHistory && order.statusHistory.length > 0 && (() => {
                      const lastStatusChange = order.statusHistory[order.statusHistory.length - 1];
                      const assignedByName = lastStatusChange?.changedBy?.name;
                      return assignedByName ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned To: <span className="font-medium text-foreground text-green-500">{assignedByName}</span>
                        </p>
                      ) : null;
                    })()}
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                {order.customer && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{order.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{order.customer.phoneNumber}</span>
                      </div>
                      {order.customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{order.customer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Order Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Order Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Service Type</p>
                      <p className="font-medium">{order.serviceType || 'Wash & Fold'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-medium">{order.weight?.toFixed(2) || '0.00'} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge
                        variant={
                          order.paymentStatus === 'paid' ? 'default' : 'outline'
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery</p>
                      <p className="font-medium">
                        {order.isDelivery ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span>₵{order.totalPrice?.toFixed(2) || order.finalPrice.toFixed(2)}</span>
                  </div>
                  {order.deliveryFee && order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>₵{order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {order.totalPrice !== order.finalPrice && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Discount Applied</span>
                      <span>-₵{(order.totalPrice - order.finalPrice).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Final Total</span>
                    <span className="text-primary">
                      ₵{order.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.statusHistory
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {index < order.statusHistory!.length - 1 && (
                              <div className="w-0.5 h-full bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <OrderStatusBadge
                                status={entry.status as OrderStatus}
                              />
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(entry.changedAt),
                                  'MMM d, h:mm a'
                                )}
                              </span>
                            </div>
                            {entry.changedBy?.name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Updated by: <span className="font-medium text-foreground">{entry.changedBy.name}</span>
                              </p>
                            )}
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Update Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>New Status</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(v) => setNewStatus(v as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="ready_for_pickup">
                        Ready for Pickup
                      </SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add notes about this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleStatusUpdateClick}
                  disabled={!newStatus || isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setNewStatus('in_progress');
                      setPendingStatusUpdate({ status: 'in_progress' });
                      setShowVerification(true);
                    }}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Start Processing
                  </Button>
                )}
                {order.status === 'in_progress' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setNewStatus('ready_for_pickup');
                      setPendingStatusUpdate({ status: 'ready_for_pickup' });
                      setShowVerification(true);
                    }}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Mark Ready for Pickup
                  </Button>
                )}
                {order.status === 'ready_for_pickup' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setNewStatus('completed');
                      setPendingStatusUpdate({ status: 'completed' });
                      setShowVerification(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Identity Verification Modal */}
      <ActionVerification
        open={showVerification}
        onCancel={() => {
          setShowVerification(false);
          setPendingStatusUpdate(null);
        }}
        onVerified={handleVerificationComplete}
        actionType={`update_order_status:${pendingStatusUpdate?.status}`}
        orderId={order?._id}
      />
    </WashStationLayout>
  );
}
