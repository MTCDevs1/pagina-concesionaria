export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getVehicles, getFilterOptions } from '@/lib/db/vehicles'
import VehicleCard from '@/components/vehicles/VehicleCard'
import VehicleFilters from '@/components/vehicles/VehicleFilters'
import Navbar from '@/components/ui/Navbar'

type SearchParams = {
  marca?: string; combustible?: string; transmision?: string; tipo?: string
  anio_min?: string; anio_max?: string; precio_max?: string; km_max?: string; q?: string
}

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [vehicles, options] = await Promise.all([
    getVehicles({
      marca: params.marca, combustible: params.combustible,
      transmision: params.transmision, tipo: params.tipo,
      anio_min:   params.anio_min   ? Number(params.anio_min)   : undefined,
      anio_max:   params.anio_max   ? Number(params.anio_max)   : undefined,
      precio_max: params.precio_max ? Number(params.precio_max) : undefined,
      km_max:     params.km_max     ? Number(params.km_max)     : undefined,
      q: params.q,
    }),
    getFilterOptions(),
  ])

  return (
    <>
      <Navbar />

      {/* Header de sección */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Explorar</p>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de vehículos</h1>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex gap-8 items-start">

          {/* Sidebar filtros */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <Suspense>
                <VehicleFilters
                  marcas={options.marcas}
                  combustibles={options.combustibles}
                  transmisiones={options.transmisiones}
                  years={options.years}
                  tipos={options.tipos}
                />
              </Suspense>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-semibold text-slate-700">Sin resultados</p>
                <p className="text-sm text-slate-400 mt-1">Probá con otros filtros</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  {vehicles.length} {vehicles.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {vehicles.map((v, i) => (
                    <div key={v.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}>
                      <VehicleCard vehicle={v} />
                    </div>
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
