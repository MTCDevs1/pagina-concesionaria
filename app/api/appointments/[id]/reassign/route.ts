import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db/client'
import { getAvailableSlotsForEmployee } from '@/lib/scheduling/availability'
import { TZ } from '@/lib/scheduling/slots'
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
  const { newEmployeeId } = await req.json()

  if (!newEmployeeId) return NextResponse.json({ error: 'newEmployeeId requerido' }, { status: 400 })

  const appt = await queryOne<{ fecha_hora: string; estado: string; vehicle_id: number }>(
    'SELECT fecha_hora, estado, vehicle_id FROM appointments WHERE id = $1',
    [Number(id)]
  )
  if (!appt) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  if (appt.estado !== 'confirmada') {
    return NextResponse.json({ error: 'Solo se pueden reasignar reservas confirmadas' }, { status: 400 })
  }

  // Verificar que el nuevo empleado tiene ese turno disponible
  const fecha = new Date(appt.fecha_hora)
  const fechaDate = new Date(fecha.toLocaleDateString('en-CA', { timeZone: TZ }) + 'T00:00:00Z')
  const slots = await getAvailableSlotsForEmployee(Number(newEmployeeId), fechaDate)
  const horaUY = new Date(appt.fecha_hora).toLocaleTimeString('es-UY', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  })

  if (!slots.includes(horaUY)) {
    return NextResponse.json({ error: 'El empleado no tiene disponibilidad en ese horario' }, { status: 409 })
  }

  try {
    await query('UPDATE appointments SET employee_id = $1 WHERE id = $2', [Number(newEmployeeId), Number(id)])
    await logAudit({ action: 'REASSIGN', entityType: 'appointments', entityId: Number(id), userId: session.id, newData: { newEmployeeId }, ip: getIp(req) })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'El empleado ya tiene una reserva en ese horario' }, { status: 409 })
  }
}
