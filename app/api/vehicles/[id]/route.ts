import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { updateVehicle, deleteVehicle, addVehicleImage, deleteVehicleImage, setPortada, updateImageOrder } from '@/lib/db/vehicles.admin'
import { logAudit, getIp } from '@/lib/db/audit'

function requireEmployee(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session || !['empleado', 'admin'].includes(session.role)) return false
  return true
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!requireEmployee(session)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Operaciones de imágenes
  if (body.action === 'add_image') {
    await addVehicleImage(Number(id), body.url, body.es_portada ?? false, body.orden ?? 0)
    return NextResponse.json({ ok: true })
  }
  if (body.action === 'delete_image') {
    await deleteVehicleImage(Number(body.imageId))
    return NextResponse.json({ ok: true })
  }
  if (body.action === 'set_portada') {
    await setPortada(Number(body.imageId), Number(id))
    return NextResponse.json({ ok: true })
  }
  if (body.action === 'reorder_image') {
    await updateImageOrder(Number(body.imageId), Number(body.orden))
    return NextResponse.json({ ok: true })
  }

  // Actualizar datos del vehículo
  const allowed = ['marca','modelo','version','anio','precio','kilometraje','combustible','transmision','color','descripcion','destacado','orden_destacado']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  await updateVehicle(Number(id), data)
  await logAudit({ action: 'UPDATE', entityType: 'vehicles', entityId: Number(id), userId: session!.id, newData: data, ip: getIp(req) })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!requireEmployee(session)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const result = await deleteVehicle(Number(id))
  if (result.error) return NextResponse.json({ error: result.error }, { status: 409 })
  await logAudit({ action: 'DELETE', entityType: 'vehicles', entityId: Number(id), userId: session!.id, ip: getIp(_req) })
  return NextResponse.json({ ok: true })
}
