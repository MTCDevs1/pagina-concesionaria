'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type ExtraVehicle = {
  vehicle_id: number; marca: string; modelo: string
  version: string | null; portada_url: string | null
}

type Appointment = {
  id: number; vehicle_id: number
  vehicle_marca: string; vehicle_modelo: string; vehicle_version: string | null
  employee_nombre: string; employee_apellido: string
  portada_url: string | null; fecha_hora: string
  estado: string; notas: string | null
  extra_vehicles: ExtraVehicle[]
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

export default function ClientAppointmentsWithExtras({ appointments }: { appointments: Appointment[] }) {
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
    if (!res.ok) { setError(data.error); return }
    router.refresh()
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#475569]">
        <p className="text-base font-medium">Sin reservas todavía</p>
        <a href="/catalogo" className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">Explorar vehículos</a>
      </div>
    )
  }

  const active = appointments.filter(a => a.estado === 'confirmada')
  const past   = appointments.filter(a => a.estado !== 'confirmada')

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {active.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Próximas</h3>
          <div className="space-y-3">
            {active.map(a => <AppointmentCard key={a.id} a={a} cancelling={cancelling} onCancel={handleCancel} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Historial</h3>
          <div className="space-y-3">
            {past.map(a => <AppointmentCard key={a.id} a={a} cancelling={cancelling} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function AppointmentCard({
  a, cancelling, onCancel
}: {
  a: Appointment; cancelling: number | null; onCancel?: (id: number) => void
}) {
  const allVehicles = [
    { vehicle_id: a.vehicle_id, marca: a.vehicle_marca, modelo: a.vehicle_modelo, version: a.vehicle_version, portada_url: a.portada_url },
    ...a.extra_vehicles,
  ]
  const isMulti = allVehicles.length > 1
  const canCancel = a.estado === 'confirmada' && onCancel &&
    new Date(a.fecha_hora).getTime() - Date.now() > 30 * 60 * 1000

  return (
    <article className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_STYLE[a.estado]}`}>
              {a.estado.replace('_', ' ')}
            </span>
            {isMulti && (
              <span className="rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2 py-0.5 text-xs font-medium">
                {allVehicles.length} vehículos
              </span>
            )}
          </div>
          <p className="text-sm text-[#64748B] mt-1">{formatDatetime(a.fecha_hora)}</p>
          <p className="text-xs text-[#475569]">Asesor: {a.employee_nombre} {a.employee_apellido}</p>
        </div>
        {canCancel && (
          <button onClick={() => onCancel!(a.id)} disabled={cancelling === a.id}
            className="shrink-0 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition">
            {cancelling === a.id ? '...' : 'Cancelar'}
          </button>
        )}
      </div>

      {/* Vehículos */}
      <div className="flex flex-wrap gap-2">
        {allVehicles.map(v => (
          <div key={v.vehicle_id} className="flex items-center gap-2 rounded-xl border border-[#334155] bg-[#0F172A] px-3 py-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#1E293B] shrink-0">
              {v.portada_url
                ? <Image src={v.portada_url} alt="" fill className="object-cover" sizes="32px" />
                : <div className="w-full h-full bg-[#334155]" />
              }
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">
              {[v.marca, v.modelo, v.version].filter(Boolean).join(' ')}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
