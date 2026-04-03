import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createAppointment } from '@/lib/db/appointments'
import { getAvailableSlotsForEmployee, getBookedSlotsForVehicle } from '@/lib/scheduling/availability'
import { isBookingAllowed, TZ } from '@/lib/scheduling/slots'
import { queryOne } from '@/lib/db/client'
import { logAudit, getIp } from '@/lib/db/audit'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    vehicleId, employeeId, fecha, hora,
    nombre, apellido, telefono, email, mensaje,
  } = body

  // Validaciones básicas
  if (!vehicleId || !employeeId || !fecha || !hora) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  // Verificar que el vehículo existe y no está eliminado
  const vehicle = await queryOne('SELECT id FROM vehicles WHERE id = $1 AND deleted_at IS NULL', [vehicleId])
  if (!vehicle) return NextResponse.json({ error: 'Vehículo no disponible' }, { status: 400 })

  // Construir datetime del turno en UTC (UY = UTC-3)
  const [h, m] = (hora as string).split(':').map(Number)
  const fechaHora = new Date(`${fecha}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
  fechaHora.setHours(fechaHora.getHours() + 3) // UY UTC-3 → UTC
  void TZ

  if (!isBookingAllowed(fechaHora)) {
    return NextResponse.json({ error: 'No se puede reservar con menos de 30 minutos de anticipación' }, { status: 400 })
  }

  // Verificar disponibilidad real del turno
  const [availableSlots, vehicleBooked] = await Promise.all([
    getAvailableSlotsForEmployee(Number(employeeId), new Date(`${fecha}T00:00:00Z`)),
    getBookedSlotsForVehicle(Number(vehicleId), new Date(`${fecha}T00:00:00Z`)),
  ])

  if (!availableSlots.includes(hora)) {
    return NextResponse.json({ error: 'El horario seleccionado no está disponible' }, { status: 409 })
  }
  if (vehicleBooked.has(hora)) {
    return NextResponse.json({ error: 'Ese horario ya está reservado para este vehículo' }, { status: 409 })
  }

  // ¿Está logueado?
  const session = await getSession()

  if (session) {
    const result = await createAppointment({
      vehicleId: Number(vehicleId),
      employeeId: Number(employeeId),
      fechaHora,
      clientId: session.id,
    })
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 409 })
    await logAudit({ action: 'CREATE', entityType: 'appointments', entityId: result.id, userId: session.id, newData: { vehicleId, employeeId, fecha, hora }, ip: getIp(req) })
    return NextResponse.json({ id: result.id }, { status: 201 })
  }

  // Visitante: requiere datos
  if (!nombre || !apellido || !telefono || !email) {
    return NextResponse.json({ error: 'Completá todos los campos requeridos' }, { status: 400 })
  }

  const result = await createAppointment({
    vehicleId: Number(vehicleId),
    employeeId: Number(employeeId),
    fechaHora,
    guestNombre: nombre,
    guestApellido: apellido,
    guestTelefono: telefono,
    guestEmail: email,
    guestMensaje: mensaje,
  })
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 409 })
  await logAudit({ action: 'CREATE', entityType: 'appointments', entityId: result.id, newData: { vehicleId, employeeId, fecha, hora, guestEmail: email }, ip: getIp(req) })
  return NextResponse.json({ id: result.id }, { status: 201 })
}
