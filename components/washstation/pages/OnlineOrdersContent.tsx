'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrders, Order } from '@/context/OrderContext';
import { 
  Search,
  Phone,
  Mail,
  AlertTriangle,
  Minus,
  Plus,
  Scale,
  Package,
  ShoppingBag,
  Trash2,
  MessageSquare,
  ArrowRight,
  Clock,
  User,
  Tag,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export function OnlineOrdersContent() {
  const router = useRouter();
  const { orders, updateOrder, getPendingOrders } = useOrders();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'online' | 'walkin'>('online');
  const [showDetails, setShowDetails] = useState(false);
  
  // Weight intake
  const [weight, setWeight] = useState(0);
  const [laundryBags, setLaundryBags] = useState(1);
  const [hangers, setHangers] = useState(0);
  
  // Service details
  const [serviceType, setServiceType] = useState('wash_and_fold');
  const [detergent, setDetergent] = useState('standard');
  const [softener, setSoftener] = useState('none');

  const pendingOrders = getPendingOrders();

  useEffect(() => {
    // Auto-select first pending order
    if (pendingOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(pendingOrders[0]);
    }
  }, [pendingOrders, selectedOrder]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setWeight(0);
    setLaundryBags(1);
    setHangers(0);
    setShowDetails(true);
  };

  const handleReject = () => {
    if (selectedOrder) {
      toast.error('Order rejected');
      setSelectedOrder(null);
      setShowDetails(false);
    }
  };

  const handleContact = () => {
    if (selectedOrder) {
      const phone = selectedOrder.customerPhone?.startsWith('0') 
        ? `233${selectedOrder.customerPhone.slice(1)}` 
        : selectedOrder.customerPhone;
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  const handleConvertToActive = () => {
    if (selectedOrder) {
      updateOrder(selectedOrder.id, {
        status: 'checked_in',
        weight: weight,
        checkedInBy: 'Staff'
      });
      toast.success('Order converted to active');
      router.push('/washstation/orders');
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Calculate totals
  const totalVolume = pendingOrders.reduce((acc, o) => acc + (o.weight || 5), 0);
  const oldestOrder = pendingOrders.length > 0 
    ? getTimeAgo(pendingOrders[pendingOrders.length - 1].createdAt)
    : 'N/A';

  const estimatedTotal = (weight * 1.75) + 5.00;

  const filteredOrders = pendingOrders.filter(order => {
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

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] lg:h-[calc(100vh-140px)] gap-4">
      {/* Left - Queue */}
      <div className="lg:w-72 border border-border lg:border-r bg-card rounded-xl lg:rounded-none overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Intake Queue</h2>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {pendingOrders.length} Pending
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase">ESTIMATED VOLUME</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{totalVolume} lbs</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">OLDEST ORDER</p>
              <p className="text-lg sm:text-xl font-bold text-destructive">● {oldestOrder}</p>
            </div>
          </div>
        </div>

        {/* Order List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filteredOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => handleSelectOrder(order)}
              className={`w-full p-3 sm:p-4 text-left transition-colors ${
                selectedOrder?.id === order.id 
                  ? 'bg-primary/10 border-l-4 border-primary' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground text-sm sm:text-base truncate">{order.customerName}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{getTimeAgo(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary">#{order.code}</span>
                <span>•</span>
                <span className="truncate">{order.items?.[0]?.category?.replace('_', ' & ') || 'Wash & Fold'}</span>
              </div>
            </button>
          ))}
          
          {filteredOrders.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No pending orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Center - Order Details */}
      {selectedOrder ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              {/* Customer Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{selectedOrder.customerName}</h2>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap">
                        NEW CUSTOMER
                      </span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{selectedOrder.customerPhone}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-bold text-foreground">#{selectedOrder.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Weight Intake */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      Weight Intake
                    </h3>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Customer Estimate: <strong>15 lbs</strong>
                    </span>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4">
                    <div className="text-center">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground">
                        {weight.toFixed(2)}
                      </span>
                      <span className="text-lg sm:text-xl text-muted-foreground ml-2">lbs</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setWeight(prev => prev + 0.5)}
                      className="w-full sm:w-auto"
                    >
                      +0.5 lbs Bag Weight
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setWeight(0)}
                      className="w-full sm:w-auto"
                    >
                      Reset Scale
                    </Button>
                  </div>
                </div>

                {/* Customer Instructions */}
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-warning" />
                    CUSTOMER INSTRUCTIONS
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    {selectedOrder.notes || 'No special instructions'}
                  </p>
                </div>
              </div>

              {/* Items Verification */}
              <div className="mt-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5" />
                  Items Verification
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">Laundry Bags</p>
                        <p className="text-xs text-muted-foreground truncate">Standard WashLab Bag</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={() => setLaundryBags(Math.max(0, laundryBags - 1))}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">{laundryBags}</span>
                      <button
                        onClick={() => setLaundryBags(laundryBags + 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">Hangers</p>
                        <p className="text-xs text-muted-foreground truncate">Customer Provided</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={() => setHangers(Math.max(0, hangers - 1))}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">{hangers}</span>
                      <button
                        onClick={() => setHangers(hangers + 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details - Mobile */}
              <div className="lg:hidden mt-6 border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Service Details</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
                
                {showDetails && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase mb-2 block">SERVICE TYPE</label>
                      <select 
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground text-sm"
                      >
                        <option value="wash_and_fold">Wash & Fold (Standard)</option>
                        <option value="wash_only">Wash Only</option>
                        <option value="dry_only">Dry Only</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase mb-2 block">DETERGENT</label>
                        <select 
                          value={detergent}
                          onChange={(e) => setDetergent(e.target.value)}
                          className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground text-sm"
                        >
                          <option value="standard">Tide (Standard)</option>
                          <option value="sensitive">Sensitive</option>
                          <option value="eco">Eco-Friendly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase mb-2 block">SOFTENER</label>
                        <select 
                          value={softener}
                          onChange={(e) => setSoftener(e.target.value)}
                          className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground text-sm"
                        >
                          <option value="none">None</option>
                          <option value="standard">Standard</option>
                          <option value="fresh">Fresh Scent</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Base Price ($1.75/lb)</span>
                        <span className="text-foreground">${(weight * 1.75).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Express Fee</span>
                        <span className="text-foreground">$5.00</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-medium text-foreground">Estimated Total</span>
                        <span className="text-xl font-bold text-success">${estimatedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-card border-t border-border p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
              <Button variant="outline" className="text-destructive border-destructive/30 flex-1 sm:flex-initial" onClick={handleReject}>
                <Trash2 className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-initial" onClick={handleContact}>
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
            <Button 
              onClick={handleConvertToActive}
              className="bg-primary text-primary-foreground order-1 sm:order-2 w-full sm:w-auto"
              disabled={weight === 0}
            >
              Convert to Active <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border border-border rounded-xl bg-card">
          <div className="text-center text-muted-foreground p-6">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
            <p className="text-base sm:text-lg">Select an order from the queue</p>
            <p className="text-sm">to start intake process</p>
          </div>
        </div>
      )}

      {/* Right - Service Details (Desktop) */}
      {selectedOrder && (
        <div className="hidden lg:block w-72 border border-border lg:border-l bg-card rounded-xl lg:rounded-none p-4 overflow-y-auto">
          <h3 className="font-semibold text-foreground mb-4">Service Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-2 block">SERVICE TYPE</label>
              <select 
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground"
              >
                <option value="wash_and_fold">Wash & Fold (Standard)</option>
                <option value="wash_only">Wash Only</option>
                <option value="dry_only">Dry Only</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-2 block">DETERGENT</label>
                <select 
                  value={detergent}
                  onChange={(e) => setDetergent(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground text-sm"
                >
                  <option value="standard">Tide (Standard)</option>
                  <option value="sensitive">Sensitive</option>
                  <option value="eco">Eco-Friendly</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-2 block">SOFTENER</label>
                <select 
                  value={softener}
                  onChange={(e) => setSoftener(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground text-sm"
                >
                  <option value="none">None</option>
                  <option value="standard">Standard</option>
                  <option value="fresh">Fresh Scent</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Base Price ($1.75/lb)</span>
                <span className="text-foreground">${(weight * 1.75).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Express Fee</span>
                <span className="text-foreground">$5.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium text-foreground">Estimated Total</span>
                <span className="text-xl font-bold text-success">${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
