export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVehicleById } from '@/lib/db/vehicles'
import VehicleGallery from '@/components/vehicles/VehicleGallery'
import Navbar from '@/components/ui/Navbar'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

const SPECS = [
  { label: 'Año', key: 'anio' },
  { label: 'Kilometraje', key: 'kilometraje', format: (v: number) => v === 0 ? '0 km' : `${v.toLocaleString('es-UY')} km` },
  { label: 'Combustible', key: 'combustible' },
  { label: 'Transmisión', key: 'transmision' },
  { label: 'Color', key: 'color' },
] as const

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicleById(Number(id))
  if (!vehicle) notFound()

  const name = [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(' ')

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/catalogo" className="hover:text-gray-900">Catálogo</Link>
          <span>/</span>
          <span className="text-gray-900">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Galería */}
          <VehicleGallery images={vehicle.images} name={name} />

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="mt-3 text-3xl font-bold text-gray-900">{formatPrice(vehicle.precio)}</p>
            </div>

            {/* Especificaciones */}
            <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {SPECS.map(spec => {
                const raw = vehicle[spec.key as keyof typeof vehicle]
                const value = 'format' in spec ? spec.format(raw as number) : raw
                return (
                  <div key={spec.label} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-500">{spec.label}</span>
                    <span className="font-medium text-gray-900">{String(value)}</span>
                  </div>
                )
              })}
            </div>

            {/* Descripción */}
            {vehicle.descripcion && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Descripción</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {vehicle.descripcion}
                </p>
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/reservar?vehiculo=${vehicle.id}`}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Reservar visita
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
