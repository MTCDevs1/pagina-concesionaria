import Link from 'next/link'
import Image from 'next/image'
import type { Vehicle } from '@/lib/db/vehicles'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

const ESTADO_BADGE: Record<string, { label: string; cls: string }> = {
  disponible: { label: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reservado:  { label: 'Reservado',  cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
  vendido:    { label: 'Vendido',    cls: 'bg-rose-50   text-rose-600   border-rose-200'   },
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const name  = [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(' ')
  const badge = ESTADO_BADGE[vehicle.estado_comercial] ?? ESTADO_BADGE.disponible

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
      <Link href={`/vehiculo/${vehicle.id}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
          {vehicle.portada_url ? (
            <Image
              src={vehicle.portada_url}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">Sin imagen</div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${badge.cls}`}>
              {badge.label}
            </span>
            {vehicle.tipo && (
              <span className="rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-700 backdrop-blur-sm">
                {vehicle.tipo}
              </span>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{vehicle.anio}</p>

          <p className="mt-3 text-xl font-bold text-slate-900">
            {formatPrice(vehicle.precio)}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {[vehicle.combustible, vehicle.transmision,
              vehicle.kilometraje === 0 ? '0 km' : `${vehicle.kilometraje.toLocaleString('es-UY')} km`
            ].map(tag => (
              <span key={tag} className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <Link
          href={`/vehiculo/${vehicle.id}`}
          className="block w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
        >
          Ver detalle →
        </Link>
      </div>
    </article>
  )
}
