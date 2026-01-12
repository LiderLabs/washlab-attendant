'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Banknote,
  CreditCard,
  Smartphone,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  orderId: string;
  orderCode: string;
  amount: number;
  paymentMethod: string;
  staffId: string;
  staffName: string;
  verifiedAt: string;
  customerPhone: string;
  customerName: string;
  createdAt: string;
}

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'cash' | 'card' | 'mobile_money'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Load transactions from localStorage
    try {
      const storedTxns = localStorage.getItem('washlab_transactions');
      if (storedTxns) {
        setTransactions(JSON.parse(storedTxns));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, []);

  const getPaymentIcon = (method: string) => {
    switch(method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'mobile_money': return <Smartphone className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch(method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      case 'mobile_money': return 'Mobile Money';
      case 'momo': return 'Mobile Money';
      case 'hubtel': return 'Card';
      default: return method;
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter !== 'all') {
      if (filter === 'cash' && txn.paymentMethod !== 'cash') return false;
      if (filter === 'card' && !['card', 'hubtel'].includes(txn.paymentMethod)) return false;
      if (filter === 'mobile_money' && !['mobile_money', 'momo'].includes(txn.paymentMethod)) return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        txn.orderCode?.toLowerCase().includes(query) ||
        txn.customerName?.toLowerCase().includes(query) ||
        txn.customerPhone?.includes(query)
      );
    }
    return true;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const cashRevenue = filteredTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0);
  const cardRevenue = filteredTransactions.filter(t => ['card', 'hubtel'].includes(t.paymentMethod)).reduce((sum, t) => sum + t.amount, 0);
  const mobileRevenue = filteredTransactions.filter(t => ['mobile_money', 'momo'].includes(t.paymentMethod)).reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground">₵{totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Cash</p>
          <p className="text-2xl font-bold text-success">₵{cashRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Card</p>
          <p className="text-2xl font-bold text-primary">₵{cardRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Mobile Money</p>
          <p className="text-2xl font-bold text-warning">₵{mobileRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by order code, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-xl p-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'cash', label: 'Cash' },
            { id: 'card', label: 'Card' },
            { id: 'mobile_money', label: 'Mobile Money' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.id 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Order</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Payment</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Staff</th>
                <th className="text-left px-4 md:px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => (
                  <tr key={txn.orderId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-medium text-foreground">{txn.orderCode}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{txn.customerName}</p>
                        <p className="text-sm text-muted-foreground">{txn.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(txn.paymentMethod)}
                        <span className="text-sm text-foreground">{getPaymentLabel(txn.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-semibold text-foreground">₵{txn.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">{txn.staffName}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(txn.verifiedAt || txn.createdAt), 'MMM d, h:mm a')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
