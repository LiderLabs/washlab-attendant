'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  RefreshCw, 
  AlertTriangle,
  Package,
  CheckCircle,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useStationSession } from '@/hooks/useStationSession';
import {
  useStationInventory,
  useUpdateInventoryStock,
  usePlaceInventoryOrder,
  useCreateInventoryItem,
  type InventoryItem,
  type InventoryCategory,
} from '@/hooks/useStationInventory';
import { format } from 'date-fns';
import { ActionVerification } from '@/components/washstation/ActionVerification';
import { Id } from '@devlider001/washlab-backend/dataModel';

export function InventoryContent() {
  const { stationToken } = useStationSession();
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingItemData, setPendingItemData] = useState<{
    name: string;
    category: InventoryCategory;
    unit: string;
    description: string;
    currentStock: number;
    maxStock: number;
    minStock: number;
    reorderPoint: number;
  } | null>(null);
  const [updateStockValue, setUpdateStockValue] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [expectedArrivalDate, setExpectedArrivalDate] = useState('');
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'cleaning_supplies' as InventoryCategory,
    unit: '',
    description: '',
    currentStock: 0,
    maxStock: 0,
    minStock: 0,
    reorderPoint: 0,
  });

  const { inventory, isLoading, stats } = useStationInventory(
    stationToken,
    filter === 'all' ? undefined : { status: filter }
  );
  const { updateStock } = useUpdateInventoryStock();
  const { placeOrder } = usePlaceInventoryOrder();
  const { createItem } = useCreateInventoryItem();

  const handleRefresh = () => {
    toast.success('Inventory refreshed');
  };

  const handleUpdateClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setUpdateStockValue(item.currentStock.toString());
    setUpdateDialogOpen(true);
  };

  const handleOrderClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setOrderQuantity('');
    setExpectedArrivalDate('');
    setOrderDialogOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem) return;

    const stockValue = parseFloat(updateStockValue);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error('Please enter a valid stock amount');
      return;
    }

    const success = await updateStock(selectedItem._id, stockValue);
    if (success.success) {
      setUpdateDialogOpen(false);
      setSelectedItem(null);
      setUpdateStockValue('');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedItem) return;

    const quantity = parseFloat(orderQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid order quantity');
      return;
    }

    let arrivalTimestamp: number | undefined;
    if (expectedArrivalDate) {
      const date = new Date(expectedArrivalDate);
      if (isNaN(date.getTime())) {
        toast.error('Please enter a valid date');
        return;
      }
      arrivalTimestamp = date.getTime();
    }

    const success = await placeOrder(selectedItem._id, quantity, arrivalTimestamp);
    if (success.success) {
      setOrderDialogOpen(false);
      setSelectedItem(null);
      setOrderQuantity('');
      setExpectedArrivalDate('');
    }
  };

  const handleAddItem = () => {
    setItemForm({
      name: '',
      category: 'cleaning_supplies',
      unit: '',
      description: '',
      currentStock: 0,
      maxStock: 0,
      minStock: 0,
      reorderPoint: 0,
    });
    setAddItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemForm.name.trim()) {
      toast.error('Please enter item name');
      return;
    }
    if (!itemForm.unit.trim()) {
      toast.error('Please enter unit');
      return;
    }
    if (itemForm.maxStock <= 0) {
      toast.error('Max stock must be greater than 0');
      return;
    }
    if (itemForm.minStock < 0) {
      toast.error('Min stock cannot be negative');
      return;
    }
    if (itemForm.reorderPoint < 0) {
      toast.error('Reorder point cannot be negative');
      return;
    }
    if (itemForm.minStock >= itemForm.reorderPoint) {
      toast.error('Min stock must be less than reorder point');
      return;
    }
    if (itemForm.reorderPoint >= itemForm.maxStock) {
      toast.error('Reorder point must be less than max stock');
      return;
    }

    // Store form data and show verification modal
    setPendingItemData({ ...itemForm });
    setAddItemDialogOpen(false);
    setShowVerification(true);
  };

  const handleVerificationSuccess = async (
    attendantId: Id<'attendants'>,
    verificationId: Id<'biometricVerifications'>
  ) => {
    if (!pendingItemData) return;

    setShowVerification(false);

    const success = await createItem(
      pendingItemData.name,
      pendingItemData.category,
      pendingItemData.unit,
      pendingItemData.currentStock,
      pendingItemData.maxStock,
      pendingItemData.minStock,
      pendingItemData.reorderPoint,
      pendingItemData.description || undefined,
      verificationId
    );

    if (success.success) {
      setPendingItemData(null);
      setItemForm({
        name: '',
        category: 'cleaning_supplies',
        unit: '',
        description: '',
        currentStock: 0,
        maxStock: 0,
        minStock: 0,
        reorderPoint: 0,
      });
    }
  };

  const categoryLabels: Record<InventoryCategory, string> = {
    cleaning_supplies: 'Cleaning Supplies',
    add_ons: 'Add-ons',
    facility: 'Facility',
    retail: 'Retail',
    operational: 'Operational',
  };

  const filteredInventory = inventory;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
      low: { label: 'Low Stock', className: 'bg-warning/10 text-warning', icon: AlertTriangle },
      ok: { label: 'In Stock', className: 'bg-success/10 text-success', icon: CheckCircle },
      ordered: { label: 'Ordered', className: 'bg-primary/10 text-primary', icon: Package },
    };
    return config[status] || config.ok;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading inventory...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats & Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="px-3 sm:px-4 py-2 bg-destructive/10 text-destructive rounded-lg whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium">{stats.critical} Critical</span>
          </div>
          <div className="px-3 sm:px-4 py-2 bg-warning/10 text-warning rounded-lg whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium">{stats.low} Low</span>
          </div>
          <div className="px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-lg whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium">{stats.ordered} Ordered</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 sm:gap-2 bg-muted rounded-xl p-1 flex-shrink-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'critical', label: 'Critical' },
              { id: 'low', label: 'Low' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === tab.id 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 flex-shrink-0">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" onClick={handleAddItem} className="gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {filteredInventory.map((item) => {
          const status = getStatusBadge(item.status);
          const StatusIcon = status.icon;
          const stockPercentage = (item.currentStock / item.maxStock) * 100;
          
          return (
            <div key={item._id} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-w-0">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 truncate">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.category.replace('_', ' ')}</p>
                </div>
                <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${status.className}`}>
                  <StatusIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span className="hidden sm:inline">{status.label}</span>
                  <span className="sm:hidden">{status.label.split(' ')[0]}</span>
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Stock</span>
                  <span className="font-medium text-foreground text-right break-words">
                    {item.currentStock} / {item.maxStock} <span className="hidden sm:inline">{item.unit}</span>
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      stockPercentage < 20 ? 'bg-destructive' :
                      stockPercentage < 40 ? 'bg-warning' :
                      'bg-success'
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {item.status === 'ordered' && item.expectedArrivalDate && (
                <p className="text-xs text-primary mb-3 truncate">
                  Arriving: {format(new Date(item.expectedArrivalDate), 'MMM d, yyyy')}
                </p>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs sm:text-sm"
                  onClick={() => handleUpdateClick(item)}
                >
                  Update
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs sm:text-sm"
                  onClick={() => handleOrderClick(item)}
                  disabled={item.status === 'ordered'}
                >
                  {item.status === 'ordered' ? 'Ordered' : 'Order'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No items found</p>
        </div>
      )}

      {/* Update Stock Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="stock">Current Stock ({selectedItem?.unit})</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={updateStockValue}
                onChange={(e) => setUpdateStockValue(e.target.value)}
                placeholder="Enter stock amount"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Current: {selectedItem?.currentStock} / Max: {selectedItem?.maxStock}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Place Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="quantity">Order Quantity ({selectedItem?.unit})</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder="Enter quantity to order"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="arrivalDate">Expected Arrival Date (Optional)</Label>
              <Input
                id="arrivalDate"
                type="date"
                value={expectedArrivalDate}
                onChange={(e) => setExpectedArrivalDate(e.target.value)}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Create a new inventory item for this branch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g., Liquid Detergent"
                />
              </div>
              <div>
                <Label htmlFor="itemCategory">Category *</Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(value) =>
                    setItemForm({ ...itemForm, category: value as InventoryCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="itemUnit">Unit *</Label>
                <Input
                  id="itemUnit"
                  value={itemForm.unit}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                  placeholder="e.g., Units, Boxes, Rolls"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="itemDescription">Description</Label>
                <Textarea
                  id="itemDescription"
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="itemCurrentStock">Current Stock</Label>
                <Input
                  id="itemCurrentStock"
                  type="number"
                  min="0"
                  value={itemForm.currentStock}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      currentStock: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="itemMaxStock">Max Stock *</Label>
                <Input
                  id="itemMaxStock"
                  type="number"
                  min="1"
                  value={itemForm.maxStock}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      maxStock: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="itemMinStock">Min Stock (Critical Threshold) *</Label>
                <Input
                  id="itemMinStock"
                  type="number"
                  min="0"
                  value={itemForm.minStock}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      minStock: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="itemReorderPoint">Reorder Point *</Label>
                <Input
                  id="itemReorderPoint"
                  type="number"
                  min="0"
                  value={itemForm.reorderPoint}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      reorderPoint: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Create Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Biometric Verification Modal */}
      <ActionVerification
        open={showVerification}
        onCancel={() => {
          setShowVerification(false);
          setPendingItemData(null);
          setAddItemDialogOpen(true);
        }}
        onVerified={handleVerificationSuccess}
        actionType="create_inventory_item"
      />
    </>
  );
}
