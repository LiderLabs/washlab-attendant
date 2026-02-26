"use client"
import { useState, useEffect, useCallback } from "react"
import { useStationOrderStatus, type OrderStatus } from "@/hooks/useStationOrderStatus"
import { ActionVerification } from "./ActionVerification"
import { Id } from "@jordan6699/washlab-backend/dataModel"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ChevronDown, ChevronUp, Play, ArrowRight, CheckCircle, MessageCircle, Timer, Loader2, CreditCard } from "lucide-react"

interface OrderExpanderProps {
  order: {
    _id: Id<"orders"> | string
    orderNumber: string
    status: OrderStatus
    finalPrice: number
    customer?: { name: string; phoneNumber: string; email?: string } | null
    createdAt: number
  }
  stationToken: string | null
  unpaid?: boolean
  onCollectPayment?: () => void
}

const STAGES = [
  { status: "checked_in", label: "Checked In", durationMins: 5,  next: "sorting",   color: "bg-blue-500" },
  { status: "sorting",    label: "Sorting",    durationMins: 5,  next: "washing",   color: "bg-yellow-500" },
  { status: "washing",    label: "Washing",    durationMins: 35, next: "drying",    color: "bg-cyan-500" },
  { status: "drying",     label: "Drying",     durationMins: 40, next: "folding",   color: "bg-orange-500" },
  { status: "folding",    label: "Folding",    durationMins: 5,  next: "ready",     color: "bg-purple-500" },
  { status: "ready",      label: "Ready",      durationMins: 0,  next: "completed", color: "bg-green-500" },
  { status: "completed",  label: "Completed",  durationMins: 0,  next: null,        color: "bg-green-700" },
] as const

function getStageIndex(status: string) {
  const idx = STAGES.findIndex(s => s.status === status)
  return idx === -1 ? 0 : idx
}

function formatMins(seconds: number) {
  const m = Math.floor(Math.abs(seconds) / 60)
  const s = Math.abs(seconds) % 60
  return m + ":" + s.toString().padStart(2, "0")
}

export function OrderRowExpander({ order, stationToken: tokenProp, unpaid, onCollectPayment }: OrderExpanderProps) {
  const stationToken = tokenProp || (typeof window !== "undefined" ? localStorage.getItem("station_token") : null)
  const [expanded, setExpanded] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const { changeStatus } = useStationOrderStatus(stationToken)

  const currentIdx = getStageIndex(order.status)
  const currentStage = STAGES[currentIdx]
  const nextStage = currentStage?.next ? STAGES.find(s => s.status === currentStage.next) : null
  const isTerminal = order.status === "completed" || order.status === "cancelled" || order.status === "delivered"

  useEffect(() => {
    setElapsed(0)
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [order.status])

  const expectedSecs = (currentStage?.durationMins ?? 0) * 60
  const remaining = expectedSecs > 0 ? expectedSecs - elapsed : 0
  const isOverdue = remaining < 0 && expectedSecs > 0

  const moveToStatus = useCallback(async (status: OrderStatus, attendantId?: Id<"attendants">) => {
    setIsMoving(true)
    try {
      await changeStatus(order._id as Id<"orders">, status, undefined, attendantId)
      toast.success("Moved to " + status.replace(/_/g, " "))
    } catch (e) {
      toast.error("Failed to update status")
    } finally {
      setIsMoving(false)
    }
  }, [order._id, changeStatus])

  const handleMoveNext = () => {
    if (!nextStage) return
    if (nextStage.status === "completed") {
      setPendingStatus("completed")
      setVerifyOpen(true)
    } else {
      moveToStatus(nextStage.status as OrderStatus)
    }
  }

  const handleWhatsApp = () => {
    const phone = order.customer?.phoneNumber?.replace(/\D/g, "")
    if (!phone) { toast.error("No phone number for this customer"); return }
    const name = order.customer?.name ?? "Customer"
    const msg = "🧺 WashLab Update\n\nHi " + name + ",\nYour laundry order *#" + order.orderNumber + "* is ready for pickup.\n\nTotal: ₵" + order.finalPrice.toFixed(2) + "\nPlease come along with your bag card.\n\nThank you!"
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank")
    toast.success("WhatsApp sent!")
  }

  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className="flex items-center gap-1.5 flex-wrap">
        {unpaid && onCollectPayment && (
          <button
            onClick={(e) => { e.stopPropagation(); onCollectPayment() }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
          >
            <CreditCard className="w-3 h-3" />
            Pay
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v) }}
          className={"flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors " + (isTerminal ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {order.status === "pending_dropoff" || order.status === "checked_in"
            ? <><Play className="w-3 h-3" />&nbsp;Start</>
            : isTerminal
            ? <><CheckCircle className="w-3 h-3" />&nbsp;Done</>
            : <span className="capitalize">{currentStage?.label}</span>
          }
        </button>
      </div>

      {expanded && (
        <div className="mt-1 p-3 rounded-xl border border-border bg-card shadow-lg text-sm space-y-3 w-[320px] md:w-[460px] z-10 relative" onClick={e => e.stopPropagation()}>

          {/* Stage progress */}
          <div className="flex flex-wrap gap-1 items-center">
            {STAGES.filter(s => s.status !== "completed").map((stage, i) => {
              const done = i < currentIdx
              const active = i === currentIdx
              const filtered = STAGES.filter(s => s.status !== "completed")
              return (
                <div key={stage.status} className="flex items-center gap-1">
                  <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (active ? stage.color + " text-white" : done ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                    {stage.label}
                  </span>
                  {i < filtered.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />}
                </div>
              )
            })}
          </div>

          {/* Simple timer */}
          {!isTerminal && currentStage && expectedSecs > 0 && (
            <div className={"flex items-center gap-2 px-3 py-2 rounded-xl border " + (isOverdue ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" : "bg-muted/50 border-border")}>
              <Timer className={"w-4 h-4 " + (isOverdue ? "text-red-500" : "text-muted-foreground")} />
              <span className="text-xs text-muted-foreground">{currentStage.label}</span>
              <span className={"text-sm font-mono font-bold ml-auto " + (isOverdue ? "text-red-500" : "text-foreground")}>
                {formatMins(remaining)} <span className="text-xs font-normal text-muted-foreground">/ {currentStage.durationMins}m</span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isTerminal && nextStage && (
              <Button size="sm" onClick={handleMoveNext} disabled={isMoving} className="h-9 text-xs font-semibold px-4">
                {isMoving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <ArrowRight className="w-3 h-3 mr-1.5" />}
                Move to {nextStage.label}
              </Button>
            )}
            {(order.status === "ready" || order.status === "ready_for_pickup") && (
              <Button size="sm" variant="outline" onClick={handleWhatsApp} className="h-9 text-xs font-semibold px-4 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                WhatsApp Receipt
              </Button>
            )}
            {unpaid && onCollectPayment && (
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onCollectPayment() }} className="h-9 text-xs font-semibold px-4 bg-emerald-500 hover:bg-emerald-600 text-white">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                Collect Payment
              </Button>
            )}
          </div>
        </div>
      )}

      {verifyOpen && (
        <ActionVerification
          open={verifyOpen}
          onVerified={(attendantId) => {
            setVerifyOpen(false)
            if (pendingStatus) moveToStatus(pendingStatus, attendantId)
            setPendingStatus(null)
          }}
          onCancel={() => { setVerifyOpen(false); setPendingStatus(null) }}
          actionType="Mark as Delivered"
          orderId={order._id as Id<"orders">}
        />
      )}
    </div>
  )
}
