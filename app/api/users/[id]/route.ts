import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { updateUser, deleteUser } from '@/lib/db/users.admin'
import { logAudit, getIp } from '@/lib/db/audit'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  if (body.password && body.password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
  }

  const result = await updateUser(Number(id), body)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  await logAudit({ action: 'UPDATE', entityType: 'users', entityId: Number(id), userId: session.id, newData: body, ip: getIp(req) })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  if (Number(id) === session.id) {
    return NextResponse.json({ error: 'No podés desactivar tu propia cuenta' }, { status: 400 })
  }

  const result = await deleteUser(Number(id))
  if (result.error) return NextResponse.json({ error: result.error }, { status: 409 })
  await logAudit({ action: 'DELETE', entityType: 'users', entityId: Number(id), userId: session.id, ip: getIp(_req) })
  return NextResponse.json({ ok: true })
}
