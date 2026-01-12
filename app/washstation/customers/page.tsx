'use client';

import { useState } from 'react';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationCustomers } from '@/hooks/useStationCustomers';
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';
import { EmptyState } from '@/components/washstation/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, Mail, Package, DollarSign, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomersPage() {
  const { stationToken, isSessionValid } = useStationSession();
  const { customers, searchQuery, setSearchQuery, isLoading } = useStationCustomers(stationToken);

  if (!isSessionValid) {
    return (
      <WashStationLayout title="Customers">
        <LoadingSpinner text="Verifying session..." />
      </WashStationLayout>
    );
  }

  return (
    <WashStationLayout title="Customers">
      <div className="space-y-6">
        {/* Search Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Customer Search</CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-96"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Results */}
        {isLoading && searchQuery.length >= 2 ? (
          <LoadingSpinner text="Searching customers..." />
        ) : customers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <Card key={customer._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    {customer.status && (
                      <Badge
                        variant={
                          customer.status === 'active' ? 'default' : 'destructive'
                        }
                      >
                        {customer.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-semibold">{customer.orderCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-semibold">
                        ₵{customer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() =>
                      (window.location.href = `/washstation/new-order?customerId=${customer._id}`)
                    }
                  >
                    Create Order
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchQuery.length >= 2 ? (
          <EmptyState
            icon={Search}
            title="No customers found"
            description="Try searching with a different name or phone number."
          />
        ) : (
          <EmptyState
            icon={User}
            title="Search for customers"
            description="Enter a customer name or phone number to search."
          />
        )}
      </div>
    </WashStationLayout>
  );
}
