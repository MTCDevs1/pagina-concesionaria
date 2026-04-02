import { query, queryOne } from './client'
import { TZ } from '@/lib/scheduling/slots'

export type AppointmentInput = {
  vehicleId: number
  employeeId: number
  fechaHora: Date
  clientId?: number
  guestNombre?: string
  guestApellido?: string
  guestTelefono?: string
  guestEmail?: string
  guestMensaje?: string
}

export type Appointment = {
  id: number
  vehicle_id: number
  employee_id: number
  client_id: number | null
  guest_nombre: string | null
  guest_apellido: string | null
  guest_telefono: string | null
  guest_email: string | null
  guest_mensaje: string | null
  fecha_hora: string
  estado: 'confirmada' | 'realizada' | 'cancelada' | 'no_asistio'
  notas: string | null
  created_at: string
}

export type AppointmentWithDetails = Appointment & {
  vehicle_marca: string
  vehicle_modelo: string
  vehicle_version: string | null
  employee_nombre: string
  employee_apellido: string
  portada_url: string | null
}

// ─── CREAR ───────────────────────────────────────────────────
export async function createAppointment(data: AppointmentInput): Promise<{ id: number } | { error: string }> {
  // Validar max 2 reservas activas por cliente
  if (data.clientId) {
    const active = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM appointments
       WHERE client_id = $1 AND estado = 'confirmada'`,
      [data.clientId]
    )
    if (active && parseInt(active.count) >= 2) {
      return { error: 'Ya tenés 2 reservas activas. Cancelá una para continuar.' }
    }
  }

  try {
    const result = await queryOne<{ id: number }>(
      `INSERT INTO appointments
         (vehicle_id, employee_id, fecha_hora, client_id,
          guest_nombre, guest_apellido, guest_telefono, guest_email, guest_mensaje)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        data.vehicleId,
        data.employeeId,
        data.fechaHora,
        data.clientId ?? null,
        data.guestNombre ?? null,
        data.guestApellido ?? null,
        data.guestTelefono ?? null,
        data.guestEmail ?? null,
        data.guestMensaje ?? null,
      ]
    )
    return { id: result!.id }
  } catch (err: unknown) {
    // Violación de unique index → solapamiento
    const msg = (err as { message?: string }).message ?? ''
    if (msg.includes('idx_appointments_vehicle_slot')) {
      return { error: 'Ese horario ya está reservado para este vehículo.' }
    }
    if (msg.includes('idx_appointments_employee_slot')) {
      return { error: 'Ese empleado ya tiene una reserva en ese horario.' }
    }
    throw err
  }
}

// ─── CANCELAR ────────────────────────────────────────────────
export async function cancelAppointment(
  appointmentId: number,
  clientId: number
): Promise<{ error?: string }> {
  const appt = await queryOne<{ fecha_hora: string; client_id: number; estado: string }>(
    `SELECT fecha_hora, client_id, estado FROM appointments WHERE id = $1`,
    [appointmentId]
  )
  if (!appt) return { error: 'Reserva no encontrada' }
  if (appt.client_id !== clientId) return { error: 'No autorizado' }
  if (appt.estado !== 'confirmada') return { error: 'Solo se pueden cancelar reservas confirmadas' }

  const { isCancellationAllowed } = await import('@/lib/scheduling/slots')
  if (!isCancellationAllowed(new Date(appt.fecha_hora))) {
    return { error: 'No se puede cancelar con menos de 30 minutos de anticipación' }
  }

  await query(
    `UPDATE appointments SET estado = 'cancelada', cancelled_at = NOW() WHERE id = $1`,
    [appointmentId]
  )
  return {}
}

// ─── RESERVAS DEL CLIENTE ────────────────────────────────────
export async function getClientAppointments(clientId: number): Promise<AppointmentWithDetails[]> {
  return query<AppointmentWithDetails>(
    `SELECT
       a.*,
       v.marca AS vehicle_marca,
       v.modelo AS vehicle_modelo,
       v.version AS vehicle_version,
       u.nombre AS employee_nombre,
       u.apellido AS employee_apellido,
       img.url AS portada_url,
       TO_CHAR(a.fecha_hora AT TIME ZONE $2, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_hora
     FROM appointments a
     JOIN vehicles v ON v.id = a.vehicle_id
     JOIN users u ON u.id = a.employee_id
     LEFT JOIN vehicle_images img ON img.vehicle_id = v.id AND img.es_portada = TRUE
     WHERE a.client_id = $1
     ORDER BY a.fecha_hora DESC`,
    [clientId, TZ]
  )
}
