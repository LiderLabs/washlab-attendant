'use client'

import { useQuery } from 'convex/react'
import { api } from '@jordan6699/washlab-backend/api'
import { useStationSession } from '@/hooks/useStationSession'
import { WashStationLayout } from '@/components/washstation/WashStationLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle, History } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string; icon: any }> = {
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
    processing: { label: 'Processing', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Clock },
    pending:    { label: 'Pending',    class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', icon: Clock },
    failed:     { label: 'Failed',     class: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
  }
  const s = map[status] ?? { label: status, class: 'bg-muted text-muted-foreground', icon: AlertCircle }
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.class}`}>
      <Icon className='w-3 h-3' />
      {s.label}
    </span>
  )
}

export default function HistoryPage() {
  const { stationToken } = useStationSession()

  const summary = useQuery(
    (api as any).cashReconciliation.getTodayCashSummary,
    stationToken ? { stationToken } : 'skip'
  )

  const history = useQuery(
    (api as any).cashReconciliation.getReconciliationHistoryForStation,
    stationToken ? { stationToken } : 'skip'
  )

  const isLoading = summary === undefined || history === undefined

  return (
    <WashStationLayout title='Cash History'>
      <div className='space-y-6'>

        {/* Header */}
        <div className='flex items-center gap-3'>
          <Link href='/washstation/reconciliation'>
            <Button variant='ghost' size='sm' className='gap-2 -ml-2'>
              <ArrowLeft className='w-4 h-4' />
              Back
            </Button>
          </Link>
          <div>
            <h2 className='text-xl font-bold text-foreground'>Cash History</h2>
            <p className='text-sm text-muted-foreground'>All reconciliation payments sent</p>
          </div>
        </div>

        {/* Summary strip */}
        <div className='grid grid-cols-3 gap-4'>
          <Card className='p-5'>
            <p className='text-xs text-muted-foreground mb-1'>Total Collected</p>
            <p className='text-2xl font-bold'>
              {isLoading ? '—' : `₵${(summary?.totalEverCollected ?? 0).toFixed(2)}`}
            </p>
          </Card>
          <Card className='p-5 border-green-200 bg-green-50/50 dark:bg-green-950/10'>
            <p className='text-xs text-muted-foreground mb-1'>Total Sent</p>
            <p className='text-2xl font-bold text-green-600'>
              {isLoading ? '—' : `₵${(summary?.totalEverSent ?? 0).toFixed(2)}`}
            </p>
          </Card>
          <Card className={`p-5 ${(summary?.outstandingCash ?? 0) > 0 ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10' : 'border-green-200 bg-green-50/50 dark:bg-green-950/10'}`}>
            <p className='text-xs text-muted-foreground mb-1'>Outstanding</p>
            <p className={`text-2xl font-bold ${(summary?.outstandingCash ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {isLoading ? '—' : `₵${(summary?.outstandingCash ?? 0).toFixed(2)}`}
            </p>
          </Card>
        </div>

        {/* Reconciliation records table */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <History className='w-4 h-4 text-primary' />
              Payment Records
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex justify-center py-12'>
                <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
              </div>
            ) : !history || history.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                <CheckCircle2 className='w-10 h-10 mb-3 text-green-500 opacity-60' />
                <p className='text-sm font-medium'>No reconciliations yet</p>
                <p className='text-xs'>Payments sent will appear here</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border bg-muted/40'>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap'>Date</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap'>Amount Sent</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap'>From (MoMo)</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap'>Reference</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r: any) => (
                      <tr key={r._id} className='border-b border-border last:border-0 hover:bg-muted/20 transition-colors'>
                        <td className='px-4 py-3 text-muted-foreground whitespace-nowrap'>
                          {format(new Date(r.createdAt), 'd MMM yyyy, h:mm a')}
                        </td>
                        <td className='px-4 py-3'>
                          <span className='font-bold text-foreground'>₵{(r.amountSent ?? 0).toFixed(2)}</span>
                        </td>
                        <td className='px-4 py-3 font-mono text-sm text-foreground'>
                          {r.senderMomoNumber || '—'}
                        </td>
                        <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                          {r.paystackReference || '—'}
                        </td>
                        <td className='px-4 py-3'>
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className='bg-muted/40 border-t border-border'>
                      <td className='px-4 py-3 font-semibold text-sm'>Total sent</td>
                      <td className='px-4 py-3 font-bold text-sm text-green-600'>
                        ₵{history.filter((r: any) => r.status === 'completed').reduce((s: number, r: any) => s + (r.amountSent ?? 0), 0).toFixed(2)}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href='/washstation/reconciliation'>
          <Button variant='outline' className='w-full gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Back to Reconciliation
          </Button>
        </Link>

      </div>
    </WashStationLayout>
  )
}