import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@mediapipe/face_mesh",
    "@mediapipe/camera_utils",
    "@mediapipe/drawing_utils",
  ],
}

export default nextConfig
