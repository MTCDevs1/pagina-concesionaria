export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVehicleById } from '@/lib/db/vehicles'
import VehicleGallery from '@/components/vehicles/VehicleGallery'
import Navbar from '@/components/ui/Navbar'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

const ESTADO_BADGE: Record<string, { label: string; cls: string }> = {
  disponible: { label: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reservado:  { label: 'Reservado',  cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
  vendido:    { label: 'Vendido',    cls: 'bg-rose-50   text-rose-600   border-rose-200'   },
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicleById(Number(id))
  if (!vehicle) notFound()

  const name  = [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(' ')
  const badge = ESTADO_BADGE[vehicle.estado_comercial] ?? ESTADO_BADGE.disponible

  const specs = [
    ...(vehicle.tipo        ? [{ label: 'Tipo',        value: vehicle.tipo }] : []),
    { label: 'Año',          value: String(vehicle.anio) },
    { label: 'Kilometraje',  value: vehicle.kilometraje === 0 ? '0 km' : `${vehicle.kilometraje.toLocaleString('es-UY')} km` },
    { label: 'Combustible',  value: vehicle.combustible },
    { label: 'Transmisión',  value: vehicle.transmision },
    { label: 'Color',        value: vehicle.color },
  ]

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link href="/catalogo" className="hover:text-slate-700 transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
          {/* Galería */}
          <VehicleGallery images={vehicle.images} name={name} />

          {/* Info */}
          <div className="space-y-6">
            {/* Estado + nombre */}
            <div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mb-3 ${badge.cls}`}>
                {badge.label}
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
              <p className="mt-3 text-3xl font-bold text-slate-900">{formatPrice(vehicle.precio)}</p>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex justify-between px-5 py-3.5 text-sm ${i < specs.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <span className="text-slate-500">{spec.label}</span>
                  <span className="font-semibold text-slate-900">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Descripción */}
            {vehicle.descripcion && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">Descripción</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {vehicle.descripcion}
                </p>
              </div>
            )}

            {/* CTA */}
            {vehicle.estado_comercial !== 'vendido' ? (
              <Link
                href={`/reservar?vehiculo=${vehicle.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all duration-200"
              >
                <span>📅</span>
                Reservar visita
              </Link>
            ) : (
              <div className="flex w-full items-center justify-center rounded-2xl bg-slate-100 px-6 py-4 text-sm font-semibold text-slate-400 cursor-not-allowed">
                Vehículo no disponible
              </div>
            )}

            <p className="text-center text-xs text-slate-400">
              Visita de 45 min · Sin compromiso de compra · Cancelable hasta 30 min antes
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
