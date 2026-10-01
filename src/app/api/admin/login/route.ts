import { NextRequest, NextResponse } from 'next/server'
import { signAdminSession } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Ambil password yang berlaku: cek Supabase dulu, fallback ke env
    const supabase = createServerClient()
    const { data: settingRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single()

    const adminPassword = settingRow?.value ?? process.env.ADMIN_PASSWORD ?? 'admin123'

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Password salah' },
        { status: 401 }
      )
    }

    const token = await signAdminSession()

    const response = NextResponse.json({ success: true })
    response.cookies.set('evoting_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
