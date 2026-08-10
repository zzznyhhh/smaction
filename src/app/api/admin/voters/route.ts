import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/auth'
import { isLocalMode, localGetVoters, localUpsertVoters } from '@/lib/localDb'

// GET /api/admin/voters - get all voters with status
export async function GET() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (isLocalMode()) {
      // ── LOCAL MODE ──
      const voters = localGetVoters()
      return NextResponse.json({ voters })
    }

    // ── SUPABASE MODE ──
    const supabase = createServerClient()
    const { data: voters, error } = await supabase
      .from('voters')
      .select('nisn, name, class, has_voted, created_at')
      .order('class')
      .order('name')

    if (error) throw error

    return NextResponse.json({ voters: voters || [] })
  } catch (err) {
    console.error('Voters GET error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST /api/admin/voters - bulk import voters from CSV data
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { voters } = body

    if (!Array.isArray(voters) || voters.length === 0) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    // Validate each voter
    const validVoters = voters.filter(
      (v) => v.nisn && v.name && v.class
    ).map((v) => ({
      nisn: String(v.nisn).trim(),
      name: String(v.name).trim(),
      class: String(v.class).trim(),
    }))

    if (validVoters.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid yang dapat diimport' }, { status: 400 })
    }

    if (isLocalMode()) {
      // ── LOCAL MODE ──
      const imported = localUpsertVoters(validVoters)
      return NextResponse.json({ success: true, imported, total: validVoters.length })
    }

    // ── SUPABASE MODE ──
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('voters')
      .upsert(
        validVoters.map((v) => ({ ...v, has_voted: false })),
        { onConflict: 'nisn', ignoreDuplicates: false }
      )
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: validVoters.length,
    })
  } catch (err) {
    console.error('Voters POST error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE /api/admin/voters - delete all voters
export async function DELETE() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (isLocalMode()) {
      // ── LOCAL MODE ──
      const { localResetVoters } = await import('@/lib/localDb')
      localResetVoters()
      return NextResponse.json({ success: true, message: 'Data DPT berhasil direset' })
    }

    // ── SUPABASE MODE ──
    const supabase = createServerClient()
    const { error } = await supabase.from('voters').delete().neq('nisn', '')

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Data DPT berhasil direset' })
  } catch (err) {
    console.error('Voters DELETE error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
