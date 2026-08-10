import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isLocalMode, localGetResults } from '@/lib/localDb'

export async function GET() {
  try {
    if (isLocalMode()) {
      // ── LOCAL MODE ──
      return NextResponse.json(localGetResults())
    }

    // ── SUPABASE MODE ──
    const supabase = createServerClient()

    // Total DPT
    const { count: totalVoters } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true })

    // Total suara masuk
    const { count: totalVotes } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })

    // Suara per kandidat
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, candidate_number, chairman_name, photo_url, vision_mission')
      .order('candidate_number')

    if (!candidates) {
      return NextResponse.json({ error: 'Gagal mengambil data kandidat', detail: 'candidates is null' }, { status: 500 })
    }

    // Hitung suara per kandidat
    const candidatesWithVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const { count: voteCount } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', candidate.id)

        const votes = voteCount || 0
        const percentage = (totalVotes || 0) > 0
          ? Math.round((votes / (totalVotes || 1)) * 100 * 10) / 10
          : 0

        return {
          id: candidate.id,
          candidateNumber: candidate.candidate_number,
          chairmanName: candidate.chairman_name,
          photoUrl: candidate.photo_url,
          visionMission: candidate.vision_mission,
          votes,
          percentage,
        }
      })
    )

    const tv = totalVoters || 0
    const tvo = totalVotes || 0
    const golput = tv - tvo
    const participationRate = tv > 0 ? Math.round((tvo / tv) * 100 * 10) / 10 : 0

    return NextResponse.json({
      totalVoters: tv,
      totalVotes: tvo,
      golput: golput > 0 ? golput : 0,
      participationRate,
      candidates: candidatesWithVotes,
    })
  } catch (err: any) {
    console.error('Results error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: err?.message || String(err) },
      { status: 500 }
    )
  }
}
