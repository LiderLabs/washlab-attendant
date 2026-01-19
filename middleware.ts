import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === "true"
  const pathname = req.nextUrl.pathname

  if (maintenanceEnabled && pathname !== "/maintenance") {
    if (pathname.startsWith("/api")) {
      return new NextResponse("Service temporarily unavailable", {
        status: 503,
      })
    }
    return NextResponse.rewrite(new URL("/maintenance", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
