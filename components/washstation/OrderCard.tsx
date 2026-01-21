"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge, type OrderStatus } from "./OrderStatusBadge"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, User, Phone, Package } from "lucide-react"
import Link from "next/link"
import { Id } from "@devlider001/washlab-backend/dataModel"

interface OrderCardProps {
  order: {
    _id: Id<"orders">
    orderNumber: string
    status: OrderStatus
    finalPrice: number
    createdAt: number
    customer?: {
      name: string
      phoneNumber: string
      email?: string
    } | null
    statusHistory?: Array<{
      status: string
      changedAt: number
      changedBy?: {
        type: "attendant" | "admin"
        name: string
      }
      changedByAdmin?: Id<"admins">
      changedByStation?: string
      attendanceId?: Id<"attendanceLogs">
      notes?: string
    }>
  }
  onClick?: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const timeAgo = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
  })

  // Get the last status change to show who updated it
  const lastStatusChange = order.statusHistory
    ? order.statusHistory[order.statusHistory.length - 1]
    : null

  const assignedByName =
    lastStatusChange?.changedBy?.type === "attendant"
      ? lastStatusChange?.changedBy?.name
      : "Admin"

  return (
    <Card
      className='hover:shadow-md transition-all cursor-pointer'
      onClick={onClick}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='font-semibold text-lg'>#{order.orderNumber}</h3>
            <p className='text-xs text-muted-foreground'>{timeAgo}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {order.customer && (
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm'>
              <User className='w-4 h-4 text-muted-foreground' />
              <span className='font-medium'>{order.customer.name}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Phone className='w-4 h-4' />
              <span>{order.customer.phoneNumber}</span>
            </div>
          </div>
        )}
        {assignedByName && (
          <div className='text-xs text-muted-foreground pt-1'>
            Assigned To:{" "}
            <span className='font-medium text-foreground text-green-500'>
              {assignedByName}
            </span>
          </div>
        )}
        <div className='flex items-center justify-between pt-2 border-t'>
          <div className='flex items-center gap-2'>
            <Package className='w-4 h-4 text-muted-foreground' />
            <span className='font-semibold text-lg'>
              ₵{order.finalPrice.toFixed(2)}
            </span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/washstation/orders/${order._id}`}>
              View
              <ArrowRight className='w-4 h-4 ml-1' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
