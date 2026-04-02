import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createVehicle } from '@/lib/db/vehicles.admin'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { marca, modelo, anio, precio, kilometraje, combustible, transmision, color } = body

  if (!marca || !modelo || !anio || !precio || kilometraje === undefined || !combustible || !transmision || !color) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const id = await createVehicle({
    marca, modelo,
    version: body.version,
    anio: Number(anio),
    precio: Number(precio),
    kilometraje: Number(kilometraje),
    combustible, transmision, color,
    descripcion: body.descripcion,
    destacado: body.destacado ?? false,
    orden_destacado: body.orden_destacado ?? null,
  })

  return NextResponse.json({ id }, { status: 201 })
}
