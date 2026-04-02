export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getVehicleById } from '@/lib/db/vehicles'
import { getSession } from '@/lib/auth/session'
import BookingForm from '@/components/booking/BookingForm'
import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculo?: string }>
}) {
  const { vehiculo } = await searchParams
  if (!vehiculo || isNaN(Number(vehiculo))) notFound()

  const [vehicle, session] = await Promise.all([
    getVehicleById(Number(vehiculo)),
    getSession(),
  ])

  if (!vehicle) notFound()

  const vehicleName = [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(' ')

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Reservar visita</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Info vehículo */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              {vehicle.portada_url ? (
                <Image
                  src={vehicle.portada_url}
                  alt={vehicleName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                  Sin imagen
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{vehicleName}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {vehicle.anio} · {vehicle.combustible} · {vehicle.transmision}
              </p>
            </div>
          </div>

          {/* Formulario */}
          <BookingForm
            vehicleId={vehicle.id}
            vehicleName={vehicleName}
            session={session}
          />
        </div>
      </main>
    </>
  )
}
