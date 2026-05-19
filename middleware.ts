import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'ds_session'
const LOGIN_PATH = '/login'

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? 'fallback-secret-change-in-production'
  return new TextEncoder().encode(secret)
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow auth endpoints through
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Protect dashboard pages and all other API routes
  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/api/')

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url))
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
