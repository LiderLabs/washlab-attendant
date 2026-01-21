'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { AlertCircle, Loader2, ArrowRight, FileText, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { LoginFlow } from '@/components/auth/LoginFlow';

type LoginStep = 'branch-code' | 'branch-info' | 'station-login' | 'attendant-auth';

export default function LoginPage() {
  const router = useRouter();
  
  // Check if already logged in on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const stationToken = localStorage.getItem("station_token")
    const branchId = localStorage.getItem("station_branch_id")

    if (stationToken && branchId) {
      // Already logged in, redirect to dashboard
      router.push("/washstation/dashboard")
    }
  }, [router])
  const [step, setStep] = useState<LoginStep>("branch-code")
  const [branchCode, setBranchCode] = useState("")
  const [branchId, setBranchId] = useState<Id<"branches"> | null>(null)
  const [stationPin, setStationPin] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const deviceId = useState<string>(() => {
    // Generate or retrieve device ID from localStorage
    if (typeof window === "undefined") {
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    let deviceId = localStorage.getItem("washstation_device_id")
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("washstation_device_id", deviceId)
    }
    return deviceId
  })[0]

  // Query branch by code (using admin query)
  // Keep query active on branch-info and station-login steps to maintain branch data
  const branchInfo = useQuery(
    api.admin.getBranchByCode,
    (step === "branch-code" && branchCode.length >= 2) ||
      (step === "branch-info" && branchCode.length >= 2) ||
      (step === "station-login" && branchCode.length >= 2)
      ? { code: branchCode.toUpperCase() }
      : "skip"
  )

  // Query all active branches for display (public query - no auth required)
  // Type assertion needed until types regenerate after adding getActiveBranchesList to admin.ts
  const activeBranches = useQuery(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.admin as any).getActiveBranchesList ?? null,
    step === "branch-code" ? {} : "skip"
  ) as { code: string; name: string }[] | undefined | null

  // Station login mutation (type assertion needed until types regenerate)
  const loginStation = useMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api as any).stations?.loginStation as any
  )

  const handleBranchCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!branchCode.trim()) {
      toast({
        title: "Branch code required",
        description: "Please enter a branch code",
        variant: "destructive",
      })
      return
    }

    // Wait for query result
    if (branchInfo === undefined) {
      return // Still loading
    }

    if (!branchInfo) {
      toast({
        title: "Invalid branch code",
        description: "The branch code you entered is not valid or inactive.",
        variant: "destructive",
      })
      return
    }

    // Move to branch info step
    setBranchId(branchInfo._id)
    setStep("branch-info")
  }

  const handleContinueToSignIn = async () => {
    if (!branchId || !branchInfo) {
      toast({
        title: "Error",
        description: "Branch information is missing",
        variant: "destructive",
      })
      return
    }

    // Station login is always required - move to station login step
    setStep("station-login")
  }

  const handleStationLogin = async (pin: string | null) => {
    if (!branchId || !branchInfo) {
      toast({
        title: "Error",
        description: "Branch information is missing",
        variant: "destructive",
      })
      return
    }

    // Station PIN is always required
    if (!pin || !pin.trim()) {
      toast({
        title: "Station PIN required",
        description: "Please enter the station PIN to continue",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoggingIn(true)

      // Get device info
      const deviceInfo = JSON.stringify({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      })

      // Login to station
      const result = await loginStation({
        branchId,
        deviceId,
        stationPin: pin || undefined,
        deviceInfo,
      })

      // Store station session info
      if (result?.stationToken && typeof window !== "undefined") {
        localStorage.setItem("station_token", result.stationToken)
        localStorage.setItem("station_branch_id", branchId)
        localStorage.setItem("station_device_id", deviceId)
        localStorage.setItem("station_session_id", result.sessionId)
        localStorage.setItem("station_branch_name", branchInfo.name)

        toast({
          title: "Station login successful",
          description: `Welcome to ${branchInfo.name}`,
        })

        // After station login, go directly to dashboard (skip attendant auth)
        router.push("/washstation/dashboard")
      } else {
        throw new Error("Station login failed")
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to login to station"
      toast({
        title: "Station login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleStationPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleStationLogin(stationPin);
  };

  if (step === 'branch-code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo className="h-12 w-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">WashStation</CardTitle>
              <CardDescription className="text-base">
                Enter your branch code to begin
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleBranchCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branchCode" className="text-sm font-medium">
                  Branch Code
                </Label>
                <Input
                  id="branchCode"
                  type="text"
                  placeholder="e.g., ACD"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value.toUpperCase().trim())}
                  className="text-center text-lg font-semibold tracking-wider uppercase"
                  maxLength={10}
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={branchInfo === undefined || !branchCode.trim()}
              >
                {branchInfo === undefined ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Continue to Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Available codes
              </p>
              {activeBranches === undefined ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading branches...</span>
                </div>
              ) : activeBranches && activeBranches.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {activeBranches.map((branch) => (
                    <div key={branch.code} className="flex justify-between">
                      <span className="font-mono font-semibold">{branch.code}</span>
                      <span className="text-muted-foreground truncate ml-2" title={branch.name}>
                        {branch.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No active branches available
                </p>
              )}
            </div>

            <div className="pt-2">
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-sm">
                  ▲ Preview Mode - Data stored locally
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
          © 2025 WashLab • Tablet POS
        </div>
      </div>
    );
  }

  if (step === 'branch-info' && branchInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo className="h-12 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">WashStation</CardTitle>
            <CardDescription className="text-base">
              Branch Information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Branch Name
                </Label>
                <p className="text-lg font-semibold">{branchInfo.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Code
                </Label>
                <p className="text-lg font-mono font-semibold">{branchInfo.code}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Address
                </Label>
                <p className="text-sm">{branchInfo.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  City
                </Label>
                <p className="text-sm">{branchInfo.city}, {branchInfo.country}</p>
              </div>
              {branchInfo.phoneNumber && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </Label>
                  <p className="text-sm">{branchInfo.phoneNumber}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep('branch-code');
                  setBranchId(null);
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleContinueToSignIn}
              >
                Continue to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'station-login' && branchInfo && branchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo className="h-12 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">WashStation</CardTitle>
            <CardDescription className="text-base">
              Station Login Required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Branch Name
                </Label>
                <p className="text-lg font-semibold">{branchInfo.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Code
                </Label>
                <p className="text-lg font-mono font-semibold">{branchInfo.code}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Address
                </Label>
                <p className="text-sm">{branchInfo.address}</p>
              </div>
            </div>

            <form onSubmit={handleStationPinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stationPin" className="text-sm font-medium">
                  Station PIN
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="stationPin"
                    type="password"
                    placeholder="Enter station PIN"
                    value={stationPin}
                    onChange={(e) => setStationPin(e.target.value)}
                    className="pl-10 text-center text-lg font-semibold tracking-wider"
                    autoFocus
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the station PIN to access the workstation
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep('branch-info');
                    setStationPin('');
                  }}
                  disabled={isLoggingIn}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoggingIn || !stationPin.trim()}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to Station
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'attendant-auth' && branchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo className="h-12 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">WashStation</CardTitle>
            <CardDescription className="text-base">
              Sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginFlow
              branchId={branchId}
              onSuccess={() => {
                router.push('/washstation/dashboard');
              }}
              onBack={() => {
                // Always go back to station login (always required)
                setStep('station-login');
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
