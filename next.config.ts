import type { NextConfig } from "next"
import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
  },
})

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  transpilePackages: [
    "@mediapipe/face_mesh",
    "@mediapipe/camera_utils",
    "@mediapipe/drawing_utils",
  ],
}

export default withPWA(nextConfig)
