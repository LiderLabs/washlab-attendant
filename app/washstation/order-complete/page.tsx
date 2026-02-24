'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '@/components/washstation/WashStationSidebar';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationOrder } from '@/hooks/useStationOrders';
import { Id } from '@jordan6699/washlab-backend/dataModel';
import {
  CheckCircle,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

function formatServiceType(code: string | undefined): string {
  if (!code) return 'Laundry';
  return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function OrderCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stationToken, isSessionValid } = useStationSession();

  const orderIdParam = searchParams?.get('orderId');
  const paymentMethod = searchParams?.get('paymentMethod') || 'cash';
  const amountPaidParam = parseFloat(searchParams?.get('amountPaid') || '0');
  const changeDue = parseFloat(searchParams?.get('changeDue') || '0');

  const { order, isLoading } = useStationOrder(
    stationToken,
    orderIdParam ? (orderIdParam as Id<'orders'>) : null
  );

  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const waLinkRef = useRef<string | null>(null); // store WhatsApp link for reuse

  const amountPaid = amountPaidParam > 0 ? amountPaidParam : (order?.finalPrice ?? 0);
  const orderNumber = order?.orderNumber || orderIdParam || '—';
  const isMobileMoneyPending = paymentMethod === 'mobile_money';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const staffData = sessionStorage.getItem('washlab_active_staff');
    if (staffData) {
      try {
        const parsed = JSON.parse(staffData);
        const staff = Array.isArray(parsed) ? parsed[0] : parsed;
        setActiveStaff({ name: staff.name || 'Staff', role: staff.role || 'Attendant' });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleStartNewOrder = () => {
    router.push('/washstation/new-order');
  };

  const handleWhatsAppReceipt = () => {
    const customerPhone = order?.customer?.phoneNumber || '';
    if (!customerPhone) {
      toast.error('Customer not on WhatsApp');
      return;
    }

    // Reuse existing link if already generated
    if (waLinkRef.current) {
      window.location.href = waLinkRef.current;
      return;
    }

    let digits = customerPhone.replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('2330')) digits = '233' + digits.slice(4);
    if (digits.startsWith('0')) digits = '233' + digits.slice(1);
    if (digits.length === 9) digits = '233' + digits;

    if (digits.length !== 12) {
      toast.error('Customer not on WhatsApp');
      return;
    }

    const message = encodeURIComponent(
      `*WashLab Receipt*\n\n` +
        `📋 Order: ${orderNumber}\n` +
        (order?.bagCardNumber ? `👜 Bag #: ${order.bagCardNumber}\n` : '') +
        `👤 Customer: ${order?.customer?.name || 'N/A'}\n` +
        `📱 Phone: ${customerPhone}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 Amount: GH₵${amountPaid.toFixed(2)}\n` +
        `💳 Payment: ${paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Cash'}\n` +
        `Processed by: ${activeStaff?.name || 'Staff'}\n\n` +
        `Thank you for choosing WashLab! 🧺`
    );

    waLinkRef.current = `https://wa.me/${digits}?text=${message}`;
    window.location.href = waLinkRef.current;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      card: 'Credit Card',
      mobile_money: 'Mobile Money',
      momo: 'Mobile Money',
    };
    return labels[method] || 'Card';
  };

  const orderSummaryLines: { name: string; notes?: string; quantity: number; price: number }[] = [];
  if (order) {
    const serviceLabel = formatServiceType(order.serviceType);
    const weight = order.estimatedWeight ?? order.actualWeight ?? 0;
    const serviceName = weight > 0 ? `${serviceLabel} (${weight.toFixed(1)} kg)` : serviceLabel;
    orderSummaryLines.push({
      name: serviceName,
      notes: order.notes || undefined,
      quantity: 1,
      price: order.basePrice ?? order.finalPrice ?? 0,
    });
    if (order.deliveryFee && order.deliveryFee > 0) {
      orderSummaryLines.push({
        name: 'Delivery',
        quantity: 1,
        price: order.deliveryFee,
      });
    }
  }
  if (orderSummaryLines.length === 0) {
    orderSummaryLines.push({
      name: 'Order',
      quantity: 1,
      price: amountPaid,
    });
  }

  if (!isSessionValid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Session invalid. Please sign in again.</p>
      </div>
    );
  }

  if (orderIdParam && isLoading && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar collapsed={false} onToggle={() => {}} />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <span className="font-medium text-foreground">Order Completion</span>
        </header>

        <div className="flex flex-col items-center justify-center py-12 px-6">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order #{orderNumber} Confirmed
          </h1>
          <p className="text-muted-foreground mb-2">
            {isMobileMoneyPending ? (
              <>
                Payment prompt sent for <span className="font-semibold">₵{amountPaid.toFixed(2)}</span> via{' '}
                {getPaymentMethodLabel(paymentMethod)}. Order will be marked Paid when the customer completes payment.
              </>
            ) : (
              <>
                Payment of <span className="font-semibold">₵{amountPaid.toFixed(2)}</span> received via{' '}
                {getPaymentMethodLabel(paymentMethod)}.
                {changeDue > 0 && <span className="block mt-1 text-sm">Change due: ₵{changeDue.toFixed(2)}</span>}
              </>
            )}
          </p>

          {/* Order Summary Card */}
          <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden mb-8">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">ORDER SUMMARY</h3>
              <span className="text-sm text-muted-foreground">#{orderNumber} 🖨</span>
            </div>
            <div className="p-5 space-y-4">
              {orderSummaryLines.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {item.quantity}
                      </span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    {item.notes && <p className="text-sm text-muted-foreground ml-8">{item.notes}</p>}
                  </div>
                  <span className="font-semibold text-foreground">₵{item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-border flex justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="text-xl font-bold text-foreground">₵{amountPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Receipt Button */}
          <Button
            onClick={handleWhatsAppReceipt}
            className="w-full max-w-md h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl text-lg font-semibold mb-4"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Receipt via WhatsApp
          </Button>

          {/* Start New Order */}
          <Button
            onClick={handleStartNewOrder}
            className="w-full max-w-md h-14 bg-primary text-primary-foreground rounded-xl text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Order
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderCompleteContent />
    </Suspense>
  );
}