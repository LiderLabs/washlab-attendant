"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Webcam from "react-webcam"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2 } from "lucide-react"

const REQUIRED_ANGLES = ["center", "left", "right", "up", "down"]
const MOVEMENT_THRESHOLD = 0.04 // Nose movement sensitivity

type Step = "ready" | "capturing" | "processing" | "complete"

export default function BiometricCapture({
  onComplete,
  onCancel,
  method = "face",
  mode = "enrollment",
}: any) {
  const webcamRef = useRef<Webcam>(null)
  const faceMeshRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)

  const [step, setStep] = useState<Step>("ready")
  const [angle, setAngle] = useState("center")
  const [captured, setCaptured] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [baseNose, setBaseNose] = useState<{ x: number; y: number } | null>(
    null
  )
  const [modelReady, setModelReady] = useState(false)
  const capturedFramesRef = useRef<Array<{ angle: string; landmarks: any; image: string }>>([])
  const livenessMovementsRef = useRef<Array<{ angle: string; movement: { x: number; y: number } }>>([])

  /* ----------------------- movement logic ----------------------- */
  const movedEnough = (base: any, now: any, dir: string) => {
    const dx = now.x - base.x
    const dy = now.y - base.y

    switch (dir) {
      case "left":
        return dx < -MOVEMENT_THRESHOLD
      case "right":
        return dx > MOVEMENT_THRESHOLD
      case "up":
        return dy < -MOVEMENT_THRESHOLD
      case "down":
        return dy > MOVEMENT_THRESHOLD
      case "center":
        return (
          Math.abs(dx) < MOVEMENT_THRESHOLD && Math.abs(dy) < MOVEMENT_THRESHOLD
        )
      default:
        return false
    }
  }

  /* ----------------------- capture frame ----------------------- */
  const captureFrame = useCallback((landmarks: any) => {
    const img = webcamRef.current?.getScreenshot()
    if (!img) return

    // Store frame data with landmarks
    capturedFramesRef.current.push({
      angle,
      landmarks,
      image: img,
    })

    // Record movement for liveness
    if (baseNose && livenessMovementsRef.current) {
      const nose = landmarks[1] // nose tip
      const current = { x: nose.x, y: nose.y }
      const movement = {
        x: current.x - baseNose.x,
        y: current.y - baseNose.y,
      }
      livenessMovementsRef.current.push({ angle, movement })
    }

    setCaptured((prev) => [...prev, angle])

    const nextIndex = REQUIRED_ANGLES.indexOf(angle) + 1
    if (nextIndex < REQUIRED_ANGLES.length) {
      setAngle(REQUIRED_ANGLES[nextIndex])
      setBaseNose(null)
      setProgress((nextIndex / REQUIRED_ANGLES.length) * 100)
    } else {
      setStep("processing")
      setTimeout(() => {
        // Generate biometric data
        const features = generateFeatures(capturedFramesRef.current)
        const measurements = generateMeasurements(capturedFramesRef.current)
        const livenessData = generateLivenessData(livenessMovementsRef.current)

        onComplete({
          captureType: "face",
          angles: REQUIRED_ANGLES,
          captureQuality: 0.95,
          features: JSON.stringify(features),
          measurements: JSON.stringify(measurements),
          livenessData: JSON.stringify(livenessData),
          deviceInfo: JSON.stringify({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: Date.now(),
          }),
        })
        setStep("complete")
      }, 1200)
    }
  }, [angle, baseNose, onComplete])

  /* ----------------------- Helper functions ----------------------- */
  const calculateDistance = (p1: any, p2: any) => {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    const dz = (p1.z || 0) - (p2.z || 0)
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  const calculateBoundingBox = (landmarks: any[]) => {
    if (!landmarks.length) return { x: 0, y: 0, width: 0, height: 0 }
    
    const xs = landmarks.map((p: any) => p.x)
    const ys = landmarks.map((p: any) => p.y)
    
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    }
  }

  /* ----------------------- Generate features from landmarks ----------------------- */
  const generateFeatures = (frames: Array<{ angle: string; landmarks: any }>) => {
    // Extract key facial features from all angles
    const allFeatures: Record<string, any> = {}
    
    frames.forEach((frame) => {
      if (!frame.landmarks || !Array.isArray(frame.landmarks)) return
      
      const landmarks = frame.landmarks
      // Key facial points (MediaPipe FaceMesh has 468 landmarks)
      // Extract critical points for biometric matching
      const keyPoints = {
        nose: landmarks[1], // nose tip
        leftEye: landmarks[33], // left eye inner corner
        rightEye: landmarks[263], // right eye inner corner
        leftMouth: landmarks[61], // left mouth corner
        rightMouth: landmarks[291], // right mouth corner
        chin: landmarks[199], // chin center
      }
      
      // Calculate distances between key points (normalized features)
      const eyeDistance = calculateDistance(keyPoints.leftEye, keyPoints.rightEye)
      const mouthWidth = calculateDistance(keyPoints.leftMouth, keyPoints.rightMouth)
      const noseToChin = calculateDistance(keyPoints.nose, keyPoints.chin)
      const leftEyeToNose = calculateDistance(keyPoints.leftEye, keyPoints.nose)
      const rightEyeToNose = calculateDistance(keyPoints.rightEye, keyPoints.nose)
      
      allFeatures[frame.angle] = {
        keyPoints,
        ratios: {
          eyeDistance,
          mouthWidth,
          noseToChin,
          leftEyeToNose,
          rightEyeToNose,
          eyeToMouthRatio: eyeDistance / mouthWidth,
          faceWidth: eyeDistance * 1.5, // Estimated face width
        },
      }
    })
    
    return allFeatures
  }

  /* ----------------------- Generate measurements ----------------------- */
  const generateMeasurements = (frames: Array<{ angle: string; landmarks: any }>) => {
    const measurements: Record<string, any> = {}
    
    frames.forEach((frame) => {
      if (!frame.landmarks || !Array.isArray(frame.landmarks)) return
      
      const landmarks = frame.landmarks
      // Extract measurements for each angle
      measurements[frame.angle] = {
        landmarkCount: landmarks.length,
        boundingBox: calculateBoundingBox(landmarks),
        centerPoint: {
          x: landmarks.reduce((sum: number, p: any) => sum + p.x, 0) / landmarks.length,
          y: landmarks.reduce((sum: number, p: any) => sum + p.y, 0) / landmarks.length,
        },
        // Store first 50 landmarks as a compact representation
        keyLandmarks: landmarks.slice(0, 50).map((p: any) => ({
          x: p.x,
          y: p.y,
          z: p.z || 0,
        })),
      }
    })
    
    return measurements
  }

  /* ----------------------- Generate liveness data ----------------------- */
  const generateLivenessData = (
    movements: Array<{ angle: string; movement: { x: number; y: number } }>
  ) => {
    // Verify that movements occurred (proving liveness)
    const hasMovements = movements.length >= REQUIRED_ANGLES.length
    const significantMovements = movements.filter(
      (m) => Math.abs(m.movement.x) > MOVEMENT_THRESHOLD || Math.abs(m.movement.y) > MOVEMENT_THRESHOLD
    )
    
    return {
      passed: hasMovements && significantMovements.length >= REQUIRED_ANGLES.length - 1, // Allow one angle without significant movement
      movements,
      movementCount: movements.length,
      significantMovements: significantMovements.length,
      timestamp: Date.now(),
    }
  }

  /* ----------------------- FaceMesh results ----------------------- */
  const onResults = useCallback(
    (results: any) => {
      if (!results.multiFaceLandmarks?.length) return

      const nose = results.multiFaceLandmarks[0][1] // nose tip
      const current = { x: nose.x, y: nose.y }

      if (!baseNose) {
        setBaseNose(current)
        return
      }

      if (movedEnough(baseNose, current, angle)) {
        captureFrame(results.multiFaceLandmarks[0])
      }
    },
    [angle, baseNose, captureFrame]
  )

  /* ----------------------- init MediaPipe ----------------------- */
  useEffect(() => {
    if (step !== "capturing") return

    let mounted = true

    const init = async () => {
      const { FaceMesh } = await import("@mediapipe/face_mesh")

      if (!mounted) return

      const mesh = new FaceMesh({
        locateFile: (f) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
      })

      mesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.4,
        minTrackingConfidence: 0.4,
      })

      mesh.onResults(onResults)
      faceMeshRef.current = mesh
      setModelReady(true)

      const loop = async () => {
        if (!mounted) return

        const video = webcamRef.current?.video
        if (video?.readyState === 4) {
          await mesh.send({ image: video })
        }
        rafRef.current = requestAnimationFrame(loop)
      }

      loop()
    }

    init()

    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [step, onResults])

  /* ----------------------- UI ----------------------- */
  if (step === "ready") {
    return (
      <Card className='p-6 space-y-4'>
        <Webcam
          ref={webcamRef}
          mirrored
          screenshotFormat='image/jpeg'
          className='rounded-lg'
          videoConstraints={{ facingMode: "user" }}
        />
        <Button onClick={() => setStep("capturing")} className='w-full'>
          Start Capture
        </Button>
      </Card>
    )
  }

  if (step === "capturing") {
    return (
      <Card className='p-6 space-y-4'>
        <Webcam
          ref={webcamRef}
          mirrored
          screenshotFormat='image/jpeg'
          className='rounded-lg'
          videoConstraints={{ facingMode: "user" }}
        />
        {!modelReady && (
          <div className='flex justify-center'>
            <Loader2 className='animate-spin' />
          </div>
        )}
        <div className='text-center font-semibold capitalize'>Move {angle}</div>
        <Progress value={progress} />
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </Card>
    )
  }

  if (step === "processing") {
    return (
      <Card className='p-8 text-center'>
        <Loader2 className='mx-auto animate-spin' />
        <p>Processing biometric data…</p>
      </Card>
    )
  }

  if (step === "complete") {
    return (
      <Card className='p-8 text-center'>
        <CheckCircle2 className='mx-auto text-green-500' />
        <p>Capture complete</p>
      </Card>
    )
  }

  return null
}
