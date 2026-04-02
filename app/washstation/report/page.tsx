'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileText, RefreshCw, Send, Save, CheckCircle2,
  Loader2, Plus, X, ChevronDown, ChevronUp,
} from 'lucide-react';

function today() {
  return new Date().toISOString().split('T')[0];
}

function fmt(n: number) {
  return `GHS ${n.toFixed(2)}`;
}

export default function DailyReportPage() {
  const { stationToken, valid: isSessionValid, branchId: _branchId, branchName } = useStationSession() as any;
  console.log('SESSION:', { stationToken: !!stationToken, isSessionValid, _branchId });
  const branchId = _branchId;

  const autoData = useQuery(
    (api as any).dailyReports.getAutoData,
    branchId ? { branchId, date: today() } : 'skip'
  );
  const existingDraft = useQuery(
    (api as any).dailyReports.getDraft,
    branchId && isSessionValid ? { branchId, date: today() } : 'skip'
  );

  const saveDraftMutation = useMutation((api as any).dailyReports.saveDraft);
  const submitMutation = useMutation((api as any).dailyReports.submit);

  // Form state
  const [attendants, setAttendants] = useState<string[]>(['']);
  const [washerTokens, setWasherTokens] = useState(0);
  const [dryerTokens, setDryerTokens] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);
  const [mobileMoneyAmount, setMobileMoneyAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [paystackAmount, setPaystackAmount] = useState(0);
  const [soapUnits, setSoapUnits] = useState(0);
  const [freeWashCount, setFreeWashCount] = useState(0);
  const [tokenRevenue, setTokenRevenue] = useState(0);
  const [washingPlanCount, setWashingPlanCount] = useState(0);
  const [technicalFaults, setTechnicalFaults] = useState(0);
  const [faultNotes, setFaultNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceBreakdown, setServiceBreakdown] = useState<Array<{ serviceType: string; label: string; count: number; tokensUsed: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from existing draft or auto-data
  useEffect(() => {
    if (loaded) return;
    if (existingDraft && existingDraft.status === 'submitted') { setLoaded(true); return; }
    if (existingDraft) {
      // Manual fields come from draft
      setAttendants(existingDraft.attendantsOnShift?.length ? existingDraft.attendantsOnShift : ['']);
      setSoapUnits(existingDraft.soapUnitsUsed ?? 0);
      setWashingPlanCount(existingDraft.washingPlanCount ?? 0);
      setTechnicalFaults(existingDraft.technicalFaultCount ?? 0);
      setFaultNotes(existingDraft.technicalFaultNotes ?? '');
      setNotes(existingDraft.notes ?? '');
      // Tokens and payments always come from live system data
      if (autoData) {
        setWasherTokens(autoData.washerTokensUsed ?? 0);
        setSoapUnits(autoData.washerTokensUsed ?? 0);
        setDryerTokens(autoData.dryerTokensUsed ?? 0);
        setCashAmount(autoData.cashAmount ?? 0);
        setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);
        setCardAmount(autoData.cardAmount ?? 0);
        setPaystackAmount(autoData.paystackAmount ?? 0);
        setFreeWashCount(autoData.freeWashCount ?? 0);
        setTokenRevenue(autoData.tokenRevenue ?? 0);
        setServiceBreakdown(autoData.serviceBreakdown ?? []);
      }
      setLoaded(true);
    } else if (autoData) {
      setWasherTokens(autoData.washerTokensUsed ?? 0);
      setDryerTokens(autoData.dryerTokensUsed ?? 0);
      setCashAmount(autoData.cashAmount ?? 0);
      setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);
      setCardAmount(autoData.cardAmount ?? 0);
      setPaystackAmount(autoData.paystackAmount ?? 0);
      setFreeWashCount(autoData.freeWashCount ?? 0);
      setServiceBreakdown(autoData.serviceBreakdown ?? []);
      setLoaded(true);
    }
  }, [existingDraft, autoData]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildPayload = () => ({
    branchId,
    date: today(),
    attendantsOnShift: attendants.filter(a => a.trim()),
    washerTokensUsed: washerTokens,
    dryerTokensUsed: dryerTokens,
    serviceBreakdown,
    cashAmount,
    mobileMoneylAmount: mobileMoneyAmount,
    cardAmount,
    paystackAmount,
    soapUnitsUsed: soapUnits,
    freeWashCount,
    washingPlanCount,
    technicalFaultCount: technicalFaults,
    technicalFaultNotes: faultNotes || undefined,
    notes: notes || undefined,
  });

  const handleSaveDraft = async () => {
    if (!branchId) return;
    setIsSaving(true);
    try {
      await saveDraftMutation(buildPayload());
      toast.success('Draft saved!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!branchId) return;
    if (attendants.filter(a => a.trim()).length === 0) {
      toast.error('Add at least one attendant name');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitMutation(buildPayload());
      toast.success('Daily report submitted successfully!');
      // Reset for next day
      setTimeout(() => {
        setWasherTokens(0); setDryerTokens(0);
        setCashAmount(0); setMobileMoneyAmount(0); setCardAmount(0); setPaystackAmount(0);
        setSoapUnits(0); setFreeWashCount(0); setWashingPlanCount(0);
        setTechnicalFaults(0); setFaultNotes(''); setNotes('');
        setServiceBreakdown([]); setAttendants(['']); setLoaded(false);
      }, 2000);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshAuto = () => { setLoaded(false); };

  const totalTokens = washerTokens + dryerTokens;
  const totalRevenue = cashAmount + mobileMoneyAmount + cardAmount + paystackAmount;
  const isSubmitted = existingDraft?.status === 'submitted';

  const numField = (label: string, value: number, setter: (v: number) => void, prefix = '', readonly = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          min={0}
          value={value}
          onChange={e => setter(parseFloat(e.target.value) || 0)}
          disabled={isSubmitted}
          className={`${prefix ? 'pl-12' : ''} text-sm`}
        />
      </div>
    </div>
  );

  return (
    <WashStationLayout title="Daily Report">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Daily Report
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {branchName || 'Branch'} &mdash; {today()}
            </p>
          </div>
          {isSubmitted ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Submitted
            </div>
          ) : (
            <button onClick={handleRefreshAuto} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh from orders
            </button>
          )}
        </div>

        {isSubmitted && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-sm text-success font-medium">
            ? Report for today has been submitted. You can view it in the report history.
          </div>
        )}

        {/* Attendants on shift */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-sm text-foreground">Attendants on Shift</h2>
          {attendants.map((name, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={name}
                onChange={e => {
                  const updated = [...attendants];
                  updated[i] = e.target.value;
                  setAttendants(updated);
                }}
                placeholder={`Attendant ${i + 1} name`}
                disabled={isSubmitted}
                className="text-sm"
              />
              {attendants.length > 1 && !isSubmitted && (
                <button onClick={() => setAttendants(attendants.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {!isSubmitted && (
            <button onClick={() => setAttendants([...attendants, ''])} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add attendant
            </button>
          )}
        </div>

        {/* Tokens */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-sm text-foreground">Machine Tokens Used</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Washer Tokens <span className="text-primary text-xs">(system)</span></label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">{washerTokens}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Dryer Tokens <span className="text-primary text-xs">(system)</span></label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">{dryerTokens}</div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Tokens</span>
            <span className="text-lg font-bold text-foreground">{totalTokens}</span>
          </div>
          {/* Service breakdown toggle */}
          {serviceBreakdown.length > 0 && (
            <div>
              <button onClick={() => setShowBreakdown(!showBreakdown)} className="text-xs text-primary hover:underline flex items-center gap-1">
                {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showBreakdown ? 'Hide' : 'Show'} service breakdown
              </button>
              {showBreakdown && (
                <div className="mt-3 space-y-2">
                  {serviceBreakdown.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 px-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{s.count} orders � {s.tokensUsed} tokens</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment breakdown */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-sm text-foreground">Payment Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            {[['Cash', cashAmount], ['Mobile Money', mobileMoneyAmount], ['Card', cardAmount + paystackAmount]].map(([label, val]) => (
              <div key={label as string} className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">{label as string} <span className="text-primary text-xs">(system)</span></label>
                <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">GHS {(val as number).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <span className="text-lg font-bold text-primary">{fmt(totalRevenue)}</span>
          </div>
        </div>

        {/* Other counts */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-sm text-foreground">Other Counts</h2>
          <div className="grid grid-cols-2 gap-4">
            {numField('Soap Units Used', soapUnits, setSoapUnits)}
            {numField('Free Washes', freeWashCount, setFreeWashCount, '', true)}
            {numField('Washing Plans', washingPlanCount, setWashingPlanCount, '', true)}
            {numField('Technical Faults', technicalFaults, setTechnicalFaults, '', true)}
          </div>
          {technicalFaults > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Fault Notes</label>
              <Textarea
                value={faultNotes}
                onChange={e => setFaultNotes(e.target.value)}
                placeholder="Describe the technical fault(s)..."
                disabled={isSubmitted}
                rows={2}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
          <h2 className="font-semibold text-sm text-foreground mb-3">Summary</h2>
          {[
            ['Date', today()],
            ['Branch', branchName || '-'],
            ['Attendants', attendants.filter(a => a.trim()).join(', ') || '-'],
            ['Washer Tokens', washerTokens],
            ['Dryer Tokens', dryerTokens],
            ['Total Tokens', totalTokens],
            ['Cash', fmt(cashAmount)],
            ['Mobile Money', fmt(mobileMoneyAmount)],
            ['Card', fmt(cardAmount)],
            ['Total Revenue', fmt(totalRevenue)],
            ['Expected Revenue (Tokens)', fmt(tokenRevenue)],
            ['Soap Units', soapUnits],
            ['Free Washes', freeWashCount],
            ['Washing Plans', washingPlanCount],
            ['Technical Faults', technicalFaults],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {!isSubmitted && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">Additional Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes for the day..."
              rows={3}
              className="text-sm"
            />
          </div>
        )}

        {/* Actions */}
        {!isSubmitted && (
          <div className="flex gap-3 pb-6">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isSubmitting} className="flex-1">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving || isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Report
            </Button>
          </div>
        )}
      </div>
    </WashStationLayout>
  );
}
