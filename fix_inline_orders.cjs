const fs = require('fs');

// Step 1: Create OrderRowExpander component
const component = [
  '"use client"',
  'import { useState, useEffect, useCallback } from "react"',
  'import { useStationOrderStatus, type OrderStatus } from "@/hooks/useStationOrderStatus"',
  'import { Id } from "@jordan6699/washlab-backend/dataModel"',
  'import { Button } from "@/components/ui/button"',
  'import { toast } from "sonner"',
  'import { ChevronDown, ChevronUp, Play, ArrowRight, CheckCircle, MessageCircle, Timer, Loader2 } from "lucide-react"',
  '',
  'interface OrderExpanderProps {',
  '  order: {',
  '    _id: Id<"orders">',
  '    orderNumber: string',
  '    status: OrderStatus',
  '    finalPrice: number',
  '    customer?: { name: string; phoneNumber: string; email?: string } | null',
  '    createdAt: number',
  '  }',
  '  stationToken: string | null',
  '}',
  '',
  'const STAGES = [',
  '  { status: "checked_in", label: "Checked In", durationMins: 5,  next: "sorting",   color: "bg-blue-500" },',
  '  { status: "sorting",    label: "Sorting",    durationMins: 5,  next: "washing",   color: "bg-yellow-500" },',
  '  { status: "washing",    label: "Washing",    durationMins: 35, next: "drying",    color: "bg-cyan-500" },',
  '  { status: "drying",     label: "Drying",     durationMins: 40, next: "folding",   color: "bg-orange-500" },',
  '  { status: "folding",    label: "Folding",    durationMins: 5,  next: "ready",     color: "bg-purple-500" },',
  '  { status: "ready",      label: "Ready",      durationMins: 0,  next: "completed", color: "bg-green-500" },',
  '  { status: "completed",  label: "Completed",  durationMins: 0,  next: null,        color: "bg-green-700" },',
  '] as const',
  '',
  'function getStageIndex(status: string) {',
  '  const idx = STAGES.findIndex(s => s.status === status)',
  '  return idx === -1 ? 0 : idx',
  '}',
  '',
  'function formatTime(seconds: number) {',
  '  const m = Math.floor(Math.abs(seconds) / 60)',
  '  const s = Math.abs(seconds) % 60',
  '  const sign = seconds < 0 ? "-" : ""',
  '  return sign + m + ":" + s.toString().padStart(2, "0")',
  '}',
  '',
  'export function OrderRowExpander({ order, stationToken }: OrderExpanderProps) {',
  '  const [expanded, setExpanded] = useState(false)',
  '  const [isMoving, setIsMoving] = useState(false)',
  '  const [stageStartedAt, setStageStartedAt] = useState<number>(order.createdAt)',
  '  const [elapsed, setElapsed] = useState(0)',
  '  const { changeStatus } = useStationOrderStatus(stationToken)',
  '',
  '  const currentIdx = getStageIndex(order.status)',
  '  const currentStage = STAGES[currentIdx]',
  '  const nextStage = currentStage?.next ? STAGES.find(s => s.status === currentStage.next) : null',
  '',
  '  useEffect(() => {',
  '    setStageStartedAt(Date.now())',
  '    const interval = setInterval(() => {',
  '      setElapsed(Math.floor((Date.now() - stageStartedAt) / 1000))',
  '    }, 1000)',
  '    return () => clearInterval(interval)',
  '  }, [order.status])',
  '',
  '  const expectedSecs = (currentStage?.durationMins ?? 0) * 60',
  '  const remaining = expectedSecs > 0 ? expectedSecs - elapsed : 0',
  '  const isOverdue = remaining < 0 && expectedSecs > 0',
  '',
  '  const moveToStatus = useCallback(async (status: OrderStatus) => {',
  '    setIsMoving(true)',
  '    try {',
  '      await changeStatus(order._id, status)',
  '      setStageStartedAt(Date.now())',
  '      setElapsed(0)',
  '      toast.success("Order " + order.orderNumber + " moved to " + status.replace(/_/g, " "))',
  '    } catch (e) {',
  '      toast.error("Failed to update status")',
  '    } finally {',
  '      setIsMoving(false)',
  '    }',
  '  }, [order._id, order.orderNumber, changeStatus])',
  '',
  '  const handleWhatsApp = () => {',
  '    const phone = order.customer?.phoneNumber?.replace(/\\D/g, "")',
  '    if (!phone) { toast.error("No phone number for this customer"); return }',
  '    const name = order.customer?.name ?? "Customer"',
  '    const msg = "\\u{1F9FA} WashLab Update\\n\\nHi " + name + ",\\nYour laundry order *#" + order.orderNumber + "* is ready for pickup.\\n\\nTotal: \\u20B5" + order.finalPrice.toFixed(2) + "\\nPlease come along with your bag card.\\n\\nThank you!"',
  '    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank")',
  '    toast.success("WhatsApp sent!")',
  '  }',
  '',
  '  const isTerminal = order.status === "completed" || order.status === "cancelled" || order.status === "delivered"',
  '',
  '  return (',
  '    <>',
  '      <button',
  '        onClick={(e) => { e.stopPropagation(); setExpanded(v => !v) }}',
  '        className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"',
  '      >',
  '        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}',
  '        {order.status === "pending_dropoff" || order.status === "checked_in" ? (',
  '          <><Play className="w-3 h-3" />&nbsp;Start</>',
  '        ) : isTerminal ? (',
  '          <><CheckCircle className="w-3 h-3" />&nbsp;View</>',
  '        ) : (',
  '          <>{order.status.replace(/_/g, " ")}</>',
  '        )}',
  '      </button>',
  '',
  '      {expanded && (',
  '        <div className="mt-2 p-3 rounded-xl border border-border bg-muted/40 text-sm space-y-3" onClick={e => e.stopPropagation()}>',
  '          <div className="flex items-center gap-1 flex-wrap">',
  '            {STAGES.filter(s => s.status !== "completed").map((stage, i) => {',
  '              const done = i < currentIdx',
  '              const active = i === currentIdx',
  '              return (',
  '                <div key={stage.status} className="flex items-center gap-1">',
  '                  <div className={"px-2 py-0.5 rounded text-xs font-medium " + (active ? stage.color + " text-white" : done ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground")}>',
  '                    {stage.label}',
  '                  </div>',
  '                  {i < STAGES.length - 2 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}',
  '                </div>',
  '              )',
  '            })}',
  '          </div>',
  '',
  '          {!isTerminal && currentStage && expectedSecs > 0 && (',
  '            <div className={"flex items-center gap-2 px-3 py-1.5 rounded-lg " + (isOverdue ? "bg-red-500/10 border border-red-200" : "bg-card border border-border")}>',
  '              <Timer className={"w-4 h-4 " + (isOverdue ? "text-red-500" : "text-muted-foreground")} />',
  '              <span className="text-xs text-muted-foreground">{currentStage.label}:</span>',
  '              <span className={"text-sm font-mono font-bold " + (isOverdue ? "text-red-500" : "text-foreground")}>',
  '                {isOverdue ? "Overdue " + formatTime(remaining) : formatTime(remaining)}',
  '              </span>',
  '              <span className="text-xs text-muted-foreground ml-auto">/ {currentStage.durationMins}m expected</span>',
  '            </div>',
  '          )}',
  '',
  '          <div className="flex items-center gap-2 flex-wrap">',
  '            {!isTerminal && nextStage && (',
  '              <Button size="sm" onClick={() => moveToStatus(nextStage.status as OrderStatus)} disabled={isMoving} className="h-8 text-xs">',
  '                {isMoving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ArrowRight className="w-3 h-3 mr-1" />}',
  '                Move to {nextStage.label}',
  '              </Button>',
  '            )}',
  '            {(order.status === "ready" || order.status === "ready_for_pickup") && (',
  '              <Button size="sm" variant="outline" onClick={handleWhatsApp} className="h-8 text-xs border-green-500 text-green-600 hover:bg-green-500/10">',
  '                <MessageCircle className="w-3 h-3 mr-1" />',
  '                WhatsApp Receipt',
  '              </Button>',
  '            )}',
  '          </div>',
  '        </div>',
  '      )}',
  '    </>',
  '  )',
  '}',
].join('\n');

fs.writeFileSync('components/washstation/OrderRowExpander.tsx', component, 'utf8');
console.log('Step 1 done: OrderRowExpander created');

// Step 2: Patch OrdersTable
let table = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

if (!table.includes('OrderRowExpander')) {
  table = table.replace(
    "import { useMemo } from 'react';",
    "import { useMemo } from 'react';\nimport { OrderRowExpander } from './OrderRowExpander';"
  );
}

table = table.replace(
  'interface Order {',
  'interface OrdersTableProps {\n  orders: Order[];\n  stationToken?: string | null;\n  onOrderClick?: (orderId: string) => void;\n}\n\ninterface Order {'
);

table = table.replace(
  'export function OrdersTable({ orders, onOrderClick }',
  'export function OrdersTable({ orders, stationToken, onOrderClick }'
);

table = table.replace(
  ': { orders: Order[]; onOrderClick?: (orderId: string) => void })',
  ': OrdersTableProps)'
);

table = table.replace(
  '<TableCell>\n              <Button\n                variant="ghost"\n                size="sm"\n                onClick={() => onOrderClick?.(order._id)}\n                className="text-primary hover:text-primary/80"\n              >\n                <Eye className="w-4 h-4 mr-1" />\n                View\n              </Button>\n            </TableCell>',
  '<TableCell onClick={e => e.stopPropagation()}>\n              <OrderRowExpander order={order} stationToken={stationToken ?? null} />\n            </TableCell>'
);

fs.writeFileSync('components/washstation/OrdersTable.tsx', table, 'utf8');
console.log('Step 2 done: OrdersTable patched');

// Step 3: Patch orders page
let page = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8');
page = page.replace(
  '<OrdersTable orders={filteredOrders}',
  '<OrdersTable orders={filteredOrders} stationToken={stationToken}'
);
fs.writeFileSync('app/washstation/orders/page.tsx', page, 'utf8');
console.log('Step 3 done: stationToken passed to OrdersTable');

console.log('All done!');
