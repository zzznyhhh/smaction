import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isLocalMode, localGetCandidates, localCreateCandidate, localUpdateCandidate, localDeleteCandidate } from '@/lib/localDb'

export async function GET() {
  try {
    if (isLocalMode()) {
      return NextResponse.json(localGetCandidates())
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('candidate_number')

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error fetching candidates:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { candidate_number, chairman_name, vision_mission, photo_url } = body

    if (!candidate_number || !chairman_name) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    if (isLocalMode()) {
      const newCandidate = localCreateCandidate({
        candidate_number: Number(candidate_number),
        chairman_name,
        vision_mission: vision_mission || null,
        photo_url: photo_url || null,
      })
      return NextResponse.json(newCandidate)
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        candidate_number: Number(candidate_number),
        chairman_name,
        vision_mission: vision_mission || null,
        photo_url: photo_url || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error creating candidate:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })

    const body = await req.json()

    if (isLocalMode()) {
      const updated = localUpdateCandidate(id, body)
      if (!updated) return NextResponse.json({ error: 'Paslon tidak ditemukan' }, { status: 404 })
      return NextResponse.json(updated)
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('candidates')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error updating candidate:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })

    if (isLocalMode()) {
      const success = localDeleteCandidate(id)
      if (!success) return NextResponse.json({ error: 'Paslon tidak ditemukan' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error deleting candidate:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
