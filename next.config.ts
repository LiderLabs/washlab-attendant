import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@mediapipe/face_mesh",
    "@mediapipe/camera_utils",
    "@mediapipe/drawing_utils",
  ],
}

export default nextConfig
