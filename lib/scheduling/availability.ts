import { query } from '@/lib/db/client'
import { getEmployeeAvailability, hasException } from '@/lib/db/employees'
import { generateSlots, isBookingAllowed, TZ } from './slots'

/**
 * Retorna los turnos disponibles para un empleado en una fecha.
 * Descuenta los ya reservados y los que ya pasaron (o están a menos de 30 min).
 */
export async function getAvailableSlotsForEmployee(
  employeeId: number,
  fecha: Date // medianoche en UTC, la fecha que el usuario eligió
): Promise<string[]> {
  const fechaStr = fecha.toISOString().split('T')[0]

  // ¿Tiene excepción ese día?
  const exception = await hasException(employeeId, fechaStr)
  if (exception) return []

  // ¿Trabaja ese día?
  const diaSemana = getDiaSemanaUY(fecha)
  const availability = await getEmployeeAvailability(employeeId, diaSemana)
  if (!availability) return []

  // Parsear hora inicio/fin
  const [startH, startM] = availability.hora_inicio.split(':').map(Number)
  const [endH, endM] = availability.hora_fin.split(':').map(Number)

  const allSlots = generateSlots(startH, startM, endH, endM)

  // Turnos ya reservados ese día para ese empleado
  const booked = await query<{ slot_time: string }>(
    `SELECT TO_CHAR(fecha_hora AT TIME ZONE $1, 'HH24:MI') AS slot_time
     FROM appointments
     WHERE employee_id = $2
       AND fecha_hora::date = $3::date
       AND estado != 'cancelada'`,
    [TZ, employeeId, fechaStr]
  )
  const bookedSet = new Set(booked.map(r => r.slot_time))

  // Filtrar turnos ocupados y pasados
  const now = new Date()
  return allSlots.filter(slot => {
    if (bookedSet.has(slot)) return false

    // Construir datetime del turno en Uruguay
    const [h, m] = slot.split(':').map(Number)
    const slotDate = toUYDatetime(fecha, h, m)
    return isBookingAllowed(slotDate, now)
  })
}

/**
 * Retorna los turnos disponibles para un vehículo en una fecha
 * (para validar el constraint de vehículo+horario).
 */
export async function getBookedSlotsForVehicle(
  vehicleId: number,
  fecha: Date
): Promise<Set<string>> {
  const fechaStr = fecha.toISOString().split('T')[0]
  const booked = await query<{ slot_time: string }>(
    `SELECT TO_CHAR(fecha_hora AT TIME ZONE $1, 'HH24:MI') AS slot_time
     FROM appointments
     WHERE vehicle_id = $2
       AND fecha_hora::date = $3::date
       AND estado != 'cancelada'`,
    [TZ, vehicleId, fechaStr]
  )
  return new Set(booked.map(r => r.slot_time))
}

// ─── Helpers ─────────────────────────────────────────────────

/** Día de la semana en hora Uruguay (0=domingo) */
function getDiaSemanaUY(fecha: Date): number {
  const uyStr = fecha.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'short' })
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[uyStr] ?? fecha.getDay()
}

/** Crea un Date UTC que corresponde a hora:min en zona Uruguay */
function toUYDatetime(fecha: Date, hour: number, min: number): Date {
  const dateStr = fecha.toISOString().split('T')[0]
  // Crear string ISO en zona Uruguay y convertir a UTC
  const localStr = `${dateStr}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`
  // Usamos Intl para obtener el offset UY en esa fecha
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  // Aproximación: parsear como si fuera hora local UY
  // UY es UTC-3 (sin DST desde 2015)
  const utcDate = new Date(`${localStr}+00:00`)
  utcDate.setHours(utcDate.getHours() + 3) // UTC-3 → sumar 3 para pasar a UTC
  void formatter // satisfacer linter
  return utcDate
}
