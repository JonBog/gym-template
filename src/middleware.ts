import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { checkRouteAccess } from '@/lib/route-guard'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const result = checkRouteAccess(pathname, session as { user: { rol: string } } | null)

  if (result.action === 'redirect') {
    return NextResponse.redirect(new URL(result.to, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/alumno/:path*', '/entrenador/:path*', '/admin/:path*', '/login'],
}
