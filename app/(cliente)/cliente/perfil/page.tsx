export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { getClientAppointmentsFull } from '@/lib/db/appointments.multi'
import { queryOne } from '@/lib/db/client'
import ClientAppointmentsWithExtras from '@/components/booking/ClientAppointmentsWithExtras'
import ProfileEditForm from '@/components/cliente/ProfileEditForm'
import Navbar from '@/components/ui/Navbar'

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [appointments, userData] = await Promise.all([
    getClientAppointmentsFull(session.id),
    queryOne<{ nombre: string; apellido: string; email: string; telefono: string | null }>(
      'SELECT nombre, apellido, email, telefono FROM users WHERE id = $1',
      [session.id]
    ),
  ])

  const active = appointments.filter(a => a.estado === 'confirmada')

  return (
    <>
      <Navbar />
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Mi cuenta</p>
          <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
          <p className="text-sm text-slate-500 mt-1">{session.nombre} {session.apellido} · {session.email}</p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">

        {/* Editar datos */}
        {userData && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Editar datos</h2>
            <ProfileEditForm user={userData} />
          </section>
        )}

        {/* Reserva múltiple */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Reserva múltiple</h2>
              <p className="text-sm text-slate-500 mt-1">
                Agendá una visita para ver hasta 3 vehículos en un solo turno.
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              active.length >= 2 ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
            }`}>
              {active.length}/2 activas
            </span>
          </div>

          {active.length >= 2 ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              Tenés 2 reservas activas. Cancelá una para poder reservar nuevamente.
            </p>
          ) : (
            <Link
              href="/cliente/reserva-multiple"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
            >
              Iniciar reserva múltiple
            </Link>
          )}
        </section>

        {/* Historial */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-4">Mis reservas</h2>
          <ClientAppointmentsWithExtras appointments={appointments} />
        </section>
      </main>
    </>
  )
}
