export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getClientAppointments } from '@/lib/db/appointments'
import ClientAppointments from '@/components/booking/ClientAppointments'
import Navbar from '@/components/ui/Navbar'

export default async function ClienteReservasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const appointments = await getClientAppointments(session.id)

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
          <span className="text-sm text-gray-500">
            {appointments.filter(a => a.estado === 'confirmada').length}/2 activas
          </span>
        </div>

        <ClientAppointments appointments={appointments} />
      </main>
    </>
  )
}
