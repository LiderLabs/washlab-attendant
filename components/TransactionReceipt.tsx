import { Button } from '@/components/ui/button';
import { Check, Printer, MessageSquare, X } from 'lucide-react';
import { Order } from '@/context/OrderContext';

interface TransactionReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  attendantName: string;
}

/**
 * Transaction Receipt Modal
 * 
 * Shown after successful payment
 * - Displays order summary
 * - Print and WhatsApp options
 * - Stores transaction history
 */
const TransactionReceipt = ({ isOpen, onClose, order, attendantName }: TransactionReceiptProps) => {
  if (!isOpen) return null;

  const sendWhatsAppReceipt = () => {
    const message = encodeURIComponent(
      `*WashLab Receipt*\n\n` +
      `📋 Order: ${order.code}\n` +
      `👤 Customer: ${order.customerName}\n` +
      `📱 Phone: ${order.customerPhone}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Amount Paid:* GH₵${order.totalPrice?.toFixed(2)}\n` +
      `💳 Payment: ${order.paymentMethod?.toUpperCase()}\n` +
      `📅 Date: ${new Date().toLocaleDateString()}\n` +
      `⏰ Time: ${new Date().toLocaleTimeString()}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `Processed by: ${attendantName}\n\n` +
      `Thank you for choosing WashLab! 🧺✨\n` +
      `Your laundry will be ready for pickup soon.`
    );
    const phone = order.customerPhone.startsWith('0') 
      ? `233${order.customerPhone.slice(1)}` 
      : order.customerPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          Payment Successful!
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Transaction completed successfully
        </p>

        {/* Receipt Details */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6 print:bg-white print:border print:border-gray-200">
          <div className="text-center mb-4 pb-4 border-b border-border">
            <h3 className="font-bold text-lg text-foreground">WashLab</h3>
            <p className="text-xs text-muted-foreground">Official Receipt</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-semibold text-foreground">{order.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-semibold text-foreground">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="text-foreground">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="text-foreground">{new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="border-t border-dashed border-border my-3" />
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold text-foreground uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-lg pt-2">
              <span className="font-semibold text-foreground">Total Paid</span>
              <span className="font-bold text-primary">GH₵{order.totalPrice?.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-dashed border-border my-3" />
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Processed by</span>
              <span className="text-foreground">{attendantName}</span>
            </div>
          </div>

          <div className="text-center mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Thank you for choosing WashLab!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={printReceipt}
            className="flex-1 rounded-xl gap-2 print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            onClick={sendWhatsAppReceipt}
            className="flex-1 rounded-xl gap-2 bg-green-600 hover:bg-green-700 print:hidden"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full mt-3 rounded-xl print:hidden"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default TransactionReceipt;
