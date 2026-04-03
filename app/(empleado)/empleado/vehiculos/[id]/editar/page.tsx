export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getVehicleById } from '@/lib/db/vehicles'
import VehicleForm from '@/components/admin/VehicleForm'

export default async function EditarVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicleById(Number(id))
  if (!vehicle) notFound()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-8">
        Editar — {vehicle.marca} {vehicle.modelo}
      </h1>
      <VehicleForm initial={{
        ...vehicle,
        version: vehicle.version ?? undefined,
        descripcion: vehicle.descripcion ?? undefined,
        tipo: vehicle.tipo ?? undefined,
        orden_destacado: vehicle.orden_destacado ?? null,
      }} />
    </div>
  )
}
