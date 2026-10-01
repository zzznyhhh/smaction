import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    // Ambil password yang berlaku: cek Supabase dulu, fallback ke env
    const supabase = createServerClient()
    const { data: settingRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single()

    const adminPassword = settingRow?.value ?? process.env.ADMIN_PASSWORD ?? 'admin123'

    if (currentPassword !== adminPassword) {
      return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 401 })
    }

    // Simpan password baru ke Supabase (upsert)
    const { error: upsertError } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'admin_password', value: newPassword, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json({ error: 'Gagal menyimpan password baru' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
