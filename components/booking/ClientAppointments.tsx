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
  confirmada: 'bg-green-100 text-green-700',
  realizada:  'bg-blue-100 text-blue-700',
  cancelada:  'bg-gray-100 text-gray-500',
  no_asistio: 'bg-red-100 text-red-600',
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
  const [error, setError] = useState<string | null>(null)

  async function handleCancel(id: number) {
    if (!confirm('¿Cancelar esta reserva?')) return
    setCancelling(id)
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
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-lg font-medium">No tenés reservas</p>
        <a href="/catalogo" className="mt-3 text-sm text-blue-600 hover:underline">
          Explorar vehículos
        </a>
      </div>
    )
  }

  const active = appointments.filter(a => a.estado === 'confirmada')
  const past = appointments.filter(a => a.estado !== 'confirmada')

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Próximas</h2>
          <div className="space-y-3">
            {active.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                cancelling={cancelling === a.id}
                onCancel={() => handleCancel(a.id)}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Historial</h2>
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
  onCancel,
}: {
  appointment: AppointmentWithDetails
  cancelling?: boolean
  onCancel?: () => void
}) {
  const vehicleName = [a.vehicle_marca, a.vehicle_modelo, a.vehicle_version].filter(Boolean).join(' ')

  // ¿Puede cancelar? (solo confirmada y > 30 min)
  const canCancel = a.estado === 'confirmada' && onCancel &&
    new Date(a.fecha_hora).getTime() - Date.now() > 30 * 60 * 1000

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 flex gap-4">
      {/* Imagen */}
      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {a.portada_url ? (
          <Image src={a.portada_url} alt={vehicleName} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{vehicleName}</h3>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_STYLE[a.estado]}`}>
            {ESTADO_LABEL[a.estado]}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{formatDatetime(a.fecha_hora)}</p>
        <p className="text-xs text-gray-400">Asesor: {a.employee_nombre} {a.employee_apellido}</p>
      </div>

      {/* Cancelar */}
      {canCancel && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="shrink-0 self-center text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition"
        >
          {cancelling ? '...' : 'Cancelar'}
        </button>
      )}
    </article>
  )
}
