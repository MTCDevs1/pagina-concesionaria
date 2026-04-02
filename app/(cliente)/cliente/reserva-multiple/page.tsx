export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getVehicles } from '@/lib/db/vehicles'
import { queryOne } from '@/lib/db/client'
import MultiBookingForm from '@/components/booking/MultiBookingForm'
import Navbar from '@/components/ui/Navbar'

export default async function ReservaMultiplePage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculo?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  // Bloquear si ya tiene 2 reservas activas
  const active = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM appointments
     WHERE client_id = $1 AND estado = 'confirmada'`,
    [session.id]
  )
  if (active && parseInt(active.count) >= 2) redirect('/cliente/perfil')

  const { vehiculo } = await searchParams
  const [vehicles] = await Promise.all([getVehicles()])

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reserva múltiple</h1>
          <p className="text-sm text-gray-500 mt-1">
            Seleccioná hasta 3 vehículos y reservá una visita para verlos todos en un turno.
          </p>
        </div>
        <MultiBookingForm
          vehicles={vehicles}
          initialVehicleId={vehiculo ? Number(vehiculo) : undefined}
        />
      </main>
    </>
  )
}
