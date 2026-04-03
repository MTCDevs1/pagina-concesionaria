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
      <div className="bg-[#0F172A] border-b border-[#1E293B]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Mi cuenta</p>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Mi perfil</h1>
          <p className="text-sm text-[#64748B] mt-1">{session.nombre} {session.apellido} · {session.email}</p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">

        {/* Editar datos */}
        {userData && (
          <section className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6">
            <h2 className="text-base font-semibold text-[#F1F5F9] mb-5">Editar datos</h2>
            <ProfileEditForm user={userData} />
          </section>
        )}

        {/* Reserva múltiple */}
        <section className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#F1F5F9]">Reserva múltiple</h2>
              <p className="text-sm text-[#64748B] mt-1">
                Agendá una visita para ver hasta 3 vehículos en un solo turno.
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              active.length >= 2 ? 'bg-[#334155] text-[#64748B] border-[#475569]/30' : 'bg-blue-600/15 text-blue-400 border-blue-500/25'
            }`}>
              {active.length}/2 activas
            </span>
          </div>

          {active.length >= 2 ? (
            <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              Tenés 2 reservas activas. Cancelá una para poder reservar nuevamente.
            </p>
          ) : (
            <Link
              href="/cliente/reserva-multiple"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 hover:-translate-y-0.5 transition-all duration-200"
            >
              Iniciar reserva múltiple
            </Link>
          )}
        </section>

        {/* Historial */}
        <section>
          <h2 className="text-base font-semibold text-[#F1F5F9] mb-4">Mis reservas</h2>
          <ClientAppointmentsWithExtras appointments={appointments} />
        </section>
      </main>
    </>
  )
}
