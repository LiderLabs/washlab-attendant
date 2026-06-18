"use client"

import { useState, useEffect } from "react"
import { useStationAttendance } from "@/hooks/useStationAttendance"
import { useStationSession } from "@/hooks/useStationSession"
import { cacheWrite, cacheRead, CK } from "@/hooks/useOfflineCache"
import { useStationClockIn } from "@/hooks/useStationClockIn"
import { useStationClockOut } from "@/hooks/useStationClockOut"
import { useQuery } from "convex/react"
import { api } from "@jordan6699/washlab-backend/api"
import { Id } from "@jordan6699/washlab-backend/dataModel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  LogIn,
  LogOut,
  User,
  Timer,
  Search,
  Loader2,
  WifiOff,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { LoadingSpinner } from "./LoadingSpinner"
import { PINInput } from "./PINInput"
import { QRClockIn } from "./QRClockIn"
import { useStationPINClockIn } from "@/hooks/useStationPINClockIn"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export function ClockInOut() {
  const { stationToken, sessionData: stationSessionData } = useStationSession()
  const earlyBranchId = (stationSessionData as any)?.branchId as string | undefined
  const { clockInWithPIN, clockOutWithPIN, isLoading: pinLoading } = useStationPINClockIn(stationToken)
  const { attendances, isLoading: attendancesLoading } =
    useStationAttendance(stationToken, earlyBranchId)
  const { isLoading: clockInLoading } = useStationClockIn(stationToken)
  const { isLoading: clockOutLoading } = useStationClockOut(stationToken)

  // Reactive online state
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )
  useEffect(() => {
    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  const isOffline = !isOnline

  // Get attendants for selection
  const liveAttendants = useQuery(
    api.stations.getBranchAttendants,
    stationToken ? { stationToken } : "skip"
  ) as
    | Array<{
        _id: Id<"attendants">
        name: string
        email: string
        hasBiometric: boolean
        hasPin: boolean
        authenticationMethods: string[]
      }>
    | undefined

  // Cache attendants whenever live data arrives
  useEffect(() => {
    if (earlyBranchId && liveAttendants) {
      cacheWrite(CK.attendants(earlyBranchId), liveAttendants)
    }
  }, [liveAttendants, earlyBranchId])

  // Always fall back to cache if live data not available
  const cachedAttendantsEntry = earlyBranchId
    ? cacheRead<typeof liveAttendants>(CK.attendants(earlyBranchId))
    : null
  const effectiveAttendants = liveAttendants ?? cachedAttendantsEntry?.data ?? []

  // Effective attendances — use cached when live not available
  const cachedAttendancesEntry = earlyBranchId
    ? cacheRead<typeof attendances>(CK.attendances(earlyBranchId))
    : null
  const effectiveAttendances = attendances ?? cachedAttendancesEntry?.data ?? []

  const [selectedAttendantId, setSelectedAttendantId] = useState<Id<"attendants"> | "">("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showPINClockInModal, setShowPINClockInModal] = useState(false)
  const [showPINClockOutModal, setShowPINClockOutModal] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<Id<"attendanceLogs"> | null>(null)
  const [showClockInForm, setShowClockInForm] = useState(false)
  const [showQRMode, setShowQRMode] = useState(false)
  const [showReportWarning, setShowReportWarning] = useState(false)
  const [pendingClockOutId, setPendingClockOutId] = useState<any>(null)
  const router = useRouter()
  const sessionData = (useStationSession() as any).sessionData
  const branchId = sessionData?.branchId

  function todayStr() { return new Date().toISOString().split("T")[0] }

  const todayReport = (useQuery as any)(
    (api as any).dailyReports?.getDraft,
    branchId ? { branchId, date: todayStr() } : "skip"
  )
  const reportSubmitted = todayReport?.status === "submitted" || todayReport?.status === "submitted_with_outstanding"

  const filteredAttendants = effectiveAttendants?.filter(
    (att) =>
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartClockIn = async () => {
    if (!selectedAttendantId) return
    setShowPINClockInModal(true)
  }

  const handlePINClockInComplete = async (pin: string) => {
    if (!selectedAttendantId) return
    setPinError(null)
    const success = await clockInWithPIN(selectedAttendantId as Id<"attendants">, pin)
    if (success) {
      setShowPINClockInModal(false)
      setSelectedAttendantId("")
      setSearchQuery("")
      setShowClockInForm(false)
    } else {
      setPinError("Invalid PIN. Please try again.")
    }
  }

  const handleStartClockOut = async (attendanceId: Id<"attendanceLogs">) => {
    setSelectedAttendanceId(attendanceId)
    const activeCount = effectiveAttendances?.length ?? 0
    const isLastAttendant = activeCount <= 1
    if (isLastAttendant && !reportSubmitted && !isOffline) {
      setPendingClockOutId(attendanceId)
      setShowReportWarning(true)
      return
    }
    setShowPINClockOutModal(true)
  }

  const handleProceedClockOut = () => {
    setShowReportWarning(false)
    setShowPINClockOutModal(true)
  }

  const handleGoToReport = () => {
    setShowReportWarning(false)
    router.push("/washstation/reports")
  }

  const handlePINClockOutComplete = async (pin: string) => {
    if (!selectedAttendanceId) return
    setPinError(null)
    const success = await clockOutWithPIN(selectedAttendanceId, pin)
    if (success) {
      setShowPINClockOutModal(false)
      setSelectedAttendanceId(null)
    } else {
      setPinError("Invalid PIN. Please try again.")
    }
  }

  if (attendancesLoading && !isOffline && !cachedAttendancesEntry) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <LoadingSpinner text='Loading attendance status...' />
        </CardContent>
      </Card>
    )
  }

  if (showQRMode) {
    return (
      <QRClockIn
        onComplete={() => { setShowQRMode(false); setShowClockInForm(false) }}
        onCancel={() => setShowQRMode(false)}
      />
    )
  }

  // ── CLOCKED-IN VIEW ──────────────────────────────────────────────────────────
  if (!showClockInForm && effectiveAttendances && effectiveAttendances.length > 0) {
    return (
      <>
        <Card className='border-green-500'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-green-500' />
                  Clocked In
                  {isOffline && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <WifiOff className="w-3 h-3" /> Offline
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className='mt-1'>
                  {effectiveAttendances.length === 1
                    ? `${effectiveAttendances[0].attendant?.name} is clocked in`
                    : `${effectiveAttendances.length} attendants are clocked in`}
                </CardDescription>
              </div>
              <Badge variant='default' className='bg-green-500'>
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {effectiveAttendances.map((attendance) => {
              const timeAgo = formatDistanceToNow(
                new Date(attendance.clockInAt),
                { addSuffix: false }
              )
              return (
                <div key={attendance._id} className='p-4 border rounded-lg space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <User className='w-4 h-4 text-muted-foreground' />
                        <span className='font-medium'>
                          {attendance.attendant?.name || "Unknown"}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Timer className='w-4 h-4' />
                        <span>Clocked in {timeAgo} ago</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartClockOut(attendance._id)}
                      disabled={clockOutLoading || pinLoading}
                      variant='destructive'
                      size='sm'
                    >
                      <LogOut className='w-4 h-4 mr-2' />
                      {isOffline ? 'Clock Out (offline)' : 'Clock Out'}
                    </Button>
                  </div>
                </div>
              )
            })}

            <div className='pt-4 border-t'>
              <Button
                onClick={() => {
                  setShowClockInForm(true)
                  setSelectedAttendantId("")
                  setSearchQuery("")
                }}
                variant='outline'
                className='w-full'
              >
                <LogIn className='w-4 h-4 mr-2' />
                Clock In Another Attendant
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PIN Clock Out Modal */}
        <Dialog open={showPINClockOutModal} onOpenChange={setShowPINClockOutModal}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Clock Out{isOffline ? ' (Offline)' : ''}</DialogTitle>
            </DialogHeader>
            <PINInput
              onComplete={handlePINClockOutComplete}
              onCancel={() => { setShowPINClockOutModal(false); setPinError(null) }}
              title="Enter your PIN"
              description={isOffline
                ? "Enter your PIN — clock-out will sync when back online"
                : "Enter your 4-digit PIN to clock out"}
              error={pinError || undefined}
            />
          </DialogContent>
        </Dialog>

        {/* Report Warning Dialog */}
        <Dialog open={showReportWarning} onOpenChange={setShowReportWarning}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Daily Report Not Submitted</DialogTitle>
              <DialogDescription>
                You are the last attendant clocking out and the daily report has not been submitted yet. Would you like to submit it before clocking out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button onClick={handleGoToReport} className="w-full">Go to Report</Button>
              <Button variant="outline" onClick={handleProceedClockOut} className="w-full">Clock Out Anyway</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // ── CLOCK-IN FORM ────────────────────────────────────────────────────────────
  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <LogIn className='w-5 h-5' />
                Clock In
                {isOffline && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isOffline
                  ? "Offline — clock-in will sync when connection returns"
                  : "Please select an attendant and verify identity to clock in"}
              </CardDescription>
            </div>
            {effectiveAttendances && effectiveAttendances.length > 0 && (
              <Button
                onClick={() => setShowClockInForm(false)}
                variant='ghost'
                size='sm'
              >
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {effectiveAttendants && effectiveAttendants.length > 0 ? (
            <>
              <div className='space-y-2'>
                <Label>Select Attendant</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by name or email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9'
                  />
                </div>
                <Select
                  value={selectedAttendantId}
                  onValueChange={(v) => setSelectedAttendantId(v as Id<"attendants">)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select attendant' />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAttendants && filteredAttendants.length > 0 ? (
                      filteredAttendants.map((attendant) => (
                        <SelectItem key={attendant._id} value={attendant._id}>
                          <div className='flex items-center justify-between w-full'>
                            <span>{attendant.name}</span>
                            {attendant.hasBiometric && (
                              <Badge variant='outline' className='ml-2'>
                                Biometric
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className='p-2 text-sm text-muted-foreground'>
                        No attendants found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStartClockIn}
                disabled={!selectedAttendantId || clockInLoading || pinLoading}
                className='w-full'
                size='lg'
              >
                {clockInLoading || pinLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <LogIn className='w-4 h-4 mr-2' />
                    {isOffline ? 'Clock In (offline)' : 'Clock In'}
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              {isOffline
                ? <p>No cached attendants — open this page while online first to enable offline clock-in</p>
                : <p>No attendants available for this branch</p>
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* PIN Clock In Modal */}
      <Dialog open={showPINClockInModal} onOpenChange={setShowPINClockInModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Clock In{isOffline ? ' (Offline)' : ''}</DialogTitle>
          </DialogHeader>
          <PINInput
            onComplete={handlePINClockInComplete}
            onCancel={() => { setShowPINClockInModal(false); setPinError(null) }}
            title="Enter your PIN"
            description={isOffline
              ? "Enter your PIN — clock-in will sync when back online"
              : "Enter your 4-digit PIN to clock in"}
            error={pinError || undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
