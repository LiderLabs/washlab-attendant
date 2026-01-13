'use client';

import { useParams, useRouter } from 'next/navigation';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationOrder } from '@/hooks/useStationOrders';
import { useStationOrderStatus } from '@/hooks/useStationOrderStatus';
import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';
import { EmptyState } from '@/components/washstation/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Package,
  CheckCircle,
  Clock,
  Droplets,
  Wind,
  Shirt,
  Truck,
  MapPin,
  Scale,
  Tag,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { type OrderStatus } from '@/hooks/useStationOrders';
import { ActionVerification } from '@/components/washstation/ActionVerification';
import { Id } from "@devlider001/washlab-backend/dataModel";
import { toast } from 'sonner';

// Washing stages in order (including pending_dropoff for online orders)
const WASH_STAGES = [
  { id: 'pending_dropoff', label: 'Pending Dropoff', icon: Package, requiresVerification: false },
  { id: 'checked_in', label: 'Received', icon: Package, requiresVerification: false },
  { id: 'sorting', label: 'Sorting', icon: Package, requiresVerification: false },
  { id: 'washing', label: 'Washing', icon: Droplets, requiresVerification: false },
  { id: 'drying', label: 'Drying', icon: Wind, requiresVerification: false },
  { id: 'folding', label: 'Folding', icon: Shirt, requiresVerification: false },
  { id: 'ready', label: 'Ready', icon: CheckCircle, requiresVerification: false },
  { id: 'completed', label: 'Delivered', icon: Truck, requiresVerification: true }, // Only handover needs verification
];

// Map legacy statuses to new statuses
const mapLegacyStatus = (status: string): string => {
  const mapping: Record<string, string> = {
    'pending': 'pending_dropoff',
    'in_progress': 'washing',
    'ready_for_pickup': 'ready',
    'delivered': 'completed',
  };
  return mapping[status] || status;
};

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
    clockInAt: number;
    deviceId: string;
    attendant: {
      _id: Id<'attendants'>;
      name: string;
      email: string;
    } | null;
  }> | undefined;

  const [isUpdating, setIsUpdating] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingStage, setPendingStage] = useState<string | null>(null);

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

  // Map order status to current stage
  const currentStatus = mapLegacyStatus(order.status);
  const currentStageIndex = WASH_STAGES.findIndex(s => s.id === currentStatus);
  
  // If status not found in stages, try to find it or default to first stage
  // This handles cases where status might not be in WASH_STAGES
  const effectiveStageIndex = currentStageIndex >= 0 
    ? currentStageIndex 
    : (order.status === 'pending' || order.status === 'pending_dropoff' ? 0 : -1);
  
  const nextStage = effectiveStageIndex >= 0 && effectiveStageIndex < WASH_STAGES.length - 1 
    ? WASH_STAGES[effectiveStageIndex + 1] 
    : null;

  const handleAdvanceStage = (stageId: string) => {
    const stage = WASH_STAGES.find(s => s.id === stageId);
    
    // Only require verification for final handover
    if (stage?.requiresVerification) {
      setPendingStage(stageId);
      setShowVerification(true);
    } else {
      // Direct stage transition - NO verification needed
      handleStatusUpdate(stageId as OrderStatus);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const success = await changeStatus(
        order._id,
        newStatus,
        undefined,
        undefined,
        undefined
      );
      
      if (success) {
        const stage = WASH_STAGES.find(s => s.id === newStatus);
        toast.success(`Order advanced to ${stage?.label || newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifySuccess = async (
    attendantId: Id<'attendants'>,
    verificationId: Id<'biometricVerifications'>
  ) => {
    if (!pendingStage || !order) return;

    setShowVerification(false);
    setIsUpdating(true);

    // Find the attendance record for this attendant
    const attendance = activeAttendances?.find(
      (a) => a.attendant?._id === attendantId
    );
    const attendanceId = attendance?._id;

    try {
      const success = await changeStatus(
        order._id,
        pendingStage as OrderStatus,
        undefined,
        attendantId,
        attendanceId
      );
      
      if (success) {
        const stage = WASH_STAGES.find(s => s.id === pendingStage);
        toast.success(`Order advanced to ${stage?.label}`);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
      setPendingStage(null);
    }
  };

  const getStatusColor = (stageId: string) => {
    const stageIndex = WASH_STAGES.findIndex(s => s.id === stageId);
    const effectiveCurrentIndex = currentStageIndex >= 0 ? currentStageIndex : effectiveStageIndex;
    if (stageIndex < effectiveCurrentIndex) return 'bg-success text-success-foreground';
    if (stageIndex === effectiveCurrentIndex) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <WashStationLayout title={`Order #${order.orderNumber}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/washstation/orders')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(order.createdAt), 'PPp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                      className={order.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
                    >
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </Badge>
                    <Badge className={getStatusColor(currentStatus)}>
                      {WASH_STAGES.find(s => s.id === currentStatus)?.label || currentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between overflow-x-auto pb-2">
                  {WASH_STAGES.slice(0, -1).map((stage, index) => {
                    const StageIcon = stage.icon;
                    const effectiveCurrentIndex = currentStageIndex >= 0 ? currentStageIndex : effectiveStageIndex;
                    const isCompleted = index < effectiveCurrentIndex;
                    const isCurrent = index === effectiveCurrentIndex;
                    
                    return (
                      <div key={stage.id} className="flex items-center">
                        <div className={`flex flex-col items-center ${index < WASH_STAGES.length - 2 ? 'flex-1' : ''}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-success text-success-foreground' :
                            isCurrent ? 'bg-primary text-primary-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            <StageIcon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs mt-2 ${
                            isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                        {index < WASH_STAGES.length - 2 && (
                          <div className={`h-1 w-16 mx-2 rounded ${
                            isCompleted ? 'bg-success' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardHeader>
            </Card>

            {/* Bag Card Number */}
            {order.bagCardNumber && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Bag Card
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">#{order.bagCardNumber}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Card Number</p>
                      <p className="text-lg font-semibold text-foreground">#{order.bagCardNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Wash & Fold</p>
                        <p className="text-sm text-muted-foreground">
                          {(order.actualWeight || order.estimatedWeight || 0).toFixed(2)}kg
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">
                      ₵{order.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-border mt-4 pt-4 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-xl text-primary">
                    ₵{order.finalPrice.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {nextStage && order.status !== 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Payment gate - cannot process until paid */}
                  {order.paymentStatus !== 'paid' && currentStatus === 'checked_in' && (
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-4">
                      <p className="text-warning font-medium flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Required
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Staff cannot proceed to processing until order is paid.
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    size="lg"
                    className="w-full"
                    onClick={() => handleAdvanceStage(nextStage.id)}
                    disabled={isUpdating}
                  >
                    <nextStage.icon className="w-5 h-5 mr-2" />
                    Move to {nextStage.label}
                    {nextStage.requiresVerification && (
                      <span className="ml-2 text-xs opacity-75">(Requires Verification)</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customer Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.customer?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>
                
                {order.customer?.phoneNumber && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{order.customer.phoneNumber}</span>
                  </div>
                )}
                
                {order.customer?.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{order.customer.email}</span>
                  </div>
                )}

                {order.deliveryHall && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <span className="text-foreground">
                      {order.deliveryHall} - Room {order.deliveryRoom || 'N/A'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Order Created</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  {order.paymentStatus === 'paid' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success mt-2" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Payment Confirmed</p>
                        <p className="text-xs text-muted-foreground">
                          {order.statusHistory?.find(e => e.status === 'checked_in') 
                            ? format(new Date(order.statusHistory.find(e => e.status === 'checked_in')!.changedAt), 'PPp')
                            : 'Confirmed'}
                        </p>
                      </div>
                    </div>
                  )}
                  {currentStatus !== 'pending_dropoff' && currentStatus !== 'checked_in' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Processing</p>
                        <p className="text-xs text-muted-foreground">In progress</p>
                      </div>
                    </div>
                  )}
                </div>
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
          setPendingStage(null);
        }}
        onVerified={handleVerifySuccess}
        actionType={`update_order_status:${pendingStage || 'completed'}`}
        orderId={order?._id}
      />
    </WashStationLayout>
  );
}
