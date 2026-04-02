import Link from 'next/link'
import Image from 'next/image'
import type { Vehicle } from '@/lib/db/vehicles'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const name = [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(' ')

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/vehiculo/${vehicle.id}`} className="block">
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {vehicle.portada_url ? (
            <Image
              src={vehicle.portada_url}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              Sin imagen
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{name}</h3>
          <p className="mt-1 text-xs text-gray-500">{vehicle.anio}</p>
          <p className="mt-3 text-lg font-bold text-gray-900">{formatPrice(vehicle.precio)}</p>
          <div className="mt-4 flex gap-2 text-xs text-gray-500">
            <span className="rounded-md bg-gray-100 px-2 py-1">{vehicle.combustible}</span>
            <span className="rounded-md bg-gray-100 px-2 py-1">{vehicle.transmision}</span>
            <span className="rounded-md bg-gray-100 px-2 py-1">
              {vehicle.kilometraje === 0 ? '0 km' : `${vehicle.kilometraje.toLocaleString('es-UY')} km`}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Link
          href={`/vehiculo/${vehicle.id}`}
          className="block w-full rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  )
}
