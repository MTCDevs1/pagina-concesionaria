import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db/client'
import { getAffectedAppointments, cancelAppointmentsByDate } from '@/lib/db/appointments.employee'
import { logAudit, getIp } from '@/lib/db/audit'

// GET → horario semanal + excepciones (propio empleado o admin con ?employeeId=X)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = new URL(req.url)
  const targetIdParam = url.searchParams.get('employeeId')
  let targetId = session.id

  if (targetIdParam && session.role === 'admin') {
    targetId = Number(targetIdParam)
  }

  const [schedule, exceptions] = await Promise.all([
    query(
      `SELECT dia_semana, hora_inicio, hora_fin, pausa_inicio, pausa_fin
       FROM employee_availability WHERE employee_id = $1 ORDER BY dia_semana`,
      [targetId]
    ),
    query(
      `SELECT id, fecha, motivo FROM employee_exceptions
       WHERE employee_id = $1 AND fecha >= CURRENT_DATE ORDER BY fecha`,
      [targetId]
    ),
  ])

  return NextResponse.json({ schedule, exceptions })
}

// POST → guardar horario semanal (reemplaza todo)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { schedule, employeeId } = await req.json()
  const targetId = (session.role === 'admin' && employeeId) ? Number(employeeId) : session.id

  await query(`DELETE FROM employee_availability WHERE employee_id = $1`, [targetId])

  for (const s of schedule) {
    await query(
      `INSERT INTO employee_availability (employee_id, dia_semana, hora_inicio, hora_fin, pausa_inicio, pausa_fin)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [targetId, s.dia_semana, s.hora_inicio, s.hora_fin, s.pausa_inicio ?? null, s.pausa_fin ?? null]
    )
  }

  await logAudit({ action: 'UPDATE', entityType: 'employee_availability', entityId: session.id, userId: session.id, newData: { schedule }, ip: getIp(req) })
  return NextResponse.json({ ok: true })
}

// PUT → agregar excepción (día no disponible)
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { fecha, motivo, confirmar } = await req.json()
  if (!fecha) return NextResponse.json({ error: 'fecha requerida' }, { status: 400 })

  // Obtener reservas afectadas
  const affected = await getAffectedAppointments(session.id, fecha)

  // Si hay reservas afectadas y no se confirmó, retornar listado para popup
  if (affected.length > 0 && !confirmar) {
    return NextResponse.json({ affected }, { status: 200 })
  }

  // Cancelar reservas afectadas
  if (affected.length > 0) {
    await cancelAppointmentsByDate(session.id, fecha)
  }

  // Insertar excepción
  await queryOne(
    `INSERT INTO employee_exceptions (employee_id, fecha, motivo)
     VALUES ($1, $2, $3)
     ON CONFLICT (employee_id, fecha) DO UPDATE SET motivo = $3`,
    [session.id, fecha, motivo ?? null]
  )

  await logAudit({ action: 'UPDATE', entityType: 'employee_exceptions', entityId: session.id, userId: session.id, newData: { fecha, motivo, cancelledCount: affected.length }, ip: getIp(req) })
  return NextResponse.json({ ok: true, cancelled: affected.length })
}

// DELETE → eliminar excepción
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { exceptionId } = await req.json()
  await query(
    `DELETE FROM employee_exceptions WHERE id = $1 AND employee_id = $2`,
    [exceptionId, session.id]
  )
  return NextResponse.json({ ok: true })
}
