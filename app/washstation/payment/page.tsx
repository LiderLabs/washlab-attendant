'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WashStationLayout } from "@/components/washstation/WashStationLayout";
import { useStationSession } from "@/hooks/useStationSession";
import { useStationOrder } from "@/hooks/useStationOrders";
import { useMutation } from "convex/react";
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { ActionVerification } from "@/components/washstation/ActionVerification";
import {
  Banknote, Smartphone, CreditCard,
  ArrowRight, ArrowLeft, Clock, CheckCircle2, Loader2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";


type PaymentMethodType = "cash" | "mobile_money" | "card";
type Stage = "idle" | "verification" | "paystack" | "finalizing";

function usePaystackScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).PaystackPop) { setLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);
  return loaded;
}


function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Pull isSessionValid — gates useStationOrder so it never fires
  // before the session token is confirmed, fixing "Invalid station session"
  const { stationToken, isSessionValid } = useStationSession();
  const paystackLoaded = usePaystackScript();

  const createPayment = useMutation((api as any).payments.create);
  const initiatePayment = useMutation((api as any).payments.initiate);
  const finalizePaymentSafe = useMutation((api as any).payments.finalizePaymentSafe);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("mobile_money");
  const [showVerification, setShowVerification] = useState(false);
  const [mobileView, setMobileView] = useState<"summary" | "payment">("payment");

  const [stage, setStage] = useState<Stage>("idle");
  const isProcessing = stage !== "idle";

  const [paystackRef, setPaystackRef] = useState<string | null>(null);
  const pendingVerificationId = useRef<Id<"biometricVerifications"> | null>(null);
  const paystackHandlerRef = useRef<any>(null);
  const isPaying = useRef(false);

  const orderIdParam = searchParams?.get("orderId");
  const returnTo = searchParams?.get("return");

  // ✅ isSessionValid passed as third arg — query skips until session confirmed
  const { order, isLoading: isLoadingOrder } = useStationOrder(
    stationToken,
    orderIdParam ? (orderIdParam as Id<"orders">) : null,
    isSessionValid  // ← THIS IS THE FIX
  );

  const subtotal = order ? (order.basePrice || 0) + (order.deliveryFee || 0) : 0;
  const totalDue = order?.finalPrice || order?.totalPrice || subtotal || 0;

  const effectivePaymentMethod: PaymentMethodType = paymentMethod;

  // ─── Step 1: Attendant clicks "Verify & Pay" ─────────────────────────────────

  const handleCompletePayment = () => {
    if (!order) { toast.error("Order not found"); return; }
    if (isPaying.current || isProcessing) return;
    if (!paystackLoaded && effectivePaymentMethod !== "cash") {
      toast.error("Payment processor not ready. Please wait a moment and try again.");
      return;
    }

    setStage("verification");
    setShowVerification(true);
  };

  // ─── Step 2: Verification passed ─────────────────────────────────────────────

  const handleVerificationSuccess = async (
    attendantId: Id<"attendants">,
    verificationId: Id<"biometricVerifications">
  ) => {
    setShowVerification(false);
    if (!order) { toast.error("Order not found"); setStage("idle"); return; }

    try {
      const paymentId = await createPayment({
        orderId: order._id,
        amount: totalDue,
        paymentMethod: effectivePaymentMethod,
      });

      if (effectivePaymentMethod !== "cash") {
        await initiatePayment({ paymentId });
        pendingVerificationId.current = verificationId;
        openPaystack(effectivePaymentMethod as "card" | "mobile_money", verificationId);
        return;
      }

      finalizePayment({ verificationId, gatewayTransactionId: null });

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start payment");
      setStage("idle");
    }
  };

  // ─── Step 3: Open Paystack iframe ────────────────────────────────────────────

  const openPaystack = (
    method: "card" | "mobile_money",
    verificationId: Id<"biometricVerifications">
  ) => {
    if (!order || !paystackLoaded) return;
    if (paystackHandlerRef.current) { toast.error("A payment popup is already open."); return; }

    const ref = `washlab_${order._id}_${Date.now()}`;
    setPaystackRef(ref);

    const channels = method === "card" ? ["card"] : ["mobile_money"];
    const rawPhone = order.customer?.phoneNumber || order.customerPhoneNumber || "";
    const customerPhone = rawPhone.replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "233");

    setStage("paystack");
    toast.info("Payment window opening for customer…");

    const handler = (window as any).PaystackPop.setup({
      key: "pk_test_0bcc36edcd86cbe2439fc3274f5e6b6e501c4730",
      email: order.customer?.email || order.customerEmail || "customer@washlab.com",
      amount: Math.round(totalDue * 100),
      currency: "GHS",
      ref,
      channels,
      ...(customerPhone ? { phone: customerPhone } : {}),

      callback: function (response: any) {
        paystackHandlerRef.current = null;
        toast.success(`${method === "card" ? "Card" : "Mobile Money"} payment authorised`);
        finalizePayment({
          verificationId,
          gatewayTransactionId: response.reference || response.trxref || ref,
        });
      },

      onClose: function () {
        paystackHandlerRef.current = null;
        pendingVerificationId.current = null;
        setPaystackRef(null);
        setStage("idle");
        isPaying.current = false;
        toast.warning("Customer closed the payment window. You can try again.");
      },
    });

    paystackHandlerRef.current = handler;
    handler.openIframe();
  };

  // ─── Step 4: Finalize payment on backend ─────────────────────────────────────

  const finalizePayment = async ({
    verificationId,
    gatewayTransactionId,
  }: {
    verificationId: Id<"biometricVerifications">;
    gatewayTransactionId: string | null;
  }) => {
    if (!order) return;
    if (isPaying.current) { toast.error("Payment is already being processed."); return; }

    isPaying.current = true;
    setStage("finalizing");
    toast.loading("Finalizing payment…", { id: "finalizing" });

    try {
      const result = await finalizePaymentSafe({
        orderId: order._id,
        verificationId,
        gatewayTransactionId: gatewayTransactionId ?? undefined,
      });

      toast.dismiss("finalizing");

      if ((result as any)?.alreadyCompleted) {
        toast.info("This payment was already completed.");
      } else {
        toast.success("Payment completed successfully!");
      }

      sessionStorage.removeItem(`checkin_draft_${order._id}`);

      setPaystackRef(null);
      setStage("idle");
      isPaying.current = false;

      router.push(
        `/washstation/order-complete?orderId=${order._id}&paymentMethod=${effectivePaymentMethod}&amountPaid=${totalDue}&changeDue=0`
      );
    } catch (error) {
      toast.dismiss("finalizing");
      toast.error(error instanceof Error ? error.message : "Failed to finalize payment");
      setStage("idle");
      isPaying.current = false;
      pendingVerificationId.current = null;
    }
  };

  // ─── Verification cancelled ───────────────────────────────────────────────────

  const handleVerificationCancel = () => {
    setShowVerification(false);
    pendingVerificationId.current = null;
    setStage("idle");
    isPaying.current = false;
    toast.info("Verification cancelled. Payment not processed.");
  };

  // ─── Navigation ──────────────────────────────────────────────────────────────

  const handleCancel = () => {
    if (isProcessing) return;
    router.push("/washstation/dashboard");
  };

  const handleBackNavigation = () => {
    if (isProcessing) return;
    if (returnTo === "order" && order) {
      if (order.customer || order.customerId) {
        sessionStorage.setItem("washlab_prefilledCustomer", JSON.stringify({
          id: order.customer?._id || order.customerId,
          name: order.customer?.name || "Customer",
          phone: order.customer?.phoneNumber || order.customerPhoneNumber || "",
          email: order.customer?.email || "",
          skipPhone: true,
        }));
      }
      router.push("/washstation/new-order");
    } else {
      router.push(`/washstation/online-orders?returnOrder=${order?._id}`);
    }
  };

  const stageLabel: Record<Stage, string | null> = {
    idle: null,
    verification: "Waiting for attendant verification…",
    paystack: "Waiting for customer payment…",
    finalizing: "Finalizing payment…",
  };

  // ─── Loading / error states ───────────────────────────────────────────────────

  // ✅ Show spinner while session verifying OR order loading
  if (!isSessionValid || isLoadingOrder) {
    return (
      <WashStationLayout title="Payment">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading order details…</span>
          </div>
        </div>
      </WashStationLayout>
    );
  }

  if (!order) {
    return (
      <WashStationLayout title="Payment">
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center space-y-4">
            <p className="text-destructive font-medium">Order not found</p>
            <Button onClick={handleCancel}>Back to Dashboard</Button>
          </div>
        </div>
      </WashStationLayout>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <WashStationLayout title="Payment">
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
            <p className="text-success font-semibold">This order is already paid</p>
            <p className="text-muted-foreground text-sm">Order #{order.orderNumber}</p>
            <Button onClick={() => router.push(`/washstation/orders/${order._id}`)}>View Order</Button>
          </div>
        </div>
      </WashStationLayout>
    );
  }

  // ─── Panels ───────────────────────────────────────────────────────────────────

  const OrderSummaryPanel = () => (
    <div className="flex flex-col h-full p-4 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Order</span>
          <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full whitespace-nowrap">
            Ready for Payment
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Order #{order.orderNumber || "N/A"}</h2>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3 flex-shrink-0" />
          {order.createdAt
            ? `Created at ${new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
            : "Loading..."}
        </p>
      </div>

      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-muted-foreground">
            {order.customer?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "CU"}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{order.customer?.name || "Customer"}</p>
          <p className="text-xs text-muted-foreground">{order.customerPhoneNumber || "No phone"}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">₵{subtotal.toFixed(2)}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="text-foreground">₵{order.deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (0%)</span>
          <span className="text-foreground">₵0.00</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border items-center">
          <span className="font-semibold text-foreground">Total Due</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">₵{totalDue.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => setMobileView("payment")}
        disabled={isProcessing}
        className="mt-5 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 lg:hidden disabled:opacity-50"
      >
        Select Payment Method <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const PaymentPanel = () => (
    <div className="flex flex-col h-full p-4 sm:p-6">
      <button
        onClick={() => setMobileView("summary")}
        disabled={isProcessing}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-4 lg:hidden w-fit disabled:opacity-40"
      >
        <ArrowLeft className="w-4 h-4" /> Order Summary
      </button>

      <div className="lg:hidden mb-4 px-4 py-3 bg-muted/30 rounded-xl flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Order #{order.orderNumber}</span>
        <span className="text-lg font-bold text-primary">₵{totalDue.toFixed(2)}</span>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Select Payment Method</h2>
      <p className="text-muted-foreground text-sm mb-5">Choose how the customer would like to pay.</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Mobile Money */}
        <button
          onClick={() => !isProcessing && setPaymentMethod("mobile_money")}
          disabled={isProcessing}
          className={`p-3 sm:p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative disabled:opacity-50 disabled:cursor-not-allowed ${
            effectivePaymentMethod === "mobile_money"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
            effectivePaymentMethod === "mobile_money" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className={`font-medium text-xs sm:text-sm text-center leading-tight ${
            effectivePaymentMethod === "mobile_money" ? "text-primary" : "text-foreground"
          }`}>Mobile Money</span>
          {effectivePaymentMethod === "mobile_money" && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">✓</div>
          )}
        </button>

        {/* Card */}
        <button
          onClick={() => !isProcessing && setPaymentMethod("card")}
          disabled={isProcessing}
          className={`p-3 sm:p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative disabled:opacity-50 disabled:cursor-not-allowed ${
            effectivePaymentMethod === "card"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
            effectivePaymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className={`font-medium text-xs sm:text-sm ${
            effectivePaymentMethod === "card" ? "text-primary" : "text-foreground"
          }`}>Card</span>
          {effectivePaymentMethod === "card" && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">✓</div>
          )}
        </button>

        {/* Cash — permanently greyed out */}
        <div
          className="p-3 sm:p-5 rounded-xl border-2 border-border flex flex-col items-center gap-2 opacity-40 cursor-not-allowed select-none"
          title="Cash payments not available"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-muted">
            <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </div>
          <span className="font-medium text-xs sm:text-sm text-muted-foreground">Cash</span>
          <span className="text-[10px] text-muted-foreground">Unavailable</span>
        </div>
      </div>

      {!isProcessing && (
        <div className="mb-5 max-w-lg flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 rounded-xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>
            <strong className="text-foreground">How it works:</strong>{" "}
            Verify your identity first, then the customer completes payment via Paystack.
          </span>
        </div>
      )}

      {isProcessing && stageLabel[stage] && (
        <div className="mb-5 max-w-lg px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
          <span className="text-sm text-primary font-medium">{stageLabel[stage]}</span>
        </div>
      )}

      {!isProcessing && (
        <div className="mb-5 w-full max-w-lg">
          {effectivePaymentMethod === "mobile_money" && (
            <div className="bg-muted/30 rounded-xl p-4 sm:p-5 text-center">
              <div className="w-11 h-11 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">Mobile Money via Paystack</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                After you verify, a Paystack prompt opens for the customer to pay.
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary">₵{totalDue.toFixed(2)}</p>
            </div>
          )}
          {effectivePaymentMethod === "card" && (
            <div className="bg-muted/30 rounded-xl p-4 sm:p-5 text-center">
              <div className="w-11 h-11 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">Card Payment via Paystack</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                After you verify, a secure Paystack popup opens for the customer to pay.
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary">₵{totalDue.toFixed(2)}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="w-3 h-3" />
                <span>Powered by Paystack</span>
              </div>
            </div>
          )}
        </div>
      )}

      {paystackRef && isProcessing && (
        <p className="text-[10px] text-muted-foreground mb-3 font-mono truncate max-w-lg">
          Ref: {paystackRef}
        </p>
      )}

      <div className="flex gap-3 max-w-lg mt-auto">
        <Button
          onClick={handleCancel}
          variant="outline"
          disabled={isProcessing}
          className="flex-1 h-12 sm:h-14 rounded-xl text-sm sm:text-base disabled:opacity-50"
        >
          Cancel
        </Button>

        <Button
          onClick={handleCompletePayment}
          disabled={isProcessing || effectivePaymentMethod === "cash"}
          className={`flex-1 h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold transition-all ${
            isProcessing || effectivePaymentMethod === "cash"
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
              {stage === "verification" && "Awaiting Verification…"}
              {stage === "paystack"     && "Awaiting Payment…"}
              {stage === "finalizing"   && "Finalizing…"}
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0" />
              Verify & Pay
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <WashStationLayout title="Payment">
      <div className="flex flex-col h-full min-h-0">

        <div className="px-4 sm:px-6 pt-3 pb-1 flex-shrink-0">
          <button
            onClick={handleBackNavigation}
            disabled={isProcessing}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Desktop: side-by-side */}
        <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
          <div className="w-72 xl:w-80 border-r border-border bg-card flex-shrink-0 overflow-y-auto">
            <OrderSummaryPanel />
          </div>
          <div className="flex-1 overflow-y-auto">
            <PaymentPanel />
          </div>
        </div>

        {/* Mobile/tablet: tabs */}
        <div className="flex flex-col flex-1 min-h-0 lg:hidden overflow-hidden">
          <div className="flex border-b border-border bg-card flex-shrink-0">
            {(["summary", "payment"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileView(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mobileView === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "summary" ? "Order Summary" : "Payment"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {mobileView === "summary" ? <OrderSummaryPanel /> : <PaymentPanel />}
          </div>
        </div>
      </div>

      <ActionVerification
        open={showVerification}
        onCancel={handleVerificationCancel}
        onVerified={handleVerificationSuccess}
        actionType={`complete_payment:₵${totalDue.toFixed(2)}`}
        orderId={order._id}
      />
    </WashStationLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}