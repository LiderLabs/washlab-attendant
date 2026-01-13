"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@devlider001/washlab-backend/api"
import { Id } from "@devlider001/washlab-backend/dataModel"
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
 */
export function ActionVerification({
  onVerified,
  onCancel,
  actionType,
  orderId,
  open,
}: ActionVerificationProps) {
  const { stationToken } = useStationSession()
  // @ts-expect-error - verifyAttendantPIN exists but may not be in generated types yet
  const verifyPIN = useMutation(api.attendants.verifyAttendantPIN)

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
      // Verify PIN (includes actionType and orderId for audit trail)
      const pinResult = await verifyPIN({
        attendantId: selectedAttendantId as Id<"attendants">,
        pin,
        actionType,
        orderId,
      })

      if (pinResult.success && pinResult.verificationId) {
        // Use verificationId from PIN verification result
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

  // Get unique attendants from active attendances
  const availableAttendants =
    attendances
      ?.filter((a) => a.attendant !== null)
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
              Please select attendant and verify identity to continue
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
                    description={`Enter your 6-digit PIN to ${actionType}`}
                    error={pinError || undefined}
                  />
                  {isVerifying && (
                    <div className='text-center text-sm text-muted-foreground'>
                      Verifying PIN...
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <p>No active attendants found. Please clock in first.</p>
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
