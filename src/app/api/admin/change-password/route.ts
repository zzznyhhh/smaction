import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (currentPassword !== adminPassword) {
      return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 401 })
    }

    // Baca file .env.local
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8')
    }

    // Update atau tambahkan ADMIN_PASSWORD
    if (envContent.includes('ADMIN_PASSWORD=')) {
      envContent = envContent.replace(
        /^ADMIN_PASSWORD=.*$/m,
        `ADMIN_PASSWORD=${newPassword}`
      )
    } else {
      envContent += `\nADMIN_PASSWORD=${newPassword}`
    }

    fs.writeFileSync(envPath, envContent, 'utf-8')

    // Update environment variable in-process agar langsung berlaku
    process.env.ADMIN_PASSWORD = newPassword

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
