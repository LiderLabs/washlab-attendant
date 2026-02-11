'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WashStationLayout } from "@/components/washstation/WashStationLayout";
import { useStationSession } from "@/hooks/useStationSession";
import { useStationOrder } from "@/hooks/useStationOrders";
import { useMutation } from "convex/react";
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { ActionVerification } from "@/components/washstation/ActionVerification";
import { Banknote, Smartphone, CreditCard, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";

type PaymentMethodWalkIn = "cash" | "mobile_money";
type PaymentMethodOnline = "card" | "mobile_money" | "cash";
type PaymentMethodType = PaymentMethodWalkIn | PaymentMethodOnline;

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stationToken } = useStationSession();

  const [branchName] = useState(() => {
    if (typeof window === "undefined") return "Central Branch";
    try {
      const d = sessionStorage.getItem("washlab_branch");
      return d ? (JSON.parse(d).name || "Central Branch") : "Central Branch";
    } catch {
      return "Central Branch";
    }
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("mobile_money");
  const [showVerification, setShowVerification] = useState(false);

  const completeWalkInPayment = useMutation(api.stations.completeWalkInPayment);
  const completeOnlinePayment = useMutation((api as any).stations.completeOnlinePayment);

  const orderIdParam = searchParams?.get("orderId");
  const returnTo = searchParams?.get("return");
  
  const { order, isLoading: isLoadingOrder } = useStationOrder(
    stationToken,
    orderIdParam ? (orderIdParam as Id<"orders">) : null
  );

  const subtotal = order ? (order.basePrice || 0) + (order.deliveryFee || 0) : 0;
  const totalDue = order?.finalPrice || order?.totalPrice || subtotal || 0;

  const effectivePaymentMethod: PaymentMethodType = paymentMethod;

  const handleCompletePayment = () => {
    if (!order) {
      toast.error("Order not found");
      return;
    }

    setShowVerification(true);
  };

  const handleVerificationSuccess = async (
    attendantId: Id<"attendants">,
    verificationId: Id<"biometricVerifications">
  ) => {
    setShowVerification(false);

    if (!order || !stationToken) {
      toast.error("Order or session not found");
      return;
    }

    const isOnline = order.orderType === "online";

    try {
      if (isOnline) {
        const result = await completeOnlinePayment({
          stationToken,
          orderId: order._id,
          paymentMethod: effectivePaymentMethod === "mobile_money" ? "mobile_money" : effectivePaymentMethod === "cash" ? "cash" : "card",
          verificationId,
        });
        if (effectivePaymentMethod === "mobile_money" && result.ussdSent) {
          toast.success("USSD code sent to customer. Payment pending confirmation.");
        } else {
          toast.success("Payment completed successfully!");
        }
      } else {
        const result = await completeWalkInPayment({
          stationToken,
          orderId: order._id,
          paymentMethod: effectivePaymentMethod === "mobile_money" ? "mobile_money" : "cash",
          verificationId,
          amountTendered: effectivePaymentMethod === "cash" ? totalDue : undefined,
        });
        if (effectivePaymentMethod === "mobile_money" && result.ussdSent) {
          toast.success("USSD code sent to customer. Payment pending confirmation.");
        } else {
          toast.success("Payment completed successfully!");
        }
      }

      router.push(
        `/washstation/order-complete?orderId=${order._id}&paymentMethod=${effectivePaymentMethod}&amountPaid=${totalDue}&changeDue=${order.orderType === "walk_in" && effectivePaymentMethod === "cash" ? 0 : 0}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete payment");
    }
  };

  const handleCancel = () => router.push("/washstation/dashboard");

  // FIXED: Improved back button logic
  const handleBackNavigation = () => {
    if (returnTo === "order" && order) {
      // Store order context before navigating back to preserve state
      if (order.customer || order.customerId) {
       sessionStorage.setItem('washlab_prefilledCustomer', JSON.stringify({
  id: order.customer?._id || order.customerId,
  name: order.customer?.name || "Customer", // fallback if missing
  phone: order.customer?.phoneNumber || order.customerPhoneNumber || "",
  email: order.customer?.email || "",
  skipPhone: true
}));

      }
      router.push(`/washstation/new-order`);
    } else {
      router.back();
    }
  };

  if (isLoadingOrder) {
    return (
      <WashStationLayout title="Payment">
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <p className='text-muted-foreground'>Loading order details...</p>
        </div>
      </WashStationLayout>
    );
  }

  if (!order) {
    return (
      <WashStationLayout title="Payment">
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center'>
            <p className='text-destructive mb-4'>Order not found</p>
            <Button onClick={handleCancel}>Back to Dashboard</Button>
          </div>
        </div>
      </WashStationLayout>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <WashStationLayout title="Payment">
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center'>
            <p className='text-success font-medium mb-2'>This order is already paid</p>
            <p className='text-muted-foreground text-sm mb-4'>Order #{order.orderNumber}</p>
            <Button onClick={() => router.push(`/washstation/orders/${order._id}`)}>View Order</Button>
          </div>
        </div>
      </WashStationLayout>
    );
  }

  return (
    <WashStationLayout title="Payment">
      <div className='flex flex-col h-[calc(100vh-200px)]'>
        {/* Back Button - FIXED */}
        {returnTo && (
          <div className='px-6 pt-4'>
            <button
              onClick={handleBackNavigation}
              className='flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Order Details
            </button>
          </div>
        )}

        <div className='flex flex-1'>
          {/* Left - Order Summary */}
          <div className='w-80 border-r border-border bg-card p-6 flex flex-col'>
            <div className='mb-4'>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-xs text-muted-foreground uppercase'>CURRENT ORDER</span>
                <span className='px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full'>Ready for Payment</span>
              </div>
              <h2 className='text-xl font-bold text-foreground'>Order #{order?.orderNumber || "N/A"}</h2>
              <p className='text-xs text-muted-foreground flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                {order?.createdAt ? `Created at ${new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Loading..."}
              </p>
            </div>

            {/* Customer Info */}
            <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4'>
              <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                <span className='text-sm font-semibold text-muted-foreground'>
                  {order.customer?.name?.split(" ").map(n => n[0]).join("").slice(0,2) || "CU"}
                </span>
              </div>
              <div>
                <p className='font-medium text-foreground'>{order.customer?.name || "Customer"}</p>
                <p className='text-xs text-muted-foreground'>{order.customerPhoneNumber || "No phone"}</p>
              </div>
            </div>

            {/* Totals */}
            <div className='border-t border-border pt-4 mt-4 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span className='text-foreground'>₵{subtotal.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Delivery Fee</span>
                  <span className='text-foreground'>₵{order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Tax (0%)</span>
                <span className='text-foreground'>₵0.00</span>
              </div>
              <div className='flex justify-between pt-2 border-t border-border'>
                <span className='font-medium text-foreground'>Total Due</span>
                <span className='text-2xl font-bold text-primary'>₵{totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right - Payment Methods */}
          <div className='flex-1 p-6'>
            <h2 className='text-xl font-bold text-foreground mb-1'>Select Payment Method</h2>
            <p className='text-muted-foreground mb-6'>Choose how the customer would like to pay.</p>

            {/* Payment Buttons */}
            <div className='grid gap-4 mb-8 max-w-md grid-cols-2'>
              {/* Mobile Money first */}
              <button
                onClick={() => setPaymentMethod("mobile_money")}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 relative ${
                  effectivePaymentMethod === "mobile_money"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  effectivePaymentMethod === "mobile_money" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <Smartphone className='w-6 h-6' />
                </div>
                <span className={`font-medium ${effectivePaymentMethod === "mobile_money" ? "text-primary" : "text-foreground"}`}>Mobile Money</span>
                {effectivePaymentMethod === "mobile_money" && (
                  <div className='absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs'>✓</div>
                )}
              </button>

              {/* Cash (walk-in and online: attendant can collect cash at check-in) */}
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 relative ${
                  effectivePaymentMethod === "cash"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  effectivePaymentMethod === "cash" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <Banknote className='w-6 h-6' />
                </div>
                <span className={`font-medium ${effectivePaymentMethod === "cash" ? "text-primary" : "text-foreground"}`}>Cash</span>
                {effectivePaymentMethod === "cash" && (
                  <div className='absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs'>✓</div>
                )}
              </button>
            </div>

            {/* Cash UI (walk-in and online) */}
            {effectivePaymentMethod === "cash" && (
              <div className='p-6 bg-muted/20 rounded-xl text-center mb-8'>
                <h3 className='text-lg font-semibold text-foreground mb-2'>Cash Payment</h3>
                <p className='text-muted-foreground mb-4'>The customer must pay the exact amount below.</p>
                <p className='text-3xl font-bold text-primary'>₵{totalDue.toFixed(2)}</p>
              </div>
            )}

            {/* Mobile Money UI */}
            {effectivePaymentMethod === "mobile_money" && (
              <div className='bg-muted/30 rounded-xl p-8 text-center mb-8'>
                <div className='w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center'>
                  <Smartphone className='w-8 h-8 text-primary' />
                </div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>Mobile Money Payment</h3>
                <p className='text-muted-foreground mb-4'>
                  A payment prompt will be sent to the customer's mobile number.
                </p>
                <p className='text-2xl font-bold text-primary'>₵{totalDue.toFixed(2)}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-4'>
              <Button onClick={handleCancel} variant='outline' className='flex-1 h-14 rounded-xl text-lg'>Cancel</Button>
              <Button
                onClick={handleCompletePayment}
                className="flex-1 h-14 rounded-xl text-lg bg-primary text-primary-foreground"
              >
                Complete Payment <ArrowRight className='w-5 h-5 ml-2' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ActionVerification
        open={showVerification}
        onCancel={() => setShowVerification(false)}
        onVerified={handleVerificationSuccess}
        actionType={`complete_payment:₵${totalDue.toFixed(2)}`}
        orderId={order?._id}
      />
    </WashStationLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}