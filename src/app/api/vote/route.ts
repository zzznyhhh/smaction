import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyVoterSession } from '@/lib/auth'
import { isLocalMode, localSubmitVote } from '@/lib/localDb'

export async function POST(request: NextRequest) {
  try {
    // Verifikasi session voter
    const session = await verifyVoterSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sesi tidak valid. Silakan login ulang.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { candidateId } = body

    if (!candidateId || typeof candidateId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Kandidat tidak valid' },
        { status: 400 }
      )
    }

    if (isLocalMode()) {
      // ── LOCAL MODE ──
      const result = localSubmitVote(session.nisn, candidateId)
      if (result.error) {
        if (result.error === 'ALREADY_VOTED') {
          return NextResponse.json(
            { success: false, error: 'Anda sudah memilih sebelumnya' },
            { status: 409 }
          )
        }
        if (result.error === 'VOTER_NOT_FOUND') {
          return NextResponse.json(
            { success: false, error: 'Data pemilih tidak ditemukan' },
            { status: 404 }
          )
        }
        if (result.error === 'CANDIDATE_NOT_FOUND') {
          return NextResponse.json(
            { success: false, error: 'Kandidat tidak ditemukan' },
            { status: 404 }
          )
        }
        return NextResponse.json(
          { success: false, error: 'Terjadi kesalahan saat memproses suara' },
          { status: 500 }
        )
      }
    } else {
      // ── SUPABASE MODE ──
      const supabase = createServerClient()
      const { error } = await supabase.rpc('submit_vote', {
        p_nisn: session.nisn,
        p_candidate_id: candidateId,
      })

      if (error) {
        if (error.message.includes('ALREADY_VOTED')) {
          return NextResponse.json(
            { success: false, error: 'Anda sudah memilih sebelumnya' },
            { status: 409 }
          )
        }
        if (error.message.includes('VOTER_NOT_FOUND')) {
          return NextResponse.json(
            { success: false, error: 'Data pemilih tidak ditemukan' },
            { status: 404 }
          )
        }
        throw error
      }
    }

    // Hapus session cookie setelah berhasil memilih
    const response = NextResponse.json({ success: true })
    response.cookies.set('evoting_voter_session', '', {
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Vote error:', err)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses suara' },
      { status: 500 }
    )
  }
}
