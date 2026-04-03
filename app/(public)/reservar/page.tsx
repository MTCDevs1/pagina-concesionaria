export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getVehicleById } from '@/lib/db/vehicles'
import { getSession } from '@/lib/auth/session'
import BookingForm from '@/components/booking/BookingForm'
import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

export default async function ReservarPage({ searchParams }: { searchParams: Promise<{ vehiculo?: string }> }) {
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
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Paso a paso</p>
          <h1 className="text-2xl font-bold text-slate-900">Reservar visita</h1>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">

          {/* Info vehículo – sidebar */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="relative aspect-[4/3] bg-slate-100">
                {vehicle.portada_url ? (
                  <Image src={vehicle.portada_url} alt={vehicleName} fill className="object-cover" sizes="400px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm">Sin imagen</div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-slate-900 text-base">{vehicleName}</h2>
                <p className="text-xl font-bold text-blue-600 mt-1">{formatPrice(vehicle.precio)}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[String(vehicle.anio), vehicle.combustible, vehicle.transmision].map(t => (
                    <span key={t} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2 text-xs text-blue-700">
              <p className="font-semibold text-blue-800">¿Cómo funciona?</p>
              <p>1. Elegí fecha, asesor y horario</p>
              <p>2. Confirmá tus datos</p>
              <p>3. ¡Listo! Tu visita queda confirmada</p>
              <p className="text-blue-500 pt-1">Podés cancelar hasta 30 min antes</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
              <BookingForm vehicleId={vehicle.id} vehicleName={vehicleName} session={session} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
