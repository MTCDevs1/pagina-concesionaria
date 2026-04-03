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
  const activeCount = appointments.filter(a => a.estado === 'confirmada').length

  return (
    <>
      <Navbar />
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Mi cuenta</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Mis reservas</h1>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              activeCount >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {activeCount}/2 activas
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <ClientAppointments appointments={appointments} />
      </main>
    </>
  )
}
