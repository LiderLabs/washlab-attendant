"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge, type OrderStatus } from "./OrderStatusBadge"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowRight,
  User,
  Phone,
  Package,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { Id } from "@devlider001/washlab-backend/dataModel"
import { useState, useEffect } from "react"
import { toast } from "sonner"

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
  const [whatsappSent, setWhatsappSent] = useState(false)

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
  })

  const lastStatusChange = order.statusHistory
    ? order.statusHistory[order.statusHistory.length - 1]
    : null

  const assignedByName =
    lastStatusChange?.changedBy?.type === "attendant"
      ? lastStatusChange?.changedBy?.name
      : "Admin"

  /**
   * WhatsApp should appear when:
   * - Folding
   * - Ready
   * - Delivered
   */
  const showWhatsApp =
    order.status === "folding" ||
    order.status === "ready" ||
    order.status === "completed"

  // Check if WhatsApp was already sent for this order
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sent = localStorage.getItem(`whatsapp_sent_${order._id}`)
      if (sent === 'true') {
        setWhatsappSent(true)
      }
    }
  }, [order._id])

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!order.customer?.phoneNumber) return

    const phone = order.customer.phoneNumber.replace(/\D/g, "")
    const message = encodeURIComponent(
      `🧺 WashLab Update\n\n` +
        `Hi ${order.customer.name},\n` +
        `Your laundry order *#${order.orderNumber}* is ready for pickup.\n\n` +
        `Total: ₵${order.finalPrice.toFixed(2)}\n` +
        `Please come along with your bag card.\n\nThank you!`
    )

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    
    // Mark as sent and save to localStorage
    setWhatsappSent(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`whatsapp_sent_${order._id}`, 'true')
    }
    
    toast.success('WhatsApp notification sent!')
  }

  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {order.customer && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{order.customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{order.customer.phoneNumber}</span>
            </div>
          </div>
        )}

        {assignedByName && (
          <div className="text-xs text-muted-foreground pt-1">
            Assigned To:{" "}
            <span className="font-medium text-green-500">
              {assignedByName}
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-lg">
                ₵{order.finalPrice.toFixed(2)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/washstation/orders/${order._id}`}>
                View
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* WhatsApp Button */}
          {showWhatsApp && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleWhatsAppClick}
              disabled={whatsappSent}
            >
              <MessageCircle className="w-4 h-4" />
              {whatsappSent ? 'WhatsApp Sent ✓' : 'Send WhatsApp Notification'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}