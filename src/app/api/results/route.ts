import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isLocalMode, localGetResults } from '@/lib/localDb'

export async function GET() {
  try {
    if (isLocalMode()) {
      return NextResponse.json(localGetResults())
    }

    const supabase = createServerClient()

    // Satu batch: ambil candidates + semua votes sekaligus (tanpa HEAD request)
    const [candidatesRes, votesRes, votersRes] = await Promise.all([
      supabase
        .from('candidates')
        .select('id, candidate_number, chairman_name, photo_url, vision_mission')
        .order('candidate_number'),
      supabase.from('votes').select('candidate_id'),
      supabase.from('voters').select('id'),
    ])

    // Log errors untuk debugging
    if (candidatesRes.error) {
      console.error('Candidates error:', candidatesRes.error)
      return NextResponse.json(
        { error: 'Gagal ambil kandidat', detail: candidatesRes.error.message },
        { status: 500 },
      )
    }
    if (votesRes.error) {
      console.error('Votes error:', votesRes.error)
      return NextResponse.json(
        { error: 'Gagal ambil votes', detail: votesRes.error.message },
        { status: 500 },
      )
    }
    if (votersRes.error) {
      console.error('Voters error:', votersRes.error)
      return NextResponse.json(
        { error: 'Gagal ambil voters', detail: votersRes.error.message },
        { status: 500 },
      )
    }

    const candidates = candidatesRes.data ?? []
    const votes = votesRes.data ?? []
    const voters = votersRes.data ?? []

    const totalVoters = voters.length
    const totalVotes = votes.length

    // Hitung suara per kandidat in-memory (sangat cepat)
    const voteMap: Record<string, number> = {}
    for (const vote of votes) {
      voteMap[vote.candidate_id] = (voteMap[vote.candidate_id] || 0) + 1
    }

    const candidatesWithVotes = candidates.map((c) => {
      const v = voteMap[c.id] || 0
      return {
        id: c.id,
        candidateNumber: c.candidate_number,
        chairmanName: c.chairman_name,
        photoUrl: c.photo_url,
        visionMission: c.vision_mission,
        votes: v,
        percentage: totalVotes > 0 ? Math.round((v / totalVotes) * 1000) / 10 : 0,
      }
    })

    const golput = totalVoters - totalVotes

    return NextResponse.json({
      totalVoters,
      totalVotes,
      golput: golput > 0 ? golput : 0,
      participationRate: totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 1000) / 10 : 0,
      candidates: candidatesWithVotes,
    })
  } catch (err: any) {
    console.error('Results fatal error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: err?.message || String(err) },
      { status: 500 },
    )
  }
}
