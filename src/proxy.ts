import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // =============================================
  // PROTECT VOTER ROUTES: /vote, /success
  // =============================================
  if (pathname.startsWith('/vote') || pathname.startsWith('/success')) {
    const voterToken = request.cookies.get('evoting_voter_session')?.value

    if (!voterToken || !(await verifyToken(voterToken))) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // =============================================
  // PROTECT ADMIN ROUTES: /admin/dashboard, /admin/voters, /admin/report
  // (NOT /admin itself - that's the login page)
  // =============================================
  if (
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/admin/voters') ||
    pathname.startsWith('/admin/candidates') ||
    pathname.startsWith('/admin/report')
  ) {
    const adminToken = request.cookies.get('evoting_admin_session')?.value

    if (!adminToken || !(await verifyToken(adminToken))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/vote/:path*', '/success/:path*', '/admin/:path*'],
}
