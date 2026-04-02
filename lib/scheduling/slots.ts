// Zona horaria Uruguay
export const TZ = 'America/Montevideo'

// Duración visible: 45 min | Bloqueo real: 1 hora
export const SLOT_DURATION_MIN = 60
export const MAX_BOOKING_DAYS = 14
export const MIN_MINUTES_BEFORE = 30

/**
 * Genera los horarios disponibles dado un rango de trabajo y una pausa.
 * Los turnos empiezan 30 min después del inicio.
 * El último turno debe terminar (bloqueo de 1h) antes del fin de jornada.
 *
 * Ejemplo: 09:00–14:00 → [09:30, 10:30, 11:30, 12:30, 13:30]
 */
export function generateSlots(
  startHour: number, // e.g. 9
  startMin: number,  // e.g. 0
  endHour: number,   // e.g. 14
  endMin: number     // e.g. 0
): string[] {
  const slots: string[] = []

  // Primer turno: inicio + 30 min
  let current = startHour * 60 + startMin + 30
  const endTotal = endHour * 60 + endMin

  // El turno debe terminar (current + 60 min) antes o en el fin
  while (current + SLOT_DURATION_MIN <= endTotal) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += SLOT_DURATION_MIN
  }

  return slots
}

/**
 * Verifica si una reserva puede hacerse (hasta 30 min antes del turno).
 */
export function isBookingAllowed(slotDatetime: Date, now: Date = new Date()): boolean {
  const diff = slotDatetime.getTime() - now.getTime()
  return diff >= MIN_MINUTES_BEFORE * 60 * 1000
}

/**
 * Verifica si una cancelación es válida (hasta 30 min antes del turno).
 */
export function isCancellationAllowed(slotDatetime: Date, now: Date = new Date()): boolean {
  return isBookingAllowed(slotDatetime, now)
}
