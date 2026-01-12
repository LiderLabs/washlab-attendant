'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  AlertTriangle,
  Package,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  category: 'cleaning_supplies' | 'add_ons' | 'facility' | 'retail' | 'operational';
  currentStock: number;
  maxStock: number;
  unit: string;
  status: 'critical' | 'low' | 'ok' | 'ordered';
  arrivalDate?: string;
}

export function InventoryContent() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');
  const [lastChecked, setLastChecked] = useState(new Date());

  // Mock inventory data
  const [inventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Liquid Detergent', category: 'cleaning_supplies', currentStock: 1, maxStock: 20, unit: 'Units', status: 'critical' },
    { id: '2', name: 'Fabric Softener', category: 'add_ons', currentStock: 0, maxStock: 15, unit: 'Units', status: 'critical' },
    { id: '3', name: 'Paper Towels', category: 'facility', currentStock: 2, maxStock: 50, unit: 'Rolls', status: 'critical' },
    { id: '4', name: 'Dryer Sheets', category: 'retail', currentStock: 12, maxStock: 100, unit: 'Boxes', status: 'low' },
    { id: '5', name: 'Wire Hangers', category: 'operational', currentStock: 50, maxStock: 500, unit: 'Units', status: 'low' },
    { id: '6', name: 'Bleach (Gallon)', category: 'cleaning_supplies', currentStock: 0, maxStock: 10, unit: 'Units', status: 'ordered', arrivalDate: 'Tomorrow' },
  ]);

  const handleRefresh = () => {
    setLastChecked(new Date());
    toast.success('Inventory refreshed');
  };

  const criticalCount = inventory.filter(i => i.status === 'critical').length;
  const lowCount = inventory.filter(i => i.status === 'low').length;
  const orderedCount = inventory.filter(i => i.status === 'ordered').length;

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'critical') return item.status === 'critical';
    if (filter === 'low') return item.status === 'low';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
      low: { label: 'Low Stock', className: 'bg-warning/10 text-warning', icon: AlertTriangle },
      ok: { label: 'In Stock', className: 'bg-success/10 text-success', icon: CheckCircle },
      ordered: { label: 'Ordered', className: 'bg-primary/10 text-primary', icon: Package },
    };
    return config[status] || config.ok;
  };

  return (
    <>
      {/* Stats & Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="px-3 sm:px-4 py-2 bg-destructive/10 text-destructive rounded-lg whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium">{criticalCount} Critical</span>
          </div>
          <div className="px-3 sm:px-4 py-2 bg-warning/10 text-warning rounded-lg whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium">{lowCount} Low</span>
          </div>
          <div className="px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-lg whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium">{orderedCount} Ordered</span>
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
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {filteredInventory.map((item) => {
          const status = getStatusBadge(item.status);
          const StatusIcon = status.icon;
          const stockPercentage = (item.currentStock / item.maxStock) * 100;
          
          return (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-w-0">
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

              {item.status === 'ordered' && item.arrivalDate && (
                <p className="text-xs text-primary mb-3 truncate">Arriving: {item.arrivalDate}</p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                  Update
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                  Order
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
    </>
  );
}
