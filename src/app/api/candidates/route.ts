import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isLocalMode, localGetCandidates } from '@/lib/localDb'

export async function GET() {
  try {
    if (isLocalMode()) {
      return NextResponse.json(localGetCandidates())
    }

    const supabase = createServerClient()
    
    // Hanya ambil data ringan: id, nomor urut, nama, visi-misi, dan foto
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('id, candidate_number, chairman_name, photo_url, vision_mission')
      .order('candidate_number')

    if (error) {
      throw error
    }

    // Ubah format agar sesuai dengan yang diharapkan UI
    const formattedCandidates = candidates.map(c => ({
      id: c.id,
      candidateNumber: c.candidate_number,
      chairmanName: c.chairman_name,
      photoUrl: c.photo_url,
      visionMission: c.vision_mission
    }))

    return NextResponse.json(formattedCandidates)
  } catch (err) {
    console.error('Error fetching simple candidates:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
