import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'
import { isLocalMode, localResetVotes } from '@/lib/localDb'

// POST /api/admin/reset - reset semua suara (hanya untuk testing lokal)
export async function POST() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isLocalMode()) {
    return NextResponse.json(
      { error: 'Reset hanya tersedia di mode lokal (testing)' },
      { status: 403 }
    )
  }

  localResetVotes()
  return NextResponse.json({ success: true, message: 'Semua suara dan status has_voted telah direset' })
}
