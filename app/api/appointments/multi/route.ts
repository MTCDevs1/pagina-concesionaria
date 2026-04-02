import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createMultiAppointment } from '@/lib/db/appointments.multi'
import { MAX_VEHICLES_PER_VISIT } from '@/lib/scheduling/constants'
import { getAvailableSlotsForEmployee } from '@/lib/scheduling/availability'
import { isBookingAllowed } from '@/lib/scheduling/slots'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Debés iniciar sesión' }, { status: 401 })

  const { vehicleIds, employeeId, fecha, hora } = await req.json()

  if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
    return NextResponse.json({ error: 'Seleccioná al menos un vehículo' }, { status: 400 })
  }
  if (vehicleIds.length > MAX_VEHICLES_PER_VISIT) {
    return NextResponse.json({ error: `Máximo ${MAX_VEHICLES_PER_VISIT} vehículos por visita` }, { status: 400 })
  }
  if (!employeeId || !fecha || !hora) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  // Construir datetime en UTC (UY = UTC-3)
  const fechaHora = new Date(`${fecha}T${hora}:00`)
  fechaHora.setHours(fechaHora.getHours() + 3)

  if (!isBookingAllowed(fechaHora)) {
    return NextResponse.json({ error: 'No se puede reservar con menos de 30 minutos de anticipación' }, { status: 400 })
  }

  // Verificar disponibilidad del empleado
  const slots = await getAvailableSlotsForEmployee(Number(employeeId), new Date(`${fecha}T00:00:00Z`))
  if (!slots.includes(hora)) {
    return NextResponse.json({ error: 'El horario seleccionado no está disponible' }, { status: 409 })
  }

  const result = await createMultiAppointment({
    vehicleIds: vehicleIds.map(Number),
    employeeId: Number(employeeId),
    fechaHora,
    clientId: session.id,
  })

  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 409 })
  return NextResponse.json({ id: result.id }, { status: 201 })
}
