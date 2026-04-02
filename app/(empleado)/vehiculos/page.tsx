export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getAllVehiclesAdmin } from '@/lib/db/vehicles.admin'
import VehicleAdminTable from '@/components/admin/VehicleAdminTable'

export default async function VehiculosPage() {
  const vehicles = await getAllVehiclesAdmin()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
        <Link
          href="/empleado/vehiculos/nuevo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + Nuevo vehículo
        </Link>
      </div>
      <VehicleAdminTable vehicles={vehicles} />
    </div>
  )
}
