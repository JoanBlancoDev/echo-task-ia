import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSupabaseAccessTokenFromCookies } from "./lib/auth/cookie"


const protectedRoutes = ["/dashboard", "/dashboard/tasks"]

const publicAuthRoutes = ["/login", "/signup"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = getSupabaseAccessTokenFromCookies(request.cookies)


  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (publicAuthRoutes.includes(pathname) && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }


  return NextResponse.next()
}


export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}

