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
  disponible: { label: 'Disponible', cls: 'bg-green-500/15 text-green-400 border border-green-500/25' },
  reservado:  { label: 'Reservado',  cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/25' },
  vendido:    { label: 'Vendido',    cls: 'bg-red-500/12 text-red-400 border border-red-500/20' },
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicleById(Number(id))
  if (!vehicle) notFound()

  const name  = [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(' ')
  const badge = ESTADO_BADGE[vehicle.estado_comercial] ?? ESTADO_BADGE.disponible

  const specs = [
    ...(vehicle.tipo ? [{ label: 'Tipo', value: vehicle.tipo }] : []),
    { label: 'Año',         value: String(vehicle.anio) },
    { label: 'Kilometraje', value: vehicle.kilometraje === 0 ? '0 km' : `${vehicle.kilometraje.toLocaleString('es-UY')} km` },
    { label: 'Combustible', value: vehicle.combustible },
    { label: 'Transmisión', value: vehicle.transmision },
    { label: 'Color',       value: vehicle.color },
  ]

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64748B] mb-8">
          <Link href="/catalogo" className="hover:text-[#94A3B8] transition-colors">Catálogo</Link>
          <span className="text-[#334155]">/</span>
          <span className="text-[#94A3B8] font-medium">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
          {/* Galería */}
          <VehicleGallery images={vehicle.images} name={name} />

          {/* Info */}
          <div className="space-y-6">
            {/* Estado + nombre */}
            <div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-4 ${badge.cls}`}>
                {badge.label}
              </span>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <p className="mt-4 text-4xl font-bold text-white">{formatPrice(vehicle.precio)}</p>
            </div>

            {/* Specs */}
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] overflow-hidden">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex justify-between px-5 py-3.5 text-sm ${i < specs.length - 1 ? 'border-b border-[#334155]' : ''}`}
                >
                  <span className="text-[#64748B]">{spec.label}</span>
                  <span className="font-semibold text-[#F1F5F9]">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Descripción */}
            {vehicle.descripcion && (
              <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5">
                <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Descripción</h2>
                <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-line">
                  {vehicle.descripcion}
                </p>
              </div>
            )}

            {/* CTA */}
            {vehicle.estado_comercial !== 'vendido' ? (
              <Link
                href={`/reservar?vehiculo=${vehicle.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>📅</span>
                Reservar visita
              </Link>
            ) : (
              <div className="flex w-full items-center justify-center rounded-2xl bg-[#1E293B] px-6 py-4 text-sm font-semibold text-[#64748B] cursor-not-allowed border border-[#334155]">
                Vehículo no disponible
              </div>
            )}

            <p className="text-center text-xs text-[#475569]">
              Visita de 45 min · Sin compromiso de compra · Cancelable hasta 30 min antes
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
