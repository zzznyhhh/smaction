import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT_SET'
  const jwtSecret = process.env.JWT_SECRET || 'NOT_SET'
  const adminPw = process.env.ADMIN_PASSWORD || 'NOT_SET'

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: url === 'NOT_SET' ? 'NOT_SET' : url.substring(0, 30) + '...',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey === 'NOT_SET' ? 'NOT_SET' : anonKey.substring(0, 10) + '...',
    SUPABASE_SERVICE_ROLE_KEY: serviceKey === 'NOT_SET' ? 'NOT_SET' : serviceKey.substring(0, 10) + '...',
    JWT_SECRET: jwtSecret === 'NOT_SET' ? 'NOT_SET' : 'SET (' + jwtSecret.length + ' chars)',
    ADMIN_PASSWORD: adminPw === 'NOT_SET' ? 'NOT_SET' : 'SET',
    isLocalMode: !url || url === 'NOT_SET' || url.includes('your-project'),
  })
}
