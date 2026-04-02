export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { getClientAppointmentsFull } from '@/lib/db/appointments.multi'
import ClientAppointmentsWithExtras from '@/components/booking/ClientAppointmentsWithExtras'
import Navbar from '@/components/ui/Navbar'

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const appointments = await getClientAppointmentsFull(session.id)
  const active = appointments.filter(a => a.estado === 'confirmada')

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10">

        {/* Datos del usuario */}
        <section>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mi perfil</h1>
          <p className="text-gray-500">{session.email}</p>
          <p className="text-sm text-gray-400 mt-1">
            {session.nombre} {session.apellido}
          </p>
        </section>

        {/* Reserva múltiple */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Reserva múltiple</h2>
              <p className="text-sm text-gray-500 mt-1">
                Agendá una visita para ver hasta 3 vehículos en un solo turno.
              </p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              active.length >= 2
                ? 'bg-gray-100 text-gray-500'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {active.length}/2 activas
            </span>
          </div>

          {active.length >= 2 ? (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              Tenés 2 reservas activas. Cancelá una para poder reservar nuevamente.
            </p>
          ) : (
            <Link
              href="/cliente/reserva-multiple"
              className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Iniciar reserva múltiple
            </Link>
          )}
        </section>

        {/* Historial */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Mis reservas</h2>
          <ClientAppointmentsWithExtras appointments={appointments} />
        </section>
      </main>
    </>
  )
}
