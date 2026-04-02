import { NextRequest, NextResponse } from 'next/server'
import { getAvailableEmployeesForDate } from '@/lib/db/employees'
import { getAvailableSlotsForEmployee, getBookedSlotsForVehicle } from '@/lib/scheduling/availability'
import { MAX_BOOKING_DAYS } from '@/lib/scheduling/slots'

// GET /api/availability?date=YYYY-MM-DD&employeeId=1&vehicleId=2
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const dateStr = searchParams.get('date')
  const employeeId = searchParams.get('employeeId')
  const vehicleId = searchParams.get('vehicleId')

  if (!dateStr) {
    return NextResponse.json({ error: 'date requerido' }, { status: 400 })
  }

  const fecha = new Date(`${dateStr}T00:00:00Z`)
  const now = new Date()

  // Validar ventana de 14 días
  const maxDate = new Date(now)
  maxDate.setDate(maxDate.getDate() + MAX_BOOKING_DAYS)
  if (fecha > maxDate || fecha < new Date(now.toISOString().split('T')[0] + 'T00:00:00Z')) {
    return NextResponse.json({ error: 'Fecha fuera del rango permitido' }, { status: 400 })
  }

  // Si pide empleados disponibles para esa fecha
  if (!employeeId) {
    const employees = await getAvailableEmployeesForDate(fecha)
    return NextResponse.json({ employees })
  }

  // Si pide turnos para empleado + vehículo
  const [slots, vehicleBooked] = await Promise.all([
    getAvailableSlotsForEmployee(Number(employeeId), fecha),
    vehicleId ? getBookedSlotsForVehicle(Number(vehicleId), fecha) : Promise.resolve(new Set<string>()),
  ])

  // Filtrar turnos donde el vehículo ya está reservado
  const available = slots.filter(s => !vehicleBooked.has(s))

  return NextResponse.json({ slots: available })
}
