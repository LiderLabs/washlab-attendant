'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { WashStationLayout } from '@/components/washstation/WashStationLayout';
import { useStationSession } from '@/hooks/useStationSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Lock, AlertTriangle, CheckCircle2, Loader2,
  Plus, X, Send, Save, RefreshCw, Wrench,
} from 'lucide-react';

function today() {
  return new Date().toISOString().split('T')[0];
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmt(n: number) {
  return `GHS ${n.toFixed(2)}`;
}

export default function DailyReportPage() {
  const { stationToken, isSessionValid, branchId, branchName } = useStationSession() as any;

  const autoData = useQuery(
    (api as any).dailyReports.getAutoData,
    branchId && isSessionValid ? { branchId, date: today() } : 'skip'
  );
  const existingDraft = useQuery(
    (api as any).dailyReports.getDraft,
    branchId && isSessionValid ? { branchId, date: today() } : 'skip'
  );
  // Get clocked-in staff for this branch
  const clockedInStaff = useQuery(
    (api as any).attendance?.getClockedIn ?? 'skip',
    branchId && isSessionValid ? { branchId } : 'skip'
  );

  const saveDraftMutation = useMutation((api as any).dailyReports.saveDraft);
  const submitMutation = useMutation((api as any).dailyReports.submit);

  const [attendants, setAttendants] = useState<string[]>(['']);
  const [washerTokens, setWasherTokens] = useState(0);
  const [dryerTokens, setDryerTokens] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);
  const [mobileMoneyAmount, setMobileMoneyAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [paystackAmount, setPaystackAmount] = useState(0);
  const [soapUnits, setSoapUnits] = useState(0);
  const [machineId, setMachineId] = useState('');
  const [faultDescription, setFaultDescription] = useState('');
  const [faults, setFaults] = useState<Array<{ machineId: string; description: string }>>([]);
  const [endOfDayComment, setEndOfDayComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    if (existingDraft && existingDraft.status === 'submitted') { setLoaded(true); return; }
    if (existingDraft) {
      setAttendants(existingDraft.attendantsOnShift?.length ? existingDraft.attendantsOnShift : ['']);
      setWasherTokens(existingDraft.washerTokensUsed ?? 0);
      setDryerTokens(existingDraft.dryerTokensUsed ?? 0);
      setCashAmount(existingDraft.cashAmount ?? 0);
      setMobileMoneyAmount(existingDraft.mobileMoneylAmount ?? 0);
      setCardAmount(existingDraft.cardAmount ?? 0);
      setPaystackAmount(existingDraft.paystackAmount ?? 0);
      setSoapUnits(existingDraft.soapUnitsUsed ?? 0);
      setEndOfDayComment(existingDraft.notes ?? '');
      setLoaded(true);
    } else if (autoData) {
      setWasherTokens(autoData.washerTokensUsed ?? 0);
      setDryerTokens(autoData.dryerTokensUsed ?? 0);
      setCashAmount(autoData.cashAmount ?? 0);
      setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);
      setCardAmount(autoData.cardAmount ?? 0);
      setPaystackAmount(autoData.paystackAmount ?? 0);
      // Pre-fill attendants from clocked-in staff
      if (clockedInStaff?.length > 0) {
        setAttendants(clockedInStaff.map((s: any) => s.name || s.staffName || '').filter(Boolean));
      }
      setLoaded(true);
    }
  }, [existingDraft, autoData, clockedInStaff, loaded]);

  const handleAddFault = () => {
    if (!machineId.trim() || !faultDescription.trim()) {
      toast.error('Enter machine ID and fault description');
      return;
    }
    setFaults([...faults, { machineId: machineId.trim(), description: faultDescription.trim() }]);
    setMachineId('');
    setFaultDescription('');
    toast.success('Fault added');
  };

  const buildPayload = () => ({
    branchId,
    date: today(),
    attendantsOnShift: attendants.filter(a => a.trim()),
    washerTokensUsed: washerTokens,
    dryerTokensUsed: dryerTokens,
    serviceBreakdown: autoData?.serviceBreakdown ?? [],
    cashAmount,
    mobileMoneylAmount: mobileMoneyAmount,
    cardAmount,
    paystackAmount,
    soapUnitsUsed: soapUnits,
    freeWashCount: autoData?.freeWashCount ?? 0,
    washingPlanCount: 0,
    technicalFaultCount: faults.length,
    technicalFaultNotes: faults.map(f => `[${f.machineId}] ${f.description}`).join('\n') || undefined,
    notes: endOfDayComment || undefined,
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
      toast.success('Daily report submitted!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalTokens = washerTokens + dryerTokens;
  const totalValue = (washerTokens * 25) + (dryerTokens * 25); // adjust price per token as needed
  const totalRevenue = cashAmount + mobileMoneyAmount + cardAmount + paystackAmount;
  const isSubmitted = existingDraft?.status === 'submitted';

  return (
    <WashStationLayout title="Daily Report">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Daily Report{branchName ? `- ${branchName}` : ''}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {fmtDate(today())}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSubmitted ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Submitted
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Open
              </span>
            )}
          </div>
        </div>

        {/* Sales Summary */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Sales Summary</h2>
          </div>

          {/* Token stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Washer Tokens</p>
              <p className="text-2xl font-bold text-foreground">{washerTokens}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Dryer Tokens</p>
              <p className="text-2xl font-bold text-foreground">{dryerTokens}</p>
            </div>
            <div className="text-center bg-muted/60 rounded-xl p-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Tokens</p>
              <p className="text-2xl font-bold text-foreground">{totalTokens}</p>
            </div>
            <div className="text-center bg-blue-50 dark:bg-blue-950/30 rounded-xl p-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Total Value</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(totalRevenue)}</p>
            </div>
          </div>

          {/* Payment Breakdown */}
          <h3 className="font-semibold text-sm text-foreground mb-3">Payment Breakdown</h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Mobile Money', value: mobileMoneyAmount, setter: setMobileMoneyAmount, color: 'blue' },
              { label: 'Card Payment', value: cardAmount, setter: setCardAmount, color: 'blue' },
              { label: 'Cash Payment', value: cashAmount, setter: setCashAmount, color: 'green' },
            ].map(({ label, value, setter, color }) => (
              <div key={label} className={`border-l-4 ${color === 'green' ? 'border-l-green-500' : 'border-l-blue-500'} pl-3 py-1`}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                {isSubmitted ? (
                  <p className="text-xl font-bold text-foreground">{fmt(value)}</p>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">GHS</span>
                    <input
                      type="number"
                      min={0}
                      value={value}
                      onChange={e => setter(parseFloat(e.target.value) || 0)}
                      className="w-full text-xl font-bold bg-transparent border-none outline-none text-foreground p-0"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {paystackAmount > 0 && (
            <div className="mt-3 border-l-4 border-l-purple-500 pl-3 py-1">
              <p className="text-xs text-muted-foreground mb-1">Paystack</p>
              <p className="text-xl font-bold text-foreground">{fmt(paystackAmount)}</p>
            </div>
          )}
        </div>

        {/* Attendants on Shift */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-3">Attendants on Shift</h2>
          <div className="space-y-2">
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
                  <button onClick={() => setAttendants(attendants.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {!isSubmitted && (
              <button onClick={() => setAttendants([...attendants, ''])}
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                <Plus className="w-3 h-3" /> Add attendant
              </button>
            )}
          </div>
        </div>

        {/* Manual Entries */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <h2 className="font-semibold text-foreground">Manual Entries</h2>
          </div>

          {/* Soap Used */}
          <div>
            <label className="text-sm text-muted-foreground font-medium block mb-1.5">Soap Used</label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                value={soapUnits}
                onChange={e => setSoapUnits(parseFloat(e.target.value) || 0)}
                disabled={isSubmitted}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Units</span>
            </div>
          </div>

          {/* Technical Faults */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Any Technical Fault Today?</h3>
            {!isSubmitted && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1">Machine ID</label>
                  <Input
                    value={machineId}
                    onChange={e => setMachineId(e.target.value)}
                    placeholder="e.g. ADX1234"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1">Fault Description</label>
                  <Textarea
                    value={faultDescription}
                    onChange={e => setFaultDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <Button onClick={handleAddFault} className="w-full sm:w-auto" size="sm">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Technical Fault
                </Button>
              </div>
            )}

            {faults.length > 0 && (
              <div className="mt-3 space-y-2">
                {faults.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <Wrench className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-destructive">{f.machineId}</p>
                      <p className="text-sm text-foreground">{f.description}</p>
                    </div>
                    {!isSubmitted && (
                      <button onClick={() => setFaults(faults.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* End of Day Comment */}
          <div>
            <label className="text-sm text-muted-foreground font-medium block mb-1.5">End of Day Comment</label>
            <Textarea
              value={endOfDayComment}
              onChange={e => setEndOfDayComment(e.target.value)}
              placeholder="Any additional notes for the manager..."
              rows={3}
              disabled={isSubmitted}
              className="text-sm resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        {!isSubmitted && (
          <div className="flex gap-3 pb-6">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isSubmitting} className="flex-1">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving || isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Close & Submit Day
            </Button>
          </div>
        )}

        {isSubmitted && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5" />
            Report submitted successfully. View in report history.
          </div>
        )}
      </div>
    </WashStationLayout>
  );
}