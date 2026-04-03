'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { AppointmentWithDetails } from '@/lib/db/appointments'

const ESTADO_LABEL: Record<string, string> = {
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió',
}

const ESTADO_STYLE: Record<string, string> = {
  confirmada: 'bg-green-500/15 text-green-400 border border-green-500/25',
  realizada:  'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  cancelada:  'bg-[#334155] text-[#64748B] border border-[#475569]/30',
  no_asistio: 'bg-red-500/15 text-red-400 border border-red-500/25',
}

function formatDatetime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })
    + ' a las '
    + d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
}

export default function ClientAppointments({ appointments }: { appointments: AppointmentWithDetails[] }) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel(id: number) {
    setCancelling(id)
    setConfirmId(null)
    setError(null)

    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    const data = await res.json()
    setCancelling(null)

    if (!res.ok) {
      setError(data.error ?? 'Error al cancelar')
      return
    }
    router.refresh()
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#475569]">
        <div className="text-4xl mb-4">📅</div>
        <p className="text-base font-semibold text-[#64748B]">No tenés reservas</p>
        <a href="/catalogo" className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          Explorar vehículos →
        </a>
      </div>
    )
  }

  const active = appointments.filter(a => a.estado === 'confirmada')
  const past = appointments.filter(a => a.estado !== 'confirmada')

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">Próximas</h2>
          <div className="space-y-3">
            {active.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                cancelling={cancelling === a.id}
                confirmPending={confirmId === a.id}
                onRequestCancel={() => setConfirmId(a.id)}
                onConfirmCancel={() => handleCancel(a.id)}
                onCancelRequest={() => setConfirmId(null)}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">Historial</h2>
          <div className="space-y-3">
            {past.map(a => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function AppointmentCard({
  appointment: a,
  cancelling,
  confirmPending,
  onRequestCancel,
  onConfirmCancel,
  onCancelRequest,
}: {
  appointment: AppointmentWithDetails
  cancelling?: boolean
  confirmPending?: boolean
  onRequestCancel?: () => void
  onConfirmCancel?: () => void
  onCancelRequest?: () => void
}) {
  const vehicleName = [a.vehicle_marca, a.vehicle_modelo, a.vehicle_version].filter(Boolean).join(' ')
  const canCancel = a.estado === 'confirmada' && onRequestCancel &&
    new Date(a.fecha_hora).getTime() - Date.now() > 30 * 60 * 1000

  return (
    <article className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 space-y-3">
      <div className="flex gap-4">
        {/* Imagen */}
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[#0F172A]">
          {a.portada_url ? (
            <Image src={a.portada_url} alt={vehicleName} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#475569] text-xs">Sin imagen</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[#F1F5F9] text-sm truncate">{vehicleName}</h3>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_STYLE[a.estado]}`}>
              {ESTADO_LABEL[a.estado]}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">{formatDatetime(a.fecha_hora)}</p>
          <p className="text-xs text-[#475569]">Asesor: {a.employee_nombre} {a.employee_apellido}</p>

          {canCancel && !confirmPending && (
            <button
              onClick={onRequestCancel}
              disabled={cancelling}
              className="mt-2 text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
            >
              {cancelling ? 'Cancelando...' : 'Cancelar reserva'}
            </button>
          )}
        </div>
      </div>

      {/* Inline confirm */}
      {confirmPending && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-red-400 font-medium">¿Confirmar cancelación?</p>
          <div className="flex gap-2 shrink-0">
            <button onClick={onConfirmCancel} disabled={cancelling}
              className="rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-50 transition-colors">
              {cancelling ? '...' : 'Sí, cancelar'}
            </button>
            <button onClick={onCancelRequest}
              className="rounded-lg border border-[#334155] bg-[#1E293B] text-[#94A3B8] text-xs font-medium px-3 py-1.5 hover:bg-[#334155] transition-colors">
              No
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
