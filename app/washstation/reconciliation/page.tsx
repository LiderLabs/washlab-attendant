'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '@jordan6699/washlab-backend/api'
import { useStationSession } from '@/hooks/useStationSession'
import { useStationAttendance } from '@/hooks/useStationAttendance'
import { WashStationLayout } from '@/components/washstation/WashStationLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Banknote, Loader2, ArrowRight, CheckCircle2,
  ShoppingCart, Plus, Trash2, History, TrendingUp, Smartphone, KeyRound,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Deduction {
  id: string
  amount: number
  reason: string
}

type FlowStep = 'idle' | 'loading' | 'otp' | 'submitting' | 'success'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function ReconciliationPage() {
  const { stationToken } = useStationSession()
  const { attendance: activeAttendance } = useStationAttendance(stationToken)

  const [flowStep, setFlowStep] = useState<FlowStep>('idle')
  const [momoNumber, setMomoNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [pendingReference, setPendingReference] = useState('')
  const [result, setResult] = useState<{ amount: number; momoNumber: string; reference: string } | null>(null)
  const [paidAmount, setPaidAmount] = useState(0)
  const [polling, setPolling] = useState(false)

  const [deductions, setDeductions] = useState<Deduction[]>([])
  const [deductionAmount, setDeductionAmount] = useState('')
  const [deductionReason, setDeductionReason] = useState('')
  const [savingDeduction, setSavingDeduction] = useState(false)
  const [showDeductionForm, setShowDeductionForm] = useState(false)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  // Track whether we've already saved this reference so polling never saves twice
  const savedRef = useRef<string | null>(null)

  const summary = useQuery(
    (api as any).cashReconciliation.getTodayCashSummary,
    stationToken ? { stationToken } : 'skip'
  )
  const todayOrders = useQuery(
    (api as any).cashReconciliation.getTodayCashOrders,
    stationToken ? { stationToken } : 'skip'
  )
  const initiate = useAction((api as any).cashReconciliation.initiateCashReconciliation)
  const submitOtpAction = useAction((api as any).cashReconciliation.submitOtp)
  const verify = useAction((api as any).cashReconciliation.verifyAndComplete)
  const save = useMutation((api as any).cashReconciliation.saveReconciliation)
  const saveDeduction = useMutation((api as any).cashReconciliation.saveCashDeduction)

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0)

  // Use todaySent + todayDeducted from backend so we can recalculate
  // outstanding ourselves. outstandingCash is clamped to 0 by the backend
  // which hides the send form when duplicate records inflate todaySent.
  const todayCash      = summary?.totalCash     ?? 0
  const todaySent      = summary?.todaySent      ?? 0
  const todayDeducted  = summary?.todayDeducted  ?? 0
  const rawOutstanding = Math.max(0, todayCash - todaySent - todayDeducted)
  const effectiveOutstanding = Math.max(0, rawOutstanding - paidAmount)
  const amountToSend = effectiveOutstanding

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setPolling(false)
  }

  // Polling — only saves once via savedRef guard
  useEffect(() => {
    if (!pendingReference || flowStep === 'success') return

    setPolling(true)
    pollingRef.current = setInterval(async () => {
      try {
        const res = await verify({ reference: pendingReference })

        if (res.status === 'completed') {
          stopPolling()
          // Only save if we haven't already saved this reference
          if (savedRef.current !== pendingReference) {
            savedRef.current = pendingReference
            await save({
              stationToken,
              senderMomoNumber: momoNumber,
              amountSent: amountToSend,
              paystackReference: pendingReference,
              status: 'completed',
            })
          }
          setPaidAmount(amountToSend)
          setResult({ amount: amountToSend, momoNumber, reference: pendingReference })
          setFlowStep('success')
          toast.success('Payment confirmed!')
        } else if (res.status === 'failed' || res.status === 'reversed') {
          stopPolling()
          toast.error('Payment failed. Please try again.')
          setFlowStep('idle')
          setPendingReference('')
        }
      } catch (_e) {
        // silent — keep polling
      }
    }, 5000)

    return () => stopPolling()
  }, [pendingReference])

  // Deduction handlers
  const handleAddDeduction = async () => {
    const amt = parseFloat(deductionAmount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    if (!deductionReason.trim()) { toast.error('Enter a reason'); return }
    if (amt > rawOutstanding) { toast.error('Deduction exceeds outstanding cash'); return }
    setSavingDeduction(true)
    try {
      await saveDeduction({ stationToken, amount: amt, reason: deductionReason.trim() })
      setDeductions(prev => [...prev, { id: crypto.randomUUID(), amount: amt, reason: deductionReason.trim() }])
      setDeductionAmount('')
      setDeductionReason('')
      setShowDeductionForm(false)
      toast.success('Deduction saved')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save deduction')
    } finally {
      setSavingDeduction(false)
    }
  }

  const handleRemoveDeduction = (id: string) => {
    setDeductions(prev => prev.filter(d => d.id !== id))
  }

  // Step 1: initiate — NO save here, only start polling
  const handleSubmit = async () => {
    if (!momoNumber || momoNumber.length < 10) { toast.error('Enter a valid MoMo number'); return }
    if (!summary || amountToSend <= 0) { toast.error('No outstanding cash to send'); return }

    setFlowStep('loading')
    try {
      const res = await initiate({
        stationToken,
        senderMomoNumber: momoNumber,
        amount: amountToSend,
        attendantId: activeAttendance?.attendant?._id,
        branchEmail: summary?.branchEmail || undefined,
      })

      if (res.status === 'send_otp') {
        setPendingReference(res.reference)
        setFlowStep('otp')
        toast.info('OTP sent to phone — enter it below')
        return
      }

      // Start polling — save will happen only when polling confirms completion
      setPendingReference(res.reference)
      // flowStep stays 'loading' while waiting for phone approval

    } catch (e: any) {
      toast.error(e?.message || 'Failed to initiate payment')
      setFlowStep('idle')
    }
  }

  // Step 2: OTP submit — saves once on confirmation, then polling is blocked by savedRef
  const handleSubmitOtp = async () => {
    if (!otp.trim()) { toast.error('Enter the OTP'); return }

    setFlowStep('submitting')
    try {
      const res = await submitOtpAction({ reference: pendingReference, otp: otp.trim() })

      if (res.status === 'success') {
        stopPolling()
        if (savedRef.current !== pendingReference) {
          savedRef.current = pendingReference
          await save({
            stationToken,
            senderMomoNumber: momoNumber,
            amountSent: amountToSend,
            paystackReference: pendingReference,
            status: 'completed',
          })
        }
        setPaidAmount(amountToSend)
        setResult({ amount: amountToSend, momoNumber, reference: pendingReference })
        setFlowStep('success')
        toast.success('Payment confirmed!')
      } else if (res.status === 'pay_offline') {
        // Let polling handle the save
        setFlowStep('loading')
        toast.info('Check your phone to approve the payment')
      } else {
        toast.error(res.displayText || 'OTP not accepted, please try again')
        setOtp('')
        setFlowStep('otp')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit OTP')
      setFlowStep('otp')
    }
  }

  return (
    <WashStationLayout title='Cash Reconciliation'>
      <div className='space-y-6'>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>Cash Reconciliation</h2>
            <p className='text-sm text-muted-foreground'>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          </div>
          <Link href='/washstation/outstanding'>
            <Button variant='outline' size='sm' className='gap-2'>
              <History className='w-3.5 h-3.5' />
              History
            </Button>
          </Link>
        </div>

        {/* Summary cards */}
        <div className='grid grid-cols-3 gap-4'>
          <Card className='p-5'>
            <p className='text-xs text-muted-foreground mb-1'>Today's Orders</p>
            <p className='text-3xl font-bold'>{summary === undefined ? '—' : summary.orderCount}</p>
          </Card>
          <Card className='p-5'>
            <p className='text-xs text-muted-foreground mb-1'>Cash Collected Today</p>
            <p className='text-3xl font-bold'>
              {summary === undefined ? '—' : `₵${summary.totalCash.toFixed(2)}`}
            </p>
          </Card>
          <Card className={`p-5 ${effectiveOutstanding > 0 ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10' : 'border-green-200 bg-green-50/50 dark:bg-green-950/10'}`}>
            <p className='text-xs text-muted-foreground mb-1'>Total Outstanding</p>
            <p className={`text-3xl font-bold ${effectiveOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary === undefined ? '—' : `₵${effectiveOutstanding.toFixed(2)}`}
            </p>
          </Card>
        </div>

        {/* Today's orders table */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Banknote className='w-4 h-4 text-primary' />
              Today's Cash Orders
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            {summary === undefined ? (
              <div className='flex justify-center py-12'>
                <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
              </div>
            ) : !todayOrders || todayOrders.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                <Banknote className='w-10 h-10 mb-3 opacity-20' />
                <p className='text-sm'>No cash orders today</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border bg-muted/40'>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground'>Order Number</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground'>Customer</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground'>Service</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground'>Amount</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground'>Status</th>
                      <th className='text-left px-4 py-3 font-medium text-muted-foreground'>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayOrders.map((order: any) => (
                      <tr key={order._id} className='border-b border-border last:border-0 hover:bg-muted/20'>
                        <td className='px-4 py-3 font-mono font-semibold text-primary'>{order.orderNumber}</td>
                        <td className='px-4 py-3'>
                          <p className='font-medium'>{order.customerName || '—'}</p>
                          <p className='text-xs text-muted-foreground'>{order.customerPhoneNumber || ''}</p>
                        </td>
                        <td className='px-4 py-3 text-muted-foreground'>{order.serviceType || '—'}</td>
                        <td className='px-4 py-3 font-bold'>₵{(order.finalPrice ?? 0).toFixed(2)}</td>
                        <td className='px-4 py-3'><StatusBadge status={order.paymentStatus} /></td>
                        <td className='px-4 py-3 text-muted-foreground'>{format(new Date(order.createdAt), 'h:mm a')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className='bg-muted/40 border-t border-border'>
                      <td colSpan={3} className='px-4 py-3 font-semibold text-sm'>Total ({todayOrders.length} orders)</td>
                      <td colSpan={3} className='px-4 py-3 font-bold text-sm'>₵{summary.totalCash.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting for phone approval */}
        {flowStep === 'loading' && polling && (
          <Card className='border-blue-200 bg-blue-50/50 dark:bg-blue-950/10'>
            <CardContent className='flex items-center gap-4 py-6'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-600 shrink-0' />
              <div>
                <p className='font-semibold text-blue-800 dark:text-blue-300 text-lg'>Waiting for approval…</p>
                <p className='text-sm text-blue-700 dark:text-blue-400'>
                  A request of <span className='font-bold'>₵{amountToSend.toFixed(2)}</span> was sent to <span className='font-mono font-semibold'>{momoNumber}</span>. Approve it on your phone.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* OTP step */}
        {(flowStep === 'otp' || flowStep === 'submitting') && (
          <Card className='border-blue-200 bg-blue-50/50 dark:bg-blue-950/10'>
            <CardContent className='pt-6 space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
                  <KeyRound className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <p className='font-semibold text-blue-800 dark:text-blue-300 text-lg'>OTP Required</p>
                  <p className='text-sm text-blue-700 dark:text-blue-400'>
                    Enter the OTP sent to <span className='font-mono font-semibold'>{momoNumber}</span>.
                  </p>
                </div>
              </div>
              <Input
                type='number'
                inputMode='numeric'
                placeholder='Enter OTP'
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className='h-12 text-center text-xl tracking-widest font-mono'
                disabled={flowStep === 'submitting'}
                autoFocus
              />
              <div className='flex gap-3'>
                <Button variant='outline' className='flex-1' onClick={() => { stopPolling(); setFlowStep('idle'); setOtp(''); setPendingReference('') }} disabled={flowStep === 'submitting'}>
                  Cancel
                </Button>
                <Button className='flex-1 gap-2' onClick={handleSubmitOtp} disabled={!otp.trim() || flowStep === 'submitting'}>
                  {flowStep === 'submitting' ? <><Loader2 className='w-4 h-4 animate-spin' /> Verifying…</> : <>Submit OTP <ArrowRight className='w-4 h-4' /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send form + deductions */}
        {summary && flowStep !== 'success' && flowStep !== 'otp' && flowStep !== 'submitting' && flowStep !== 'loading' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

            {effectiveOutstanding > 0 && (
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <ShoppingCart className='w-4 h-4 text-orange-500' />
                      Cash Used
                    </CardTitle>
                    {!showDeductionForm && (
                      <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setShowDeductionForm(true)}>
                        <Plus className='w-3.5 h-3.5' /> Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {deductions.length > 0 && (
                    <div className='space-y-2'>
                      {deductions.map(d => (
                        <div key={d.id} className='flex items-center justify-between p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200 text-sm'>
                          <p className='font-medium'>{d.reason}</p>
                          <div className='flex items-center gap-2'>
                            <span className='font-bold text-orange-600'>- ₵{d.amount.toFixed(2)}</span>
                            <button onClick={() => handleRemoveDeduction(d.id)} className='text-muted-foreground hover:text-red-500'>
                              <Trash2 className='w-3.5 h-3.5' />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className='flex justify-between text-sm font-semibold pt-1 border-t border-border'>
                        <span className='text-muted-foreground'>Total deductions</span>
                        <span className='text-orange-600'>- ₵{totalDeductions.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {showDeductionForm && (
                    <div className='space-y-3 p-3 rounded-lg bg-muted/40 border border-border'>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <Label className='text-xs mb-1 block'>Amount (₵)</Label>
                          <Input type='number' placeholder='0.00' value={deductionAmount} onChange={e => setDeductionAmount(e.target.value)} className='h-9 text-sm' />
                        </div>
                        <div>
                          <Label className='text-xs mb-1 block'>Reason</Label>
                          <Input placeholder='e.g. Detergent' value={deductionReason} onChange={e => setDeductionReason(e.target.value)} className='h-9 text-sm' />
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <Button size='sm' onClick={handleAddDeduction} disabled={savingDeduction} className='flex-1'>
                          {savingDeduction ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : 'Save'}
                        </Button>
                        <Button size='sm' variant='ghost' onClick={() => { setShowDeductionForm(false); setDeductionAmount(''); setDeductionReason('') }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  {deductions.length === 0 && !showDeductionForm && (
                    <p className='text-sm text-muted-foreground text-center py-4'>No deductions added</p>
                  )}
                </CardContent>
              </Card>
            )}

            {amountToSend > 0 && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <TrendingUp className='w-4 h-4 text-primary' />
                    Send Cash via MoMo
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-1.5 text-sm bg-muted/40 rounded-lg p-3'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Outstanding</span>
                      <span className='font-medium'>₵{effectiveOutstanding.toFixed(2)}</span>
                    </div>
                    {totalDeductions > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Deductions</span>
                        <span className='font-medium text-orange-600'>- ₵{totalDeductions.toFixed(2)}</span>
                      </div>
                    )}
                    <div className='flex justify-between pt-1.5 border-t border-border font-semibold'>
                      <span>Amount to send</span>
                      <span className='text-red-600 text-base'>₵{amountToSend.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm mb-1.5 block'>Your MoMo Number</Label>
                    <Input
                      type='tel'
                      placeholder='e.g. 0241234567'
                      value={momoNumber}
                      onChange={e => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      inputMode='numeric'
                      maxLength={10}
                      className='h-10'
                    />
                  </div>
                  <Button className='w-full gap-2' onClick={handleSubmit} disabled={!momoNumber || momoNumber.length < 10}>
                    <Smartphone className='w-4 h-4' />
                    Send ₵{amountToSend.toFixed(2)} via MoMo
                    <ArrowRight className='w-4 h-4' />
                  </Button>
                </CardContent>
              </Card>
            )}

            {amountToSend === 0 && (
              <Card className='border-green-200 bg-green-50/50 dark:bg-green-950/10'>
                <CardContent className='flex items-center gap-3 py-6'>
                  <CheckCircle2 className='w-8 h-8 text-green-600 shrink-0' />
                  <div>
                    <p className='font-semibold text-green-800 dark:text-green-300'>All settled!</p>
                    <p className='text-sm text-green-700 dark:text-green-400'>No outstanding cash to send.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Success */}
        {flowStep === 'success' && result && (
          <Card className='border-green-200 bg-green-50/50 dark:bg-green-950/10'>
            <CardContent className='pt-6 space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center'>
                  <CheckCircle2 className='w-6 h-6 text-green-600' />
                </div>
                <div>
                  <p className='font-semibold text-green-800 dark:text-green-300 text-lg'>Payment Confirmed!</p>
                  <p className='text-sm text-green-700 dark:text-green-400'>MoMo payment confirmed.</p>
                </div>
              </div>
              <div className='text-sm bg-white/60 dark:bg-black/20 rounded-lg p-3 space-y-1.5'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Amount sent</span>
                  <span className='font-bold'>₵{result.amount.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>From</span>
                  <span className='font-mono'>{result.momoNumber}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Reference</span>
                  <span className='font-mono text-xs'>{result.reference}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Date</span>
                  <span>{format(new Date(), 'd MMM yyyy, h:mm a')}</span>
                </div>
                {deductions.length > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Deductions</span>
                    <span className='text-orange-600'>- ₵{totalDeductions.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </WashStationLayout>
  )
}