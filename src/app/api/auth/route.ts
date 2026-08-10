import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { signVoterSession, setVoterCookie } from '@/lib/auth'
import { isLocalMode, localFindVoter } from '@/lib/localDb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Accept both 'nis' and legacy 'nisn' field
    const nis = body.nis || body.nisn

    if (!nis || typeof nis !== 'string') {
      return NextResponse.json(
        { success: false, error: 'NIS tidak valid' },
        { status: 400 }
      )
    }

    let voter: { nisn: string; name: string; class: string; has_voted: boolean } | null = null

    if (isLocalMode()) {
      // ── LOCAL MODE ──
      const localVoter = localFindVoter(nis)
      if (!localVoter) {
        return NextResponse.json(
          { success: false, error: 'NIS tidak terdaftar dalam DPT' },
          { status: 404 }
        )
      }
      voter = localVoter
    } else {
      // ── SUPABASE MODE ──
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('voters')
        .select('nisn, name, class, has_voted')
        .eq('nisn', nis.trim())
        .single()

      if (error || !data) {
        return NextResponse.json(
          { success: false, error: 'NIS tidak terdaftar dalam DPT' },
          { status: 404 }
        )
      }
      voter = data
    }

    // Cek apakah sudah memilih
    if (voter.has_voted) {
      return NextResponse.json(
        { success: false, error: 'NIS ini sudah digunakan untuk memilih' },
        { status: 403 }
      )
    }

    // Buat session token
    const token = await signVoterSession({ nisn: voter.nisn, name: voter.name })

    // Buat response dan set cookie
    const response = NextResponse.json({
      success: true,
      voterName: voter.name,
      voterClass: voter.class,
    })

    response.cookies.set('evoting_voter_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Auth error:', err)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
