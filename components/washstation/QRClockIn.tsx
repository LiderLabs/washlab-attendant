"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@jordan6699/washlab-backend/api"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, RefreshCw, CheckCircle, Clock, Loader2 } from "lucide-react"
import { useStationSession } from "@/hooks/useStationSession"

interface QRClockInProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function QRClockIn({ onComplete, onCancel }: QRClockInProps) {
  const { stationToken } = useStationSession()
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  const generateToken = useMutation((api as any).qrClockIn.generateQRToken)
  const tokenStatus = useQuery(
    (api as any).qrClockIn.getQRTokenStatus,
    qrToken ? { token: qrToken } : "skip"
  )

  const generate = useCallback(async () => {
    if (!stationToken) return
    setIsGenerating(true)
    try {
      const result = await generateToken({ stationToken })
      setQrToken(result.token)
      setTimeLeft(300)
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }, [stationToken, generateToken])

  // Auto-generate on mount
  useEffect(() => {
    generate()
  }, [generate])

  // Countdown timer
  useEffect(() => {
    if (!qrToken) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [qrToken])

  // Watch for completion
  useEffect(() => {
    if (tokenStatus?.status === "completed") {
      onComplete?.()
    }
  }, [tokenStatus, onComplete])

  const isExpired = timeLeft === 0 || tokenStatus?.status === "expired"
  const isCompleted = tokenStatus?.status === "completed"

  const qrUrl = qrToken
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://staging.attendant.washlab.app"}/qr-clockin?token=${qrToken}`
    : ""

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Clock In / Out
        </CardTitle>
        <CardDescription>
          Scan with your phone to clock in or out
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isCompleted ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-semibold text-green-600">
              {tokenStatus?.action === "clock_in" ? "Clocked In!" : "Clocked Out!"}
            </p>
            <Button onClick={onComplete} className="mt-2">Done</Button>
          </div>
        ) : isExpired ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-muted-foreground text-sm">QR code expired</p>
            <Button onClick={generate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Generate New QR
            </Button>
          </div>
        ) : qrToken ? (
          <>
            <div className="p-3 bg-white rounded-xl border">
              <QRCodeSVG value={qrUrl} size={200} />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Badge variant={timeLeft < 60 ? "destructive" : "secondary"}>
                {mins}:{secs.toString().padStart(2, "0")} remaining
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Open your phone camera and scan the code above
            </p>
            <Button variant="outline" size="sm" onClick={generate} disabled={isGenerating}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </>
        ) : (
          <div className="py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isCompleted && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="mt-2">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
