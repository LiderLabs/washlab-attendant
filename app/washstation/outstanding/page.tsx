'use client'

import { useQuery } from 'convex/react'
import { api } from '@jordan6699/washlab-backend/api'
import { useStationSession } from '@/hooks/useStationSession'
import { WashStationLayout } from '@/components/washstation/WashStationLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  History, ArrowLeft, Banknote, CheckCircle2, Clock,
  TrendingUp, ShoppingCart, Loader2, CalendarDays,
} from 'lucide-react'
import Link from 'next/link'
import { format, isToday, isYesterday } from 'date-fns'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    failed:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function formatDayLabel(dateStr: string) {
  // dateStr is "YYYY-MM-DD"
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEEE, d MMMM yyyy')
}

export default function OutstandingHistoryPage() {
  const { stationToken } = useStationSession()

  // Fetch reconciliation history — last 30 days
  const history = useQuery(
    (api as any).cashReconciliation.getReconciliationHistory,
    stationToken ? { stationToken, days: 30 } : 'skip'
  )

  // Also fetch today's summary so we can show running outstanding
  const summary = useQuery(
    (api as any).cashReconciliation.getTodayCashSummary,
    stationToken ? { stationToken } : 'skip'
  )

  // Group reconciliations by date
  const grouped = (() => {
    if (!history) return []
    const map: Record<string, typeof history> = {}
    for (const r of history) {
      if (!map[r.date]) map[r.date] = []
      map[r.date].push(r)
    }
    // Sort dates descending
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  })()

  // Running total across all days
  const totalSentAllTime   = history?.filter(r => r.status === 'completed').reduce((s, r) => s + (r.amountSent || 0), 0) ?? 0
  const totalCollectedDays = history?.reduce((s, r) => s + (r.cashCollected || 0), 0) ?? 0

  return (
    <WashStationLayout title='Reconciliation History'>
      <div className='space-y-6'>

        {/* ── Header ── */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>Reconciliation History</h2>
            <p className='text-sm text-muted-foreground'>Last 30 days</p>
          </div>
          <Link href='/washstation/reconciliation'>
            <Button variant='outline' size='sm' className='gap-2'>
              <ArrowLeft className='w-3.5 h-3.5' />
              Back
            </Button>
          </Link>
        </div>

        {/* ── Top summary strip ── */}
        {summary !== undefined && (
          <div className='grid grid-cols-3 gap-4'>
            <Card className='p-4'>
              <p className='text-xs text-muted-foreground mb-1'>Today Collected</p>
              <p className='text-2xl font-bold'>₵{(summary?.totalCash ?? 0).toFixed(2)}</p>
            </Card>
            <Card className='p-4'>
              <p className='text-xs text-muted-foreground mb-1'>Today Sent</p>
              <p className='text-2xl font-bold text-green-600'>
                ₵{(summary?.totalEverSent != null
                  ? history
                      ?.filter(r => r.status === 'completed' && r.date === format(new Date(), 'yyyy-MM-dd'))
                      .reduce((s, r) => s + (r.amountSent || 0), 0) ?? 0
                  : 0
                ).toFixed(2)}
              </p>
            </Card>
            <Card className={`p-4 ${(summary?.outstandingCash ?? 0) > 0 ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10' : 'border-green-200 bg-green-50/50 dark:bg-green-950/10'}`}>
              <p className='text-xs text-muted-foreground mb-1'>Outstanding Now</p>
              <p className={`text-2xl font-bold ${(summary?.outstandingCash ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₵{(summary?.outstandingCash ?? 0).toFixed(2)}
              </p>
            </Card>
          </div>
        )}

        {/* ── History list ── */}
        {history === undefined ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : grouped.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <History className='w-12 h-12 mb-3 opacity-20' />
              <p className='text-sm'>No reconciliation history yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            {grouped.map(([dateStr, recons]) => {
              const dayCash       = recons[0]?.cashCollected ?? 0
              const dayDeductions = recons.reduce((s, r) => s + (r.totalDeductions || 0), 0)
              const daySent       = recons.filter(r => r.status === 'completed').reduce((s, r) => s + (r.amountSent || 0), 0)
              const dayOutstanding = Math.max(0, dayCash - daySent - dayDeductions)

              return (
                <div key={dateStr} className='space-y-3'>

                  {/* Day header */}
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2'>
                      <CalendarDays className='w-4 h-4 text-muted-foreground' />
                      <span className='font-semibold text-foreground'>{formatDayLabel(dateStr)}</span>
                      <span className='text-xs text-muted-foreground'>{format(new Date(dateStr + 'T00:00:00'), 'd MMM yyyy')}</span>
                    </div>
                    <div className='flex-1 h-px bg-border' />
                    <div className='flex items-center gap-3 text-xs'>
                      <span className='text-muted-foreground'>Collected: <span className='font-semibold text-foreground'>₵{dayCash.toFixed(2)}</span></span>
                      {dayDeductions > 0 && (
                        <span className='text-muted-foreground'>Used: <span className='font-semibold text-orange-600'>₵{dayDeductions.toFixed(2)}</span></span>
                      )}
                      <span className='text-muted-foreground'>Sent: <span className='font-semibold text-green-600'>₵{daySent.toFixed(2)}</span></span>
                      {dayOutstanding > 0 && (
                        <span className='text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full'>
                          ₵{dayOutstanding.toFixed(2)} outstanding
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Day's recon records */}
                  <Card>
                    <CardContent className='p-0'>
                      <div className='divide-y divide-border'>
                        {recons.map((recon: any) => (
                          <div key={recon._id} className='px-4 py-3 flex items-center justify-between gap-4'>
                            <div className='flex items-center gap-3 min-w-0'>
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                recon.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                                recon.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                'bg-muted'
                              }`}>
                                {recon.status === 'completed'
                                  ? <CheckCircle2 className='w-4 h-4 text-green-600' />
                                  : <Clock className='w-4 h-4 text-blue-500' />
                                }
                              </div>
                              <div className='min-w-0'>
                                <p className='text-sm font-semibold text-foreground truncate'>
                                  ₵{(recon.amountSent ?? 0).toFixed(2)} sent
                                </p>
                                <p className='text-xs text-muted-foreground font-mono truncate'>
                                  {recon.senderMomoNumber || '—'}
                                </p>
                              </div>
                            </div>

                            <div className='flex items-center gap-4 shrink-0'>
                              {/* Deductions on this recon */}
                              {(recon.totalDeductions ?? 0) > 0 && (
                                <div className='flex items-center gap-1.5 text-xs text-orange-600'>
                                  <ShoppingCart className='w-3.5 h-3.5' />
                                  <span>- ₵{(recon.totalDeductions).toFixed(2)} used</span>
                                </div>
                              )}

                              {/* Cash collected badge */}
                              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                <Banknote className='w-3.5 h-3.5' />
                                <span>₵{(recon.cashCollected ?? 0).toFixed(2)} collected</span>
                              </div>

                              <StatusBadge status={recon.status} />

                              <p className='text-xs text-muted-foreground whitespace-nowrap'>
                                {recon.completedAt
                                  ? format(new Date(recon.completedAt), 'h:mm a')
                                  : recon.createdAt
                                  ? format(new Date(recon.createdAt), 'h:mm a')
                                  : '—'
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              )
            })}
          </div>
        )}

        {/* ── All-time footer ── */}
        {history && history.length > 0 && (
          <Card className='border-dashed'>
            <CardContent className='flex items-center justify-between py-4'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <TrendingUp className='w-4 h-4' />
                <span>Total sent (30 days)</span>
              </div>
              <span className='font-bold text-lg text-green-600'>₵{totalSentAllTime.toFixed(2)}</span>
            </CardContent>
          </Card>
        )}

      </div>
    </WashStationLayout>
  )
}