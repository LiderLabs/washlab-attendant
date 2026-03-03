'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { useStationSession } from '@/hooks/useStationSession';
import { ActionVerification } from '@/components/washstation/ActionVerification';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, CheckCircle2, Loader2, Plus, X, Save, Wrench } from 'lucide-react';

function today() { return new Date().toISOString().split('T')[0]; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
function fmt(n: number) { return `GHS ${n.toFixed(2)}`; }

export default function DailyReportPage() {
  const { stationToken, sessionData, isSessionValid } = useStationSession() as any;
  const branchId = sessionData?.branchId;
  const branchName = sessionData?.branchName;

  const autoData = useQuery(
    (api as any).dailyReports.getAutoData,
    branchId ? { branchId, date: today(), stationToken: stationToken || undefined } : 'skip'
  );
  // Always sync system data
  useEffect(() => {
    if (!autoData) return;
    setWasherTokens(autoData.washerTokensUsed ?? 0);
    setSoapUnits(autoData.washerTokensUsed ?? 0);
    setDryerTokens(autoData.dryerTokensUsed ?? 0);
    setCashAmount(autoData.cashAmount ?? 0);
    setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);
    setCardAmount(autoData.cardAmount ?? 0);
    setPaystackAmount(autoData.paystackAmount ?? 0);
  }, [autoData]);

  const existingDraft = useQuery(
    (api as any).dailyReports.getDraft,
    branchId ? { branchId, date: today() } : 'skip'
  );
  const clockedInStaff = null;
  // Also try via station token (same as ActionVerification does)
  const activeAttendances = useQuery(
    api.stations.getActiveStationAttendances,
    stationToken ? { stationToken } : 'skip'
  ) as Array<{ _id: any; attendant: { _id: any; name: string } | null }> | undefined;

  const saveDraftMutation = useMutation((api as any).dailyReports.saveDraft);
  const submitMutation = useMutation((api as any).dailyReports.submit);

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
  const [verifyOpen, setVerifyOpen] = useState(false);

  // Derive attendant names from active clocked-in staff
  const attendantNames = activeAttendances
    ?.map(a => a.attendant?.name).filter(Boolean) as string[] ?? 
    clockedInStaff?.map((s: any) => s.name || s.staffName).filter(Boolean) as string[] ?? [];

  useEffect(() => {
    if (existingDraft && existingDraft.status === 'submitted') { setLoaded(true); return; }
    if (existingDraft) {
      // Tokens and payments always from live system
      if (autoData) {
        setWasherTokens(autoData.washerTokensUsed ?? 0);
        setDryerTokens(autoData.dryerTokensUsed ?? 0);
        setCashAmount(autoData.cashAmount ?? 0);
        setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);
        setCardAmount(autoData.cardAmount ?? 0);
        setPaystackAmount(autoData.paystackAmount ?? 0);
      }
      // Manual fields from draft
      setSoapUnits(existingDraft.soapUnitsUsed ?? 0);
      setEndOfDayComment(existingDraft.notes ?? '');
      if (existingDraft.technicalFaultNotes) {
        const lines = existingDraft.technicalFaultNotes.split('\n').filter(Boolean);
        const parsed = lines.map((l: string) => {
          const match = l.match(/^\[(.+?)\]\s*(.+)$/);
          return match ? { machineId: match[1], description: match[2] } : { machineId: '', description: l };
        });
        setFaults(parsed);
      }
      setLoaded(true);
    } else if (autoData) {
      setWasherTokens(autoData.washerTokensUsed ?? 0);
      setDryerTokens(autoData.dryerTokensUsed ?? 0);
      setCashAmount(autoData.cashAmount ?? 0);
      setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);
      setCardAmount(autoData.cardAmount ?? 0);
      setPaystackAmount(autoData.paystackAmount ?? 0);
      // keep this branch
      setLoaded(true);
    }
  }, [existingDraft, autoData, loaded]);

  const handleAddFault = () => {
    if (!machineId.trim() || !faultDescription.trim()) { toast.error('Enter machine ID and fault description'); return; }
    setFaults([...faults, { machineId: machineId.trim(), description: faultDescription.trim() }]);
    setMachineId(''); setFaultDescription('');
    toast.success('Fault added');
  };

  const buildPayload = () => ({
    branchId,
    date: today(),
    attendantsOnShift: attendantNames,
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

  const handleSubmitConfirmed = async () => {
    if (!branchId) return;
    setIsSubmitting(true);
    try {
      await submitMutation(buildPayload());
      toast.success('Daily report submitted!');
      setTimeout(() => {
        setWasherTokens(0); setDryerTokens(0);
        setCashAmount(0); setMobileMoneyAmount(0); setCardAmount(0); setPaystackAmount(0);
        setSoapUnits(0); setFaults([]); setEndOfDayComment('');
        setLoaded(false);
      }, 2000);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRecorded = cashAmount + mobileMoneyAmount + cardAmount + paystackAmount;
  const totalTokenRevenue = autoData?.tokenRevenue ?? totalRecorded;
  const discrepancy = Math.round((totalRecorded - totalTokenRevenue) * 100) / 100;
  // totalRecorded and discrepancy calculated above
  const isSubmitted = existingDraft?.status === 'submitted';

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Daily Report{branchName ? ` – ${branchName}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{fmtDate(today())}</p>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${isSubmitted ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isSubmitted ? 'bg-amber-500' : 'bg-green-500'}`} />
            {isSubmitted ? 'Submitted' : 'Open'}
          </span>
        </div>

        {/* Attendants on Duty (read-only, from clock-in) */}
        {attendantNames.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-foreground mb-3">Attendants on Duty</h2>
            <div className="flex flex-wrap gap-2">
              {attendantNames.map((name, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sales Summary */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Sales Summary</h2>
          </div>

          {/* Token stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Washer Tokens</p>
              {isSubmitted ? (
                <p className="text-2xl font-bold text-foreground">{washerTokens}</p>
              ) : (
                <p className="text-2xl font-bold text-foreground">{washerTokens}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{fmt(washerTokens * 25)}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Dryer Tokens</p>
              {true ? (
                <p className="text-2xl font-bold text-foreground">{dryerTokens}</p>
              ) : (
                <input type="number" min={0} value={dryerTokens}
                  onChange={e => setDryerTokens(parseInt(e.target.value) || 0)}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-foreground w-full p-0" />
              )}
              <p className="text-xs text-muted-foreground mt-1">{fmt(dryerTokens * 25)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl mb-5">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Expected Revenue</span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{fmt(totalTokenRevenue)}</span>
          </div>

          {/* Payment Breakdown */}
          <h3 className="font-semibold text-sm text-foreground mb-3">Payment Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Mobile Money', value: mobileMoneyAmount, setter: setMobileMoneyAmount, color: 'border-l-blue-500' },
              { label: 'Card Payment', value: cardAmount + paystackAmount, setter: setCardAmount, color: 'border-l-violet-500' },
              { label: 'Cash Payment', value: cashAmount, setter: setCashAmount, color: 'border-l-green-500' },
            ].map(({ label, value, setter, color }) => (
              <div key={label} className={`border-l-4 ${color} pl-3 py-1 flex items-center justify-between`}>
                <p className="text-sm text-muted-foreground">{label}</p>
                {true ? (
                  <p className="text-lg font-bold text-foreground">{fmt(value)}</p>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">GHS</span>
                    <input type="number" min={0} value={value}
                      onChange={e => setter(parseFloat(e.target.value) || 0)}
                      className="w-28 text-lg font-bold bg-transparent border-none outline-none text-foreground p-0 text-right" />
                  </div>
                )}
              </div>
            ))}
            </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="font-semibold text-foreground">Total Collected</span>
            <span className="text-xl font-bold text-foreground">{fmt(totalRecorded)}</span>
          </div>
        </div>

        {/* Manual Entries */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Manual Entries</h2>

          {/* Soap Used */}
          <div>
            <label className="text-sm text-muted-foreground font-medium block mb-1.5">Soap Used</label>
            <div className="relative">
              <Input type="number" min={0} value={soapUnits}
                onChange={e => setSoapUnits(parseFloat(e.target.value) || 0)}
                disabled={isSubmitted} className="pr-14" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Units</span>
            </div>
          </div>

          {/* Technical Faults */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Technical Faults</h3>
            {!isSubmitted && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1">Machine ID</label>
                  <Input value={machineId} onChange={e => setMachineId(e.target.value)} placeholder="e.g. ADX1234" className="text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1">Fault Description</label>
                  <Textarea value={faultDescription} onChange={e => setFaultDescription(e.target.value)}
                    placeholder="Describe the issue..." rows={3} className="text-sm resize-none" />
                </div>
                <Button onClick={handleAddFault} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Add Fault
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
            <Textarea value={endOfDayComment} onChange={e => setEndOfDayComment(e.target.value)}
              placeholder="Any additional notes for the manager..." rows={3}
              disabled={isSubmitted} className="text-sm resize-none" />
          </div>
        </div>

        {/* Actions */}
        {!isSubmitted && (
          <div className="flex gap-3 pb-6">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isSubmitting} className="flex-1">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={() => setVerifyOpen(true)} disabled={isSaving || isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Close & Submit Day
            </Button>
          </div>
        )}

        {isSubmitted && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5" />
            Report submitted successfully.
          </div>
        )}

        {/* Verification before submit */}
        {verifyOpen && (
          <ActionVerification
            open={verifyOpen}
            onVerified={async () => {
              setVerifyOpen(false);
              await handleSubmitConfirmed();
            }}
            onCancel={() => setVerifyOpen(false)}
            actionType="Close & Submit Daily Report"
          />
        )}
      </div>
    </>
  );
}