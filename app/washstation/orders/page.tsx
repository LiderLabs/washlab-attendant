'use client';

import { useState } from 'react';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { useStationOrders, type OrderStatus } from '@/hooks/useStationOrders';
import { OrdersTable } from "@/components/washstation/OrdersTable"
import { LoadingSpinner } from "@/components/washstation/LoadingSpinner"
import { EmptyState } from "@/components/washstation/EmptyState"
import { OrderStatusBadge } from "@/components/washstation/OrderStatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

const statusOptions: {
  value: OrderStatus | "all" | "processing"
  label: string
}[] = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
]

export default function OrdersPage() {
  const { stationToken, isSessionValid } = useStationSession()
  const [selectedStatus, setSelectedStatus] = useState<
    OrderStatus | "all" | "processing"
  >("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Fetch all orders (walk-in + online orders in processing status)
  const {
    orders: allOrders,
    isLoading,
    loadMore,
    hasMore,
  } = useStationOrders(stationToken, {
    ...(selectedStatus !== "all" && selectedStatus !== "processing"
      ? { status: selectedStatus }
      : {}),
    // Don't filter by orderType - we want both walk-in and online
  })

  // Filter orders by status, order type, and search query
  const filteredOrders = allOrders?.filter((order) => {
    // For online orders, only show if they're in processing status (checked_in or later)
    // Walk-in orders can be shown in any status
    if (order.orderType === "online") {
      const processingStatuses = [
        "checked_in",
        "sorting",
        "washing",
        "drying",
        "folding",
        "ready",
        "completed",
      ]
      // Also handle legacy statuses
      const legacyProcessingStatuses = [
        "in_progress",
        "ready_for_pickup",
        "delivered",
      ]
      const allProcessingStatuses = [
        ...processingStatuses,
        ...legacyProcessingStatuses,
      ]
      if (!allProcessingStatuses.includes(order.status)) {
        return false // Hide online orders that haven't been checked in yet
      }
    }

    // Status filter
    if (selectedStatus === "all") {
      // Show all orders (already filtered by online order processing status above)
    } else if (selectedStatus === "processing") {
      if (
        !["checked_in", "sorting", "washing", "drying", "folding"].includes(
          order.status
        )
      ) {
        return false
      }
    } else {
      // selectedStatus is a specific OrderStatus
      if (order.status !== selectedStatus) {
        return false
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer?.name.toLowerCase().includes(query) ||
        order.customer?.phoneNumber.includes(query)
      )
    }

    return true
  })

  if (!isSessionValid) {
    return (
      <WashStationLayout title='Orders'>
        <LoadingSpinner text='Verifying session...' />
      </WashStationLayout>
    )
  }

  return (
    <WashStationLayout title='Orders'>
      <div className='space-y-6'>
        {/* Header with Search and Filters */}
        <Card>
          <CardHeader>
            <div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
              <CardTitle>All Orders</CardTitle>
              <div className='flex gap-2 w-full md:w-auto'>
                <div className='relative flex-1 md:flex-initial'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by order number, customer...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9 w-full md:w-64'
                  />
                </div>
                <Button variant='outline' size='icon'>
                  <RefreshCw className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Status Filters */}
        <div className='flex gap-2 bg-muted rounded-xl p-1'>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setSelectedStatus(
                  option.value as OrderStatus | "all" | "processing"
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className='mt-6'>
          {isLoading ? (
            <LoadingSpinner text='Loading orders...' />
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <>
              <OrdersTable
                orders={filteredOrders}
                onOrderClick={(orderId) =>
                  router.push(`/washstation/orders/${orderId}`)
                }
                onCollectPayment={(orderId) =>
                  router.push(`/washstation/payment?orderId=${orderId}`)
                }
              />
              {hasMore && (
                <div className='mt-6 text-center'>
                  <Button variant='outline' onClick={() => loadMore(20)}>
                    Load More Orders
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Filter}
              title={`No ${selectedStatus === "all" ? "" : selectedStatus.replace("_", " ")} orders found`}
              description={
                searchQuery
                  ? "Try adjusting your search query"
                  : "Orders will appear here once they are created"
              }
            />
          )}
        </div>
      </div>
    </WashStationLayout>
  )
}
