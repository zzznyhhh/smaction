import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'
import { isLocalMode, localResetVotes } from '@/lib/localDb'
import { createServerClient } from '@/lib/supabase/server'
// POST /api/admin/reset - reset semua suara (hanya untuk testing lokal)
export async function POST() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isLocalMode()) {
    localResetVotes()
    return NextResponse.json({ success: true, message: 'Semua suara dan status has_voted telah direset' })
  }

  try {
    const supabase = createServerClient()
    
    // 1. Delete all votes
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Trick to delete all
      
    if (deleteError) throw deleteError

    // 2. Reset has_voted on voters
    const { error: updateError } = await supabase
      .from('voters')
      .update({ has_voted: false })
      .neq('nisn', 'dummy_nisn_that_does_not_exist') // Trick to update all

    if (updateError) throw updateError

    return NextResponse.json({ success: true, message: 'Semua suara dan status has_voted telah direset' })
  } catch (err: any) {
    console.error('Reset error:', err)
    return NextResponse.json({ error: 'Gagal melakukan reset database', detail: err.message }, { status: 500 })
  }
}
