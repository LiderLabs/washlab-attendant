"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@devlider001/washlab-backend/api"
import { Id } from "@devlider001/washlab-backend/dataModel"
import BiometricCapture from "./BiometricCapture"
import { PINInput } from "@/components/washstation/PINInput"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Fingerprint,
  ArrowRight,
  Lock,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface EnrollmentFlowProps {
  token: string
  attendant: {
    id: Id<"attendants">
    name: string
    email: string
    branchId: Id<"branches">
    branchName: string
  }
  expiresAt: number
  onSuccess: () => void
}

type EnrollmentStep =
  | "method-selection"
  | "capturing"
  | "completing"
  | "pin-setup"
  | "pin-completing"
  | "success"
  | "error"

export function EnrollmentFlow({
  token,
  attendant,
  expiresAt,
  onSuccess,
}: EnrollmentFlowProps) {
  const [step, setStep] = useState<EnrollmentStep>("method-selection")
  const [challenge, setChallenge] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startEnrollment = useMutation(api.attendants.startBiometricEnrollment)
  const completeEnrollment = useMutation(
    api.attendants.completeBiometricEnrollment
  )
  const completePINSetup = useMutation(api.attendants.completePINSetup)

  const handleStartEnrollment = async () => {
    setError(null)
    setStep("capturing")

    try {
      const result = await startEnrollment({
        enrollmentToken: token,
        method: "face",
      })
      setChallenge(result.challenge)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || "Failed to start enrollment")
      setStep("error")
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to start biometric enrollment",
        variant: "destructive",
      })
    }
  }

  const handleCaptureComplete = async (biometricData: {
    captureType: "face" | "hand"
    angles: string[]
    features: string
    measurements: string
    livenessData: string
    captureQuality: number
    deviceInfo?: string
  }) => {
    if (!challenge) {
      setError("Missing challenge")
      setStep("error")
      return
    }

    setStep("completing")

    try {
      const result = await completeEnrollment({
        enrollmentToken: token,
        challenge,
        biometricData: {
          ...biometricData,
          captureType: "face", // Only face recognition is supported
        },
      })

      if (result.success) {
        // Check if PIN setup is required
        if (result.requiresPIN) {
          setStep("pin-setup")
          toast({
            title: "Biometric Enrollment Complete",
            description: "Now set up your 6-digit PIN to complete enrollment.",
          })
        } else {
          setStep("success")
          toast({
            title: "Enrollment Successful",
            description: "Your enrollment has been completed successfully.",
          })
          setTimeout(() => {
            onSuccess()
          }, 2000)
        }
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || "Failed to complete enrollment")
      setStep("error")
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to complete biometric enrollment",
        variant: "destructive",
      })
    }
  }

  const handlePINComplete = async (pin: string) => {
    setStep("pin-completing")
    setError(null)

    try {
      const result = await completePINSetup({
        enrollmentToken: token,
        pin,
      })

      if (result.success) {
        setStep("success")
        toast({
          title: "Enrollment Successful",
          description: "Your enrollment has been completed successfully.",
        })
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || "Failed to set up PIN")
      setStep("pin-setup")
      toast({
        title: "PIN Setup Failed",
        description: error.message || "Failed to set up PIN",
        variant: "destructive",
      })
    }
  }

  if (step === "success") {
    return (
      <Card className='p-8 text-center space-y-4'>
        <CheckCircle2 className='h-16 w-16 mx-auto text-green-500' />
        <h3 className='text-2xl font-bold'>Enrollment Complete!</h3>
        <p className='text-muted-foreground'>
          Your biometric profile and PIN have been successfully set up.
        </p>
        <p className='text-sm text-muted-foreground'>Redirecting to login...</p>
      </Card>
    )
  }

  if (step === "error") {
    return (
      <Card className='p-8 space-y-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {error || "An error occurred during enrollment"}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            setStep("method-selection")
            setError(null)
            setChallenge(null)
          }}
          className='w-full'
        >
          Try Again
        </Button>
      </Card>
    )
  }

  if (step === "method-selection") {
    return (
      <div className='space-y-6'>
        <div className='text-center space-y-2'>
          <h3 className='text-xl font-semibold'>Biometric Enrollment</h3>
          <p className='text-sm text-muted-foreground'>
            Complete your face recognition setup to secure your account
          </p>
        </div>

        <Card className='p-6 border-primary/20 bg-primary/5'>
          <div className='space-y-4 text-center'>
            <div className='flex items-center justify-center gap-2'>
              <div className='p-3 rounded-lg bg-primary/10'>
                <Fingerprint className='h-8 w-8 text-primary' />
              </div>
              <Badge
                variant='default'
                className='bg-green-500 hover:bg-green-600'
              >
                Required
              </Badge>
            </div>
            <div className='space-y-2'>
              <h4 className='font-semibold text-lg'>Face Recognition</h4>
              <p className='text-sm text-muted-foreground'>
                Use your face with head movements (left, right, up, down) for
                verification. This method provides the best security and user
                experience.
              </p>
            </div>
            <div className='space-y-2'>
              <div className='flex flex-wrap justify-center gap-2 text-xs text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <CheckCircle2 className='h-3 w-3 text-green-500' />
                  Secure
                </span>
                <span className='flex items-center gap-1'>
                  <CheckCircle2 className='h-3 w-3 text-green-500' />
                  Fast
                </span>
                <span className='flex items-center gap-1'>
                  <CheckCircle2 className='h-3 w-3 text-green-500' />
                  Accurate
                </span>
              </div>
              <Button
                className='w-full'
                variant='default'
                onClick={handleStartEnrollment}
              >
                Start Face Recognition Setup
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </div>
        </Card>

        <div className='text-xs text-muted-foreground text-center space-y-1'>
          <p>Your biometric data will be encrypted and stored securely.</p>
          <p>This process takes about 1-2 minutes.</p>
        </div>
      </div>
    )
  }

  if (step === "completing") {
    return (
      <Card className='p-8 text-center space-y-4'>
        <Loader2 className='h-12 w-12 mx-auto animate-spin text-primary' />
        <h3 className='text-xl font-semibold'>Completing Enrollment</h3>
        <p className='text-muted-foreground'>
          Processing your biometric data...
        </p>
      </Card>
    )
  }

  if (step === "pin-setup") {
    return (
      <Card className='p-6 space-y-6'>
        <div className='text-center space-y-2'>
          <div className='flex items-center justify-center gap-2'>
            <div className='p-3 rounded-lg bg-primary/10'>
              <Lock className='h-8 w-8 text-primary' />
            </div>
            <Badge
              variant='default'
              className='bg-green-500 hover:bg-green-600'
            >
              Required
            </Badge>
          </div>
          <h3 className='text-xl font-semibold'>Set Up Your PIN</h3>
          <p className='text-sm text-muted-foreground'>
            Create a 6-digit PIN that you'll use for secure actions
          </p>
        </div>

        <PINInput
          onComplete={handlePINComplete}
          title='Create PIN'
          description="Enter a 6-digit PIN (you'll use this for secure actions)"
          error={error || undefined}
        />

        <div className='text-xs text-muted-foreground text-center space-y-1'>
          <p>Your PIN will be encrypted and stored securely.</p>
          <p>
            You'll use this PIN for major actions instead of biometric
            verification.
          </p>
        </div>
      </Card>
    )
  }

  if (step === "pin-completing") {
    return (
      <Card className='p-8 text-center space-y-4'>
        <Loader2 className='h-12 w-12 mx-auto animate-spin text-primary' />
        <h3 className='text-xl font-semibold'>Setting Up PIN</h3>
        <p className='text-muted-foreground'>Completing your enrollment...</p>
      </Card>
    )
  }

  if (step === "capturing" && challenge) {
    return (
      <div className='space-y-4'>
        <div className='text-center space-y-2'>
          <h3 className='text-xl font-semibold'>Face Recognition Setup</h3>
          <p className='text-sm text-muted-foreground'>
            Follow the on-screen instructions to capture your face biometric
            data
          </p>
        </div>

        <BiometricCapture
          method='face'
          challenge={challenge}
          onComplete={handleCaptureComplete}
          onCancel={() => {
            setStep("method-selection")
            setChallenge(null)
          }}
          mode='enrollment'
        />
      </div>
    )
  }

  return null
}
