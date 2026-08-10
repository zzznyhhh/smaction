import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

const VOTER_COOKIE = 'evoting_voter_session'
const ADMIN_COOKIE = 'evoting_admin_session'
const SESSION_EXPIRY = '4h'

export interface VoterSession {
  nisn: string
  name: string
}

// =============================================
// VOTER SESSION
// =============================================

export async function signVoterSession(payload: VoterSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyVoterSession(): Promise<VoterSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(VOTER_COOKIE)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      nisn: payload.nisn as string,
      name: payload.name as string,
    }
  } catch {
    return null
  }
}

export async function setVoterCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(VOTER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 4, // 4 hours
    path: '/',
  })
}

export async function clearVoterCookie() {
  const cookieStore = await cookies()
  cookieStore.set(VOTER_COOKIE, '', { maxAge: 0, path: '/' })
}

// =============================================
// ADMIN SESSION
// =============================================

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE)?.value
    if (!token) return false

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' })
}
