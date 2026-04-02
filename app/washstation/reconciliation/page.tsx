'use client'

import { useState } from 'react'
import { useQuery, useAction, useMutation } from 'convex/react'
import { api } from '@jordan6699/washlab-backend/api'
import { useStationSession } from '@/hooks/useStationSession'
import { useStationAttendance } from '@/hooks/useStationAttendance'
import { WashStationLayout } from '@/components/washstation/WashStationLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Banknote, Clock, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

export default function ReconciliationPage() {
  const { stationToken } = useStationSession()
  const { attendance: activeAttendance } = useStationAttendance(stationToken)
  const [momoNumber, setMomoNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const summary = useQuery((api as any).cashReconciliation.getTodayCashSummary, stationToken ? { stationToken } : 'skip')
  const outstanding = useQuery((api as any).cashReconciliation.getReconciliationHistory, stationToken ? { stationToken, limit: 50 } : 'skip')
  const initiate = useAction((api as any).cashReconciliation.initiateCashReconciliation)
  const save = useMutation((api as any).cashReconciliation.saveReconciliation)

  const amountToSend = summary?.outstandingCash ?? summary?.totalCash ?? 0

  const handleSubmit = async () => {
    if (!momoNumber || momoNumber.length < 10) { toast.error('Please enter a valid MoMo number'); return }
    if (!summary || amountToSend <= 0) { toast.error('No outstanding cash to send'); return }
    setLoading(true)
    try {
      const res = await initiate({ stationToken, senderMomoNumber: momoNumber, amount: amountToSend, attendantId: activeAttendance?.attendant?._id })
      await save({ stationToken, senderMomoNumber: momoNumber, amountSent: amountToSend, paystackReference: res.reference, status: 'processing' })
      setResult(res)
      toast.success('Payment request sent! Check your phone.')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to initiate reconciliation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <WashStationLayout title='Cash Reconciliation'>
      <div className='max-w-xl mx-auto space-y-5'>

        {/* Summary Card */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Banknote className='w-5 h-5 text-primary' />
              Cash Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary === undefined ? (
              <div className='flex justify-center py-6'><Loader2 className='w-6 h-6 animate-spin text-muted-foreground' /></div>
            ) : (
              <div className='space-y-2'>
                <div className='flex justify-between items-center py-2 border-b'>
                  <span className='text-sm text-muted-foreground'>Today's Cash Orders</span>
                  <span className='font-bold'>{summary.orderCount} orders · ₵{summary.totalCash.toFixed(2)}</span>
                </div>
                <div className='flex justify-between items-center py-2'>
                  <span className='text-sm font-semibold'>Outstanding (to send)</span>
                  <span className={'font-bold text-xl ' + (amountToSend > 0 ? 'text-red-600' : 'text-green-600')}>₵{amountToSend.toFixed(2)}</span>
                </div>
                {summary.orderCount === 0 && amountToSend === 0 && (
                  <div className='flex items-center gap-2 p-3 bg-muted rounded-lg mt-2'>
                    <AlertCircle className='w-4 h-4 text-muted-foreground shrink-0' />
                    <p className='text-sm text-muted-foreground'>No cash orders recorded yet.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding breakdown by date */}
        {summary && amountToSend > 0 && Array.isArray(outstanding) && outstanding.filter((r: any) => r.status !== 'completed').length > 0 && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Outstanding Amounts</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {Array.isArray(outstanding) && outstanding
                .filter((r: any) => r.status !== 'completed')
                .sort((a: any, b: any) => b.date.localeCompare(a.date))
                .map((r: any) => (
                  <div key={r._id} className='flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-sm'>
                    <div>
                      <p className='font-medium text-foreground'>{r.date}</p>
                      <p className='text-xs text-muted-foreground'>{r.orderCount || 0} orders</p>
                    </div>
                    <span className='font-bold text-red-600'>₵{(r.totalCashOrders || 0).toFixed(2)}</span>
                  </div>
                ))}
              <div className='flex justify-between items-center pt-2 border-t font-semibold text-sm'>
                <span>Total to Send</span>
                <span className='text-red-600 text-base'>₵{amountToSend.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Form */}
        {summary && amountToSend > 0 && !result && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Send Outstanding Cash via MoMo</CardTitle>
              <p className='text-xs text-muted-foreground'>Enter your MoMo number to send ₵{amountToSend.toFixed(2)} to WashLab</p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-1.5'>
                <Label className='text-sm'>Your MoMo Number</Label>
                <Input type='tel' placeholder='e.g. 0241234567' value={momoNumber} onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode='numeric' maxLength={10} className='h-10' />
              </div>
              <Button className='w-full gap-2' onClick={handleSubmit} disabled={loading || !momoNumber || momoNumber.length < 10}>
                {loading ? <><Loader2 className='w-4 h-4 animate-spin' /> Processing...</> : <>Send ₵{amountToSend.toFixed(2)} <ArrowRight className='w-4 h-4' /></>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success state */}
        {result && amountToSend > 0 && (
          <Card className='border-green-200 bg-green-50 dark:bg-green-900/20'>
            <CardContent className='pt-6 space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-green-100 flex items-center justify-center'>
                  <Clock className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <p className='font-semibold text-green-800 dark:text-green-300'>Payment Request Sent!</p>
                  <p className='text-sm text-green-700 dark:text-green-400'>{(result as any).displayText}</p>
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>Once you approve on your phone, the reconciliation will be confirmed automatically.</p>
            </CardContent>
          </Card>
        )}



      </div>
    </WashStationLayout>
  )
}