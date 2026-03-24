'use client'

import { useState } from 'react'
import { useQuery, useAction } from 'convex/react'
import { api } from '@jordan6699/washlab-backend/api'
import { useStationSession } from '@/hooks/useStationSession'
import { useStationAttendance } from '@/hooks/useStationAttendance'
import { WashStationLayout } from '@/components/washstation/WashStationLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Banknote, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Loader2, ArrowRight } from 'lucide-react'

export default function ReconciliationPage() {
  const { stationToken } = useStationSession()
  const { activeAttendance } = useStationAttendance(stationToken)
  const [momoNumber, setMomoNumber] = useState('')
  const [network, setNetwork] = useState('mtn')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [result, setResult] = useState(null)

  const summary = useQuery((api as any).cashReconciliation.getTodayCashSummary, stationToken ? { stationToken } : 'skip')
  const history = useQuery((api as any).cashReconciliation.getReconciliationHistory, stationToken && showHistory ? { stationToken, limit: 10 } : 'skip')
  const initiate = useAction((api as any).cashReconciliation.initiateCashReconciliation)

  const handleSubmit = async () => {
    if (!momoNumber || momoNumber.length < 10) { toast.error('Please enter a valid MoMo number'); return }
    if (!summary || summary.orderCount === 0) { toast.error('No cash orders to reconcile today'); return }
    setLoading(true)
    try {
      const res = await initiate({ stationToken, senderMomoNumber: momoNumber, network, amount: summary.totalCash, attendantId: activeAttendance?.attendant?._id })
      setResult(res)
      toast.success('Payment request sent! Check your phone.')
    } catch (e) {
      toast.error(e.message || 'Failed to initiate reconciliation')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'processing': return <Badge className="bg-yellow-100 text-yellow-700">Processing</Badge>
      case 'failed': return <Badge className="bg-red-100 text-red-700">Failed</Badge>
      default: return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <WashStationLayout title="Cash Reconciliation">
      <div className="max-w-xl mx-auto space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Banknote className="w-5 h-5 text-primary" />
              Today's Cash Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary === undefined ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Cash Orders Today</span>
                  <span className="font-bold text-lg">{summary.orderCount} orders</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Cash Collected</span>
                  <span className="font-bold text-xl text-primary">₵{summary.totalCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Paystack Fee (1.95%)</span>
                  <span className="text-sm text-orange-600">-₵{summary.paystackFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Amount After Fee</span>
                  <span className="font-bold text-green-600">₵{summary.amountAfterFee.toFixed(2)}</span>
                </div>
                {summary.alreadyReconciled && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">Today's cash has already been reconciled!</p>
                  </div>
                )}
                {summary.orderCount === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">No cash orders recorded today.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {summary && !summary.alreadyReconciled && summary.orderCount > 0 && !result && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Send Cash via MoMo</CardTitle>
              <p className="text-xs text-muted-foreground">Enter your MoMo number to send ₵{summary?.totalCash.toFixed(2)} to WashLab</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Your MoMo Number</Label>
                <Input type="tel" placeholder="e.g. 0241234567" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" maxLength={10} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Network</Label>
                <Select value={network} onValueChange={(v) => setNetwork(v)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                    <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">You are sending</span><span className="font-bold">₵{summary?.totalCash.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paystack fee</span><span className="text-orange-600">-₵{summary?.paystackFee.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-1 mt-1"><span className="font-medium">WashLab receives</span><span className="font-bold text-green-600">₵{summary?.amountAfterFee.toFixed(2)}</span></div>
              </div>
              <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading || !momoNumber || momoNumber.length < 10}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Send ₵{summary?.totalCash.toFixed(2)} <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">Payment Request Sent!</p>
                  <p className="text-sm text-green-700 dark:text-green-400">{result.displayText}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Once you approve on your phone, the reconciliation will be confirmed automatically.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Reconciliation History</span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
          {showHistory && (
            <CardContent>
              {history === undefined ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No reconciliations yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((r) => (
                    <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border text-sm">
                      <div>
                        <p className="font-medium">{r.date}</p>
                        <p className="text-xs text-muted-foreground">{r.orderIds?.length || 0} orders · ₵{r.totalCashOrders?.toFixed(2)}</p>
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(r.status)}
                        {r.completedAt && <p className="text-xs text-muted-foreground">{format(new Date(r.completedAt), 'h:mm a')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </WashStationLayout>
  )
}
