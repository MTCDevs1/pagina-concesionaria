import Link from 'next/link'
import Image from 'next/image'
import type { Vehicle } from '@/lib/db/vehicles'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

const ESTADO_BADGE: Record<string, { label: string; cls: string }> = {
  disponible: { label: 'Disponible', cls: 'bg-green-500/15 text-green-400 border border-green-500/25' },
  reservado:  { label: 'Reservado',  cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/25' },
  vendido:    { label: 'Vendido',    cls: 'bg-red-500/12 text-red-400 border border-red-500/20' },
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const name  = [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(' ')
  const badge = ESTADO_BADGE[vehicle.estado_comercial] ?? ESTADO_BADGE.disponible

  return (
    <article className="group bg-[#1E293B] rounded-2xl border border-[#334155] overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40 hover:border-blue-500/30 transition-all duration-250">
      <Link href={`/vehiculo/${vehicle.id}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-[16/10] bg-[#0F172A] overflow-hidden">
          {vehicle.portada_url ? (
            <Image
              src={vehicle.portada_url}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#475569] text-sm">Sin imagen</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${badge.cls}`}>
              {badge.label}
            </span>
            {vehicle.tipo && (
              <span className="rounded-full bg-[#1E293B]/80 border border-[#334155] px-2.5 py-0.5 text-xs font-medium text-[#94A3B8] backdrop-blur-sm">
                {vehicle.tipo}
              </span>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 pb-4">
          <h3 className="font-semibold text-[#F1F5F9] text-sm leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
            {name}
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">{vehicle.anio}</p>

          <p className="mt-3 text-xl font-bold text-white">
            {formatPrice(vehicle.precio)}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {[vehicle.combustible, vehicle.transmision,
              vehicle.kilometraje === 0 ? '0 km' : `${vehicle.kilometraje.toLocaleString('es-UY')} km`
            ].map(tag => (
              <span key={tag} className="rounded-lg bg-[#334155] px-2.5 py-1 text-xs text-[#94A3B8] font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <Link
          href={`/vehiculo/${vehicle.id}`}
          className="block w-full rounded-xl border border-[#334155] py-2.5 text-center text-sm font-semibold text-[#94A3B8] hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-blue-400 transition-all duration-200"
        >
          Ver detalle →
        </Link>
      </div>
    </article>
  )
}
