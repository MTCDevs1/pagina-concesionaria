import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { cancelAppointment } from '@/lib/db/appointments'
import { updateAppointmentStatus } from '@/lib/db/appointments.employee'
import { queryOne } from '@/lib/db/client'
import { logAudit, getIp } from '@/lib/db/audit'

// DELETE → cliente cancela su reserva
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const result = await cancelAppointment(Number(id), session.id)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  await logAudit({ action: 'CANCEL', entityType: 'appointments', entityId: Number(id), userId: session.id, ip: getIp(_req) })
  return NextResponse.json({ ok: true })
}

// PATCH → empleado/admin actualiza estado o notas
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { estado, notas } = await req.json()

  // Verificar que la reserva pertenece al empleado (admin puede todo)
  if (session.role === 'empleado') {
    const appt = await queryOne<{ employee_id: number }>(
      'SELECT employee_id FROM appointments WHERE id = $1',
      [Number(id)]
    )
    if (!appt || appt.employee_id !== session.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
  }

  const validStates = ['realizada', 'cancelada', 'no_asistio']
  if (estado && !validStates.includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  await updateAppointmentStatus(Number(id), estado, notas)
  await logAudit({ action: 'STATUS_UPDATE', entityType: 'appointments', entityId: Number(id), userId: session.id, newData: { estado, notas }, ip: getIp(req) })
  return NextResponse.json({ ok: true })
}
