'use client'

import { useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@jordan6699/washlab-backend/api'
import { useStationSession } from '@/hooks/useStationSession'
import { WashStationLayout } from '@/components/washstation/WashStationLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft, CheckCircle2, Clock, Loader2,
  Download, AlertCircle, Banknote,
} from 'lucide-react'
import Link from 'next/link'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { toast } from 'sonner'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    failed:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    paid:       'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function dayLabel(dateStr: string) {
  const d = parseISO(dateStr)
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEEE, d MMM yyyy')
}

function downloadCSV(rows: (string | number | null | undefined)[][], filename: string) {
  const csv = rows
    .map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Exported')
}

// ─── Orders table — always visible, no toggle ────────────────────────────────

function DayOrdersTable({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) return null

  return (
    <div className='mt-3'>
      <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2'>
        <Banknote className='w-3.5 h-3.5' />
        {orders.length} order{orders.length !== 1 ? 's' : ''}
      </div>

      <div className='rounded-lg border border-border overflow-hidden'>
        <table className='w-full text-xs'>
          <thead>
            <tr className='bg-muted/50 border-b border-border'>
              <th className='text-left px-3 py-2 font-semibold text-muted-foreground'>Order</th>
              <th className='text-left px-3 py-2 font-semibold text-muted-foreground'>Customer</th>
              <th className='text-left px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell'>Service</th>
              <th className='text-right px-3 py-2 font-semibold text-muted-foreground'>Amount</th>
              <th className='text-right px-3 py-2 font-semibold text-muted-foreground'>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order._id} className='border-b border-border last:border-0 hover:bg-muted/20'>
                <td className='px-3 py-2 font-mono font-semibold text-primary'>{order.orderNumber}</td>
                <td className='px-3 py-2'>
                  <p className='font-medium'>{order.customerName || '—'}</p>
                  {order.customerPhoneNumber && (
                    <p className='text-muted-foreground'>{order.customerPhoneNumber}</p>
                  )}
                </td>
                <td className='px-3 py-2 text-muted-foreground hidden sm:table-cell'>{order.serviceType || '—'}</td>
                <td className='px-3 py-2 text-right font-bold'>₵{(order.finalPrice ?? 0).toFixed(2)}</td>
                <td className='px-3 py-2 text-right text-muted-foreground'>
                  {format(new Date(order.createdAt), 'h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='bg-muted/40 border-t border-border'>
              <td colSpan={2} className='px-3 py-2 font-semibold text-muted-foreground sm:hidden'>Total</td>
              <td colSpan={3} className='px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell'>
                Total ({orders.length} orders)
              </td>
              <td className='px-3 py-2 text-right font-bold'>
                ₵{orders.reduce((s: number, o: any) => s + (o.finalPrice ?? 0), 0).toFixed(2)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OutstandingHistoryPage() {
  const { stationToken } = useStationSession()

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const firstStr = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
  const [fromDate, setFromDate] = useState(firstStr)
  const [toDate,   setToDate]   = useState(todayStr)

  const history = useQuery(
    (api as any).cashReconciliation.getReconciliationHistory,
    stationToken ? { stationToken, days: 90 } : 'skip'
  )

  const summary = useQuery(
    (api as any).cashReconciliation.getTodayCashSummary,
    stationToken ? { stationToken } : 'skip'
  )

  const filtered = useMemo(() => {
    if (!history) return []
    return (history as any[]).filter(r => r.date >= fromDate && r.date <= toDate)
  }, [history, fromDate, toDate])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  }, [filtered])

  const rangeTotals = useMemo(() => {
    const collected      = filtered.reduce((s: number, r: any) => s + (r.cashCollected   ?? 0), 0)
    const deducted       = filtered.reduce((s: number, r: any) => s + (r.totalDeductions ?? 0), 0)
    const sent           = filtered.reduce((s: number, r: any) => s + (r.completedSent   ?? 0), 0)
    const confirmedCount = filtered.filter((r: any) => r.summaryStatus === 'completed').length
    return { collected, deducted, sent, confirmedCount }
  }, [filtered])

  const handleExport = () => {
    if (filtered.length === 0) { toast.error('No records to export'); return }
    const rows: (string | number | null | undefined)[][] = [
      ['Date', 'Order Number', 'Customer', 'Service', 'Amount (₵)', 'Time', 'Day Sent (₵)', 'Day Status'],
    ]
    for (const day of sorted) {
      const dayOrders: any[] = day.orders ?? []
      if (dayOrders.length === 0) {
        rows.push([day.date, '', '', '', '', '', (day.completedSent ?? 0).toFixed(2), day.summaryStatus ?? ''])
      } else {
        dayOrders.forEach((o: any, i: number) => {
          rows.push([
            day.date,
            o.orderNumber,
            o.customerName || '',
            o.serviceType || '',
            (o.finalPrice ?? 0).toFixed(2),
            format(new Date(o.createdAt), 'd MMM yyyy h:mm a'),
            i === 0 ? (day.completedSent ?? 0).toFixed(2) : '',
            i === 0 ? (day.summaryStatus ?? '') : '',
          ])
        })
      }
    }
    downloadCSV(rows, `reconciliation-${fromDate}-to-${toDate}.csv`)
  }

  return (
    <WashStationLayout title='Reconciliation History'>
      <div className='space-y-6'>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>Reconciliation History</h2>
            <p className='text-sm text-muted-foreground'>Cash sent to head office by date</p>
          </div>
          <Link href='/washstation/reconciliation'>
            <Button variant='outline' size='sm' className='gap-2'>
              <ArrowLeft className='w-3.5 h-3.5' />
              Back
            </Button>
          </Link>
        </div>

        {/* Date filter + export */}
        <Card className='p-4'>
          <div className='flex flex-wrap items-end gap-4'>
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>From</Label>
              <Input type='date' value={fromDate} onChange={e => setFromDate(e.target.value)} className='h-9 text-sm w-40' />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>To</Label>
              <Input type='date' value={toDate} onChange={e => setToDate(e.target.value)} className='h-9 text-sm w-40' />
            </div>
            <Button variant='outline' size='sm' className='gap-2 h-9' onClick={handleExport} disabled={filtered.length === 0}>
              <Download className='w-3.5 h-3.5' />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Summary cards */}
        <div className='grid grid-cols-2 gap-3'>
          <Card className='p-4'>
            <p className='text-xs text-muted-foreground mb-1'>Cash Collected</p>
            <p className='text-xl font-bold'>₵{rangeTotals.collected.toFixed(2)}</p>
            {rangeTotals.deducted > 0 && (
              <p className='text-xs text-orange-600 mt-1'>−₵{rangeTotals.deducted.toFixed(2)} used at branch</p>
            )}
          </Card>
          <Card className='p-4 border-green-200 bg-green-50/50 dark:bg-green-950/10'>
            <p className='text-xs text-muted-foreground mb-1'>Total Sent</p>
            <p className='text-xl font-bold text-green-600'>₵{rangeTotals.sent.toFixed(2)}</p>
            <p className='text-xs text-muted-foreground mt-1'>
              {rangeTotals.confirmedCount} confirmed {rangeTotals.confirmedCount === 1 ? 'day' : 'days'}
            </p>
          </Card>
        </div>

        {/* Today outstanding alert */}
        {summary && (summary.outstandingCash ?? 0) > 0 && (
          <Card className='border-red-200 bg-red-50/50 dark:bg-red-950/10'>
            <CardContent className='flex items-center gap-3 py-4'>
              <AlertCircle className='w-5 h-5 text-red-500 shrink-0' />
              <p className='text-sm text-red-700 dark:text-red-400'>
                You still have <span className='font-bold'>₵{(summary.outstandingCash ?? 0).toFixed(2)}</span> outstanding today that hasn't been sent.
              </p>
              <Link href='/washstation/reconciliation' className='ml-auto shrink-0'>
                <Button size='sm' variant='destructive'>Send Now</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* History list */}
        {history === undefined ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <p className='text-sm'>No records found for this date range</p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {sorted.map((day: any) => {
              const cashCollected   = day.cashCollected   ?? 0
              const totalDeductions = day.totalDeductions ?? 0
              const completedSent   = day.completedSent   ?? 0
              const dayOutstanding  = day.dayOutstanding  ?? Math.max(0, cashCollected - completedSent - totalDeductions)
              const recons: any[]   = day.recons ?? []
              const orders: any[]   = day.orders ?? []
              const summaryStatus   = day.summaryStatus

              const hasProcessing = recons.some(
                (r: any) => r.status === 'processing' || r.status === 'pending'
              )

              const borderClass =
                summaryStatus === 'completed'                ? 'border-green-200' :
                hasProcessing || summaryStatus === 'partial' ? 'border-yellow-200' :
                dayOutstanding > 0                           ? 'border-red-200'    : 'border-border'

              return (
                <Card key={day.date} className={borderClass}>
                  <CardHeader className='pb-2 pt-4 px-4'>
                    <div className='flex items-start justify-between flex-wrap gap-2'>
                      <div>
                        <p className='font-semibold text-foreground'>{dayLabel(day.date)}</p>
                        <p className='text-xs text-muted-foreground'>{format(parseISO(day.date), 'd MMMM yyyy')}</p>
                      </div>

                      <div className='text-right space-y-1'>
                        <div className='flex items-center justify-end gap-3 text-sm flex-wrap'>
                          <span className='text-muted-foreground'>
                            Collected: <span className='font-semibold text-foreground'>₵{cashCollected.toFixed(2)}</span>
                          </span>
                          {totalDeductions > 0 && (
                            <span className='text-muted-foreground'>
                              Used: <span className='font-semibold text-orange-600'>₵{totalDeductions.toFixed(2)}</span>
                            </span>
                          )}
                          <span className='text-muted-foreground'>
                            Sent: <span className='font-semibold text-green-600'>₵{completedSent.toFixed(2)}</span>
                          </span>
                        </div>

                        {summaryStatus === 'completed' ? (
                          <span className='inline-flex text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full border border-green-200'>
                            Settled
                          </span>
                        ) : summaryStatus === 'partial' || hasProcessing ? (
                          <span className='inline-flex text-xs font-semibold text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-full border border-yellow-200'>
                            {hasProcessing ? 'Awaiting confirmation' : `₵${dayOutstanding.toFixed(2)} still outstanding`}
                          </span>
                        ) : dayOutstanding > 0 ? (
                          <span className='inline-flex text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full border border-red-200'>
                            ₵{dayOutstanding.toFixed(2)} not sent
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='px-4 pb-4 pt-0 space-y-3'>
                    {/* Recon send rows */}
                    {recons.length === 0 ? (
                      <div className='flex items-center justify-between gap-2 px-3 py-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/10 text-sm'>
                        <div className='flex items-center gap-2 text-red-600'>
                          <AlertCircle className='w-4 h-4 shrink-0' />
                          <span className='font-medium'>No payment sent for this day</span>
                        </div>
                        <span className='text-muted-foreground text-xs'>
                          {day.orderCount ?? 0} cash order{(day.orderCount ?? 0) !== 1 ? 's' : ''} · ₵{cashCollected.toFixed(2)} collected
                        </span>
                      </div>
                    ) : (
                      <div className='divide-y divide-border rounded-lg border border-border overflow-hidden'>
                        {recons.map((recon: any) => (
                          <div key={recon._id} className='flex items-center justify-between gap-3 px-3 py-3 bg-background'>
                            <div className='flex items-center gap-3 min-w-0'>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                recon.status === 'completed'  ? 'bg-green-100 dark:bg-green-900/30' :
                                recon.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30'  :
                                recon.status === 'failed'     ? 'bg-red-100 dark:bg-red-900/30'    :
                                'bg-muted'
                              }`}>
                                {recon.status === 'completed'
                                  ? <CheckCircle2 className='w-4 h-4 text-green-600' />
                                  : <Clock className='w-4 h-4 text-blue-500' />
                                }
                              </div>
                              <div className='min-w-0'>
                                <p className='text-sm font-semibold'>₵{(recon.amountSent ?? 0).toFixed(2)} sent</p>
                                <p className='text-xs text-muted-foreground font-mono'>{recon.senderMomoNumber || '—'}</p>
                              </div>
                            </div>
                            <div className='flex items-center gap-3 shrink-0'>
                              <StatusBadge status={recon.status} />
                              <span className='text-xs text-muted-foreground'>
                                {recon.completedAt
                                  ? format(new Date(recon.completedAt), 'h:mm a')
                                  : recon.createdAt
                                  ? format(new Date(recon.createdAt),   'h:mm a')
                                  : '—'
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Orders table — always visible */}
                    <DayOrdersTable orders={orders} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </WashStationLayout>
  )
}