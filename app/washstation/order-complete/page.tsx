'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '@/components/washstation/WashStationSidebar';
import { useOrders } from '@/context/OrderContext';
import { 
  CheckCircle,
  Plus,
  Printer,
  Mail,
  Clock,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

function OrderCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders } = useOrders();
  
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [countdown, setCountdown] = useState(30);

  // Get order from search params
  const orderId = searchParams?.get('orderId');
  const paymentMethod = searchParams?.get('paymentMethod') || 'card';
  const amountPaid = parseFloat(searchParams?.get('amountPaid') || '42.50');
  const order = orderId ? orders.find(o => o.id === orderId) : orders[0];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const staffData = sessionStorage.getItem('washlab_active_staff');
    const branchData = sessionStorage.getItem('washlab_branch');
    
    if (staffData) {
      try {
        const parsed = JSON.parse(staffData);
        const staff = Array.isArray(parsed) ? parsed[0] : parsed;
        setActiveStaff({ name: staff.name || 'Staff', role: staff.role || 'Attendant' });
      } catch (error) {
        console.error('Error parsing staff data:', error);
      }
    }
    
    if (branchData) {
      try {
        const branch = JSON.parse(branchData);
        setBranchName(branch.name || 'Central Branch');
      } catch (error) {
        console.error('Error parsing branch data:', error);
      }
    }
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/washstation/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleStartNewOrder = () => {
    router.push('/washstation/new-order');
  };

  const handlePrintReceipt = () => {
    toast.success('Receipt sent to printer');
  };

  const handleEmailReceipt = () => {
    toast.success('Receipt sent via email');
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      card: 'Credit Card',
      mobile_money: 'Mobile Money',
      momo: 'Mobile Money'
    };
    return labels[method] || 'Card';
  };

  // Mock order items
  const orderItems = [
    { name: 'Wash & Fold (12lbs)', notes: 'Colors, Cold Wash', price: 18.00 },
    { name: 'Comforter (Queen)', notes: 'Synthetic', price: 22.00 },
    { name: 'Detergent Pods', notes: 'Tide Original', quantity: 2, price: 2.50 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
      />
      
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

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order #{order?.code || '8042'} Confirmed
          </h1>
          <p className="text-muted-foreground mb-8">
            Payment of <span className="font-semibold">₵{amountPaid.toFixed(2)}</span> received via {getPaymentMethodLabel(paymentMethod)}.
          </p>

          {/* Order Summary Card */}
          <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden mb-8">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">ORDER SUMMARY</h3>
              <span className="text-sm text-muted-foreground">#{order?.code || '8042'} 🖨</span>
            </div>
            
            <div className="p-5 space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {item.quantity || 1}
                      </span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">{item.notes}</p>
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

          {/* Estimated Completion */}
          <div className="flex items-center gap-2 text-sm text-primary mb-8">
            <Clock className="w-4 h-4" />
            Estimated Completion: Today by 5:00 PM
          </div>

          {/* Actions */}
          <Button
            onClick={handleStartNewOrder}
            className="w-full max-w-md h-14 bg-primary text-primary-foreground rounded-xl text-lg font-semibold mb-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Order
            <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">ENTER</span>
          </Button>

          <div className="flex gap-4 w-full max-w-md">
            <Button
              onClick={handlePrintReceipt}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
              <span className="ml-2 text-xs text-muted-foreground">P</span>
            </Button>
            <Button
              onClick={handleEmailReceipt}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Receipt
            </Button>
          </div>

          {/* Auto-redirect notice */}
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
              <ArrowRight className="w-3 h-3" />
            </div>
            Auto-redirecting to dashboard
            <span className="ml-2 px-3 py-1 bg-muted rounded-lg font-medium text-foreground">
              {countdown}s
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  );
}
