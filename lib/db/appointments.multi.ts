import { query, queryOne } from './client'
import { TZ } from '@/lib/scheduling/slots'
export { MAX_VEHICLES_PER_VISIT } from '@/lib/scheduling/constants'
import { MAX_VEHICLES_PER_VISIT } from '@/lib/scheduling/constants'

export type MultiBookingInput = {
  vehicleIds: number[]      // [1..3] el primero es el principal
  employeeId: number
  fechaHora: Date
  clientId: number
}

export async function createMultiAppointment(
  data: MultiBookingInput
): Promise<{ id: number } | { error: string }> {
  if (data.vehicleIds.length < 1 || data.vehicleIds.length > MAX_VEHICLES_PER_VISIT) {
    return { error: `Podés seleccionar entre 1 y ${MAX_VEHICLES_PER_VISIT} vehículos` }
  }

  // Max 2 reservas activas
  const active = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM appointments
     WHERE client_id = $1 AND estado = 'confirmada'`,
    [data.clientId]
  )
  if (active && parseInt(active.count) >= 2) {
    return { error: 'Ya tenés 2 reservas activas. Cancelá una para continuar.' }
  }

  // Verificar que ningún vehículo tenga ese horario ocupado
  const fechaStr = new Date(data.fechaHora).toLocaleDateString('en-CA', { timeZone: TZ })
  for (const vehicleId of data.vehicleIds) {
    const conflict = await queryOne(
      `SELECT 1 FROM appointments
       WHERE vehicle_id = $1 AND fecha_hora = $2 AND estado != 'cancelada'`,
      [vehicleId, data.fechaHora]
    )
    if (conflict) {
      const v = await queryOne<{ marca: string; modelo: string }>(
        'SELECT marca, modelo FROM vehicles WHERE id = $1',
        [vehicleId]
      )
      return { error: `El ${v?.marca} ${v?.modelo} ya tiene una reserva en ese horario` }
    }

    // También verificar vehículos en appointment_vehicles
    const conflictExtra = await queryOne(
      `SELECT 1 FROM appointment_vehicles av
       JOIN appointments a ON a.id = av.appointment_id
       WHERE av.vehicle_id = $1 AND a.fecha_hora = $2 AND a.estado != 'cancelada'`,
      [vehicleId, data.fechaHora]
    )
    if (conflictExtra) {
      const v = await queryOne<{ marca: string; modelo: string }>(
        'SELECT marca, modelo FROM vehicles WHERE id = $1',
        [vehicleId]
      )
      return { error: `El ${v?.marca} ${v?.modelo} ya tiene una reserva en ese horario` }
    }
    void fechaStr
  }

  // Crear la reserva con el primer vehículo como principal
  let appointmentId: number
  try {
    const result = await queryOne<{ id: number }>(
      `INSERT INTO appointments (vehicle_id, employee_id, fecha_hora, client_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [data.vehicleIds[0], data.employeeId, data.fechaHora, data.clientId]
    )
    appointmentId = result!.id
  } catch (err: unknown) {
    const msg = (err as { message?: string }).message ?? ''
    if (msg.includes('idx_appointments_employee_slot')) {
      return { error: 'Ese empleado ya tiene una reserva en ese horario' }
    }
    throw err
  }

  // Insertar vehículos adicionales
  for (const vehicleId of data.vehicleIds.slice(1)) {
    await query(
      `INSERT INTO appointment_vehicles (appointment_id, vehicle_id) VALUES ($1, $2)`,
      [appointmentId, vehicleId]
    )
  }

  return { id: appointmentId }
}

/** Reservas del cliente con vehículos adicionales incluidos */
export async function getClientAppointmentsFull(clientId: number) {
  const appointments = await query<{
    id: number; vehicle_id: number; employee_id: number
    vehicle_marca: string; vehicle_modelo: string; vehicle_version: string | null
    employee_nombre: string; employee_apellido: string
    portada_url: string | null; fecha_hora: string
    estado: string; notas: string | null
  }>(
    `SELECT
       a.id, a.vehicle_id, a.employee_id, a.estado, a.notas,
       v.marca AS vehicle_marca, v.modelo AS vehicle_modelo, v.version AS vehicle_version,
       u.nombre AS employee_nombre, u.apellido AS employee_apellido,
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

  // Cargar vehículos adicionales para cada reserva
  const withExtras = await Promise.all(
    appointments.map(async a => {
      const extras = await query<{
        vehicle_id: number; marca: string; modelo: string
        version: string | null; portada_url: string | null
      }>(
        `SELECT av.vehicle_id, v.marca, v.modelo, v.version, img.url AS portada_url
         FROM appointment_vehicles av
         JOIN vehicles v ON v.id = av.vehicle_id
         LEFT JOIN vehicle_images img ON img.vehicle_id = v.id AND img.es_portada = TRUE
         WHERE av.appointment_id = $1`,
        [a.id]
      )
      return { ...a, extra_vehicles: extras }
    })
  )

  return withExtras
}
