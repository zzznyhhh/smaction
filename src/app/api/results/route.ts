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

    // Ambil semua data sekaligus (3 query paralel, bukan N+1)
    const [
      { count: totalVoters },
      { count: totalVotes },
      { data: candidates },
      { data: voteCounts },
    ] = await Promise.all([
      supabase.from('voters').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase
        .from('candidates')
        .select('id, candidate_number, chairman_name, photo_url, vision_mission')
        .order('candidate_number'),
      // Aggregasi suara per kandidat dalam satu query
      supabase.from('votes').select('candidate_id'),
    ])

    if (!candidates) {
      return NextResponse.json(
        { error: 'Gagal mengambil data kandidat', detail: 'candidates is null' },
        { status: 500 },
      )
    }

    // Hitung vote per kandidat dari hasil satu query (in-memory, sangat cepat)
    const voteMap: Record<string, number> = {}
    if (voteCounts) {
      for (const row of voteCounts) {
        voteMap[row.candidate_id] = (voteMap[row.candidate_id] || 0) + 1
      }
    }

    const tvo = totalVotes || 0
    const tv = totalVoters || 0

    const candidatesWithVotes = candidates.map((candidate) => {
      const votes = voteMap[candidate.id] || 0
      const percentage =
        tvo > 0 ? Math.round((votes / tvo) * 100 * 10) / 10 : 0

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
      { status: 500 },
    )
  }
}
