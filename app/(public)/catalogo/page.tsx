export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getVehicles, getFilterOptions } from '@/lib/db/vehicles'
import VehicleCard from '@/components/vehicles/VehicleCard'
import VehicleFilters from '@/components/vehicles/VehicleFilters'
import Navbar from '@/components/ui/Navbar'

type SearchParams = {
  marca?: string
  combustible?: string
  transmision?: string
  anio_min?: string
  anio_max?: string
  precio_max?: string
  km_max?: string
  q?: string
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [vehicles, options] = await Promise.all([
    getVehicles({
      marca: params.marca,
      combustible: params.combustible,
      transmision: params.transmision,
      anio_min: params.anio_min ? Number(params.anio_min) : undefined,
      anio_max: params.anio_max ? Number(params.anio_max) : undefined,
      precio_max: params.precio_max ? Number(params.precio_max) : undefined,
      km_max: params.km_max ? Number(params.km_max) : undefined,
      q: params.q,
    }),
    getFilterOptions(),
  ])

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Catálogo de vehículos</h1>

        <div className="flex gap-8">
          {/* Sidebar filtros */}
          <div className="hidden lg:block w-56 shrink-0">
            <Suspense>
              <VehicleFilters
                marcas={options.marcas}
                combustibles={options.combustibles}
                transmisiones={options.transmisiones}
                years={options.years}
              />
            </Suspense>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <p className="text-lg font-medium">No se encontraron vehículos</p>
                <p className="text-sm mt-1">Probá con otros filtros</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  {vehicles.length} {vehicles.length === 1 ? 'vehículo' : 'vehículos'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vehicles.map(v => (
                    <VehicleCard key={v.id} vehicle={v} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
