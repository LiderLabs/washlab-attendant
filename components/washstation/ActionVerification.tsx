"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@jordan6699/washlab-backend/api"
import { Id } from "@jordan6699/washlab-backend/dataModel"
import { PINInput } from "./PINInput"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useStationSession } from "@/hooks/useStationSession"
import { cacheRead, cacheWrite, CK } from "@/hooks/useOfflineCache"
import { toast } from "sonner"

interface ActionVerificationProps {
  onVerified: (
    attendantId: Id<"attendants">,
    verificationId: Id<"biometricVerifications">
  ) => void
  onCancel: () => void
  actionType: string
  orderId?: Id<"orders">
  open: boolean
}

/**
 * Component for verifying identity before performing critical actions
 * Shows attendant selector and biometric verification
 * Works offline: uses cached attendances and skips Convex PIN verify
 */
export function ActionVerification({
  onVerified,
  onCancel,
  actionType,
  orderId,
  open,
}: ActionVerificationProps) {
  const { stationToken, sessionData } = useStationSession()
  const branchId = (sessionData as any)?.branchId as string | undefined
  const verifyPIN = useMutation(api.attendants.verifyAttendantPIN)

  // Reactive offline state — correct from first render, not just after a tick
  const [isOffline, setIsOffline] = useState(
    typeof window !== "undefined" ? !navigator.onLine : false
  )
  useEffect(() => {
    const goOnline  = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener("online",  goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online",  goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  // Get active attendances to select from
  const attendances = useQuery(
    api.stations.getActiveStationAttendances,
    stationToken ? { stationToken } : "skip"
  ) as
    | Array<{
        _id: Id<"attendanceLogs">
        clockInAt: number
        attendant: {
          _id: Id<"attendants">
          name: string
          email: string
        } | null
      }>
    | undefined

  // Write to cache when online; read from cache when offline
  useEffect(() => {
    if (!branchId || isOffline || !attendances) return
    cacheWrite(CK.attendances(branchId), attendances)
  }, [attendances, branchId, isOffline])

  const cachedEntry = !isOffline || !branchId
    ? null
    : cacheRead<typeof attendances>(CK.attendances(branchId))

  const effectiveAttendances = attendances ?? cachedEntry?.data ?? []

  const [selectedAttendantId, setSelectedAttendantId] = useState<
    Id<"attendants"> | ""
  >("")
  const [showPINInput, setShowPINInput] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleStartVerification = async () => {
    if (!selectedAttendantId) return
    setShowPINInput(true)
    setPinError(null)
  }

  const handlePINComplete = async (pin: string) => {
    if (!selectedAttendantId) return

    setIsVerifying(true)
    setPinError(null)

    try {
      if (isOffline) {
        // Offline: skip Convex, produce a local stub verification ID.
        // The order action hook will queue the mutation to IndexedDB as normal.
        const offlineVerificationId =
          `offline-verify-${Date.now()}` as Id<"biometricVerifications">
        onVerified(
          selectedAttendantId as Id<"attendants">,
          offlineVerificationId
        )
        setShowPINInput(false)
        setSelectedAttendantId("")
        setPinError(null)
        toast.info("Verified offline — action will sync when reconnected")
        return
      }

      // Online: verify PIN via Convex (includes actionType + orderId for audit trail)
      const pinResult = await verifyPIN({
        attendantId: selectedAttendantId as Id<"attendants">,
        pin,
        actionType,
        orderId,
      })

      if (pinResult.success && pinResult.verificationId) {
        onVerified(
          selectedAttendantId as Id<"attendants">,
          pinResult.verificationId
        )
        setShowPINInput(false)
        setSelectedAttendantId("")
        setPinError(null)
      } else {
        throw new Error("PIN verification failed - no verification ID returned")
      }
    } catch (err: unknown) {
      const error = err as Error
      setPinError(error.message || "Invalid PIN")
      toast.error(error.message || "PIN verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  if (!open) return null

  // Get unique attendants from active attendances (live or cached)
  const availableAttendants =
    (effectiveAttendances ?? [])
      .filter((a) => a.attendant !== null)
      .map((a) => a.attendant!)
      .filter(
        (attendant, index, self) =>
          index === self.findIndex((a) => a._id === attendant._id)
      ) || []

  return (
    <>
      <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
        <div className='bg-background rounded-lg p-6 max-w-md w-full space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>Verify Identity</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              {isOffline
                ? "Offline — using cached attendants"
                : "Please select attendant and verify identity to continue"}
            </p>
          </div>

          {availableAttendants.length > 0 ? (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Select Attendant</Label>
                <Select
                  value={selectedAttendantId}
                  onValueChange={(v) =>
                    setSelectedAttendantId(v as Id<"attendants">)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select attendant' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAttendants.map((attendant) => (
                      <SelectItem key={attendant._id} value={attendant._id}>
                        {attendant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!showPINInput ? (
                <div className='flex gap-2'>
                  <Button
                    onClick={handleStartVerification}
                    disabled={!selectedAttendantId}
                    className='flex-1'
                  >
                    Continue
                  </Button>
                  <Button variant='outline' onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className='space-y-4'>
                  <PINInput
                    onComplete={handlePINComplete}
                    onCancel={() => {
                      setShowPINInput(false)
                      setPinError(null)
                    }}
                    title='Enter PIN'
                    description={
                      isOffline
                        ? `Enter your PIN to ${actionType} (offline — will sync later)`
                        : `Enter your 4-digit PIN to ${actionType}`
                    }
                    error={pinError || undefined}
                  />
                  {isVerifying && (
                    <div className='text-center text-sm text-muted-foreground'>
                      {isOffline ? "Queuing action..." : "Verifying PIN..."}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <p>
                {isOffline
                  ? "No cached attendants found. Open this page while online first so it can be cached."
                  : "No active attendants found. Please clock in first."}
              </p>
              <Button variant='outline' onClick={onCancel} className='mt-4'>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
