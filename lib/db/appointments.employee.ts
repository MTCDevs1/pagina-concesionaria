import { query, queryOne } from './client'
import { TZ } from '@/lib/scheduling/slots'

export type AppointmentEmployee = {
  id: number
  vehicle_id: number
  vehicle_marca: string
  vehicle_modelo: string
  vehicle_version: string | null
  client_id: number | null
  client_nombre: string | null
  client_apellido: string | null
  client_telefono: string | null
  client_email: string | null
  guest_nombre: string | null
  guest_apellido: string | null
  guest_telefono: string | null
  guest_email: string | null
  guest_mensaje: string | null
  fecha_hora: string
  estado: 'confirmada' | 'realizada' | 'cancelada' | 'no_asistio'
  notas: string | null
}

/** Reservas de un empleado en un rango de fechas */
export async function getEmployeeAppointments(
  employeeId: number,
  from: string,
  to: string
): Promise<AppointmentEmployee[]> {
  return query<AppointmentEmployee>(
    `SELECT
       a.id, a.vehicle_id, a.client_id, a.estado, a.notas,
       a.guest_nombre, a.guest_apellido, a.guest_telefono, a.guest_email, a.guest_mensaje,
       v.marca AS vehicle_marca, v.modelo AS vehicle_modelo, v.version AS vehicle_version,
       u.nombre AS client_nombre, u.apellido AS client_apellido,
       u.telefono AS client_telefono, u.email AS client_email,
       TO_CHAR(a.fecha_hora AT TIME ZONE $4, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_hora
     FROM appointments a
     JOIN vehicles v ON v.id = a.vehicle_id
     LEFT JOIN users u ON u.id = a.client_id
     WHERE a.employee_id = $1
       AND (a.fecha_hora AT TIME ZONE $4)::date BETWEEN $2 AND $3
     ORDER BY a.fecha_hora ASC`,
    [employeeId, from, to, TZ]
  )
}

/** Todas las reservas (para admin) en un rango */
export async function getAllAppointments(from: string, to: string): Promise<(AppointmentEmployee & { employee_nombre: string; employee_apellido: string })[]> {
  return query(
    `SELECT
       a.id, a.vehicle_id, a.client_id, a.employee_id, a.estado, a.notas,
       a.guest_nombre, a.guest_apellido, a.guest_telefono, a.guest_email, a.guest_mensaje,
       v.marca AS vehicle_marca, v.modelo AS vehicle_modelo, v.version AS vehicle_version,
       u.nombre AS client_nombre, u.apellido AS client_apellido,
       u.telefono AS client_telefono, u.email AS client_email,
       emp.nombre AS employee_nombre, emp.apellido AS employee_apellido,
       TO_CHAR(a.fecha_hora AT TIME ZONE $3, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_hora
     FROM appointments a
     JOIN vehicles v ON v.id = a.vehicle_id
     LEFT JOIN users u ON u.id = a.client_id
     JOIN users emp ON emp.id = a.employee_id
     WHERE (a.fecha_hora AT TIME ZONE $3)::date BETWEEN $1 AND $2
     ORDER BY a.fecha_hora ASC`,
    [from, to, TZ]
  )
}

/** Actualizar estado y/o notas de una reserva */
export async function updateAppointmentStatus(
  appointmentId: number,
  estado: 'realizada' | 'cancelada' | 'no_asistio',
  notas?: string
) {
  await queryOne(
    `UPDATE appointments
     SET estado = $1, notas = COALESCE($2, notas),
         cancelled_at = CASE WHEN $1 = 'cancelada' THEN NOW() ELSE cancelled_at END
     WHERE id = $3`,
    [estado, notas ?? null, appointmentId]
  )
}

/** Reservas futuras afectadas por la indisponibilidad de un empleado en una fecha */
export async function getAffectedAppointments(employeeId: number, fecha: string) {
  return query<AppointmentEmployee>(
    `SELECT
       a.id, a.vehicle_id, a.client_id, a.estado, a.notas,
       a.guest_nombre, a.guest_apellido, a.guest_telefono, a.guest_email, a.guest_mensaje,
       v.marca AS vehicle_marca, v.modelo AS vehicle_modelo, v.version AS vehicle_version,
       u.nombre AS client_nombre, u.apellido AS client_apellido,
       u.telefono AS client_telefono, u.email AS client_email,
       TO_CHAR(a.fecha_hora AT TIME ZONE $3, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_hora
     FROM appointments a
     JOIN vehicles v ON v.id = a.vehicle_id
     LEFT JOIN users u ON u.id = a.client_id
     WHERE a.employee_id = $1
       AND (a.fecha_hora AT TIME ZONE $3)::date = $2
       AND a.estado = 'confirmada'`,
    [employeeId, fecha, TZ]
  )
}

/** Cancelar todas las reservas de un empleado en una fecha (por excepción) */
export async function cancelAppointmentsByDate(employeeId: number, fecha: string) {
  await query(
    `UPDATE appointments
     SET estado = 'cancelada', cancelled_at = NOW()
     WHERE employee_id = $1
       AND (fecha_hora AT TIME ZONE $3)::date = $2
       AND estado = 'confirmada'`,
    [employeeId, fecha, TZ]
  )
}
