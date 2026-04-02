import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { cancelAppointment } from '@/lib/db/appointments'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const result = await cancelAppointment(Number(id), session.id)

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
