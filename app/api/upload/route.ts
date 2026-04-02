import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getSession } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const filename = req.nextUrl.searchParams.get('filename')
  if (!filename) return NextResponse.json({ error: 'filename requerido' }, { status: 400 })

  const blob = await put(`vehicles/${Date.now()}-${filename}`, req.body!, {
    access: 'public',
  })

  return NextResponse.json({ url: blob.url })
}
