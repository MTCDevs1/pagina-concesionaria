'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AppointmentEmployee } from '@/lib/db/appointments.employee'

const ESTADO_STYLE: Record<string, string> = {
  confirmada: 'bg-blue-100 text-blue-800 border-blue-200',
  realizada:  'bg-green-100 text-green-800 border-green-200',
  cancelada:  'bg-gray-100 text-gray-500 border-gray-200',
  no_asistio: 'bg-red-100 text-red-700 border-red-200',
}

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getDays(from: string, to: string): string[] {
  const days: string[] = []
  const cur = new Date(from + 'T12:00:00Z')
  const end = new Date(to + 'T12:00:00Z')
  while (cur <= end) {
    days.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00Z')
  return `${DIAS_ES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
}

function getClientName(a: AppointmentEmployee) {
  if (a.client_nombre) return `${a.client_nombre} ${a.client_apellido}`
  return `${a.guest_nombre} ${a.guest_apellido}`
}

function getClientContact(a: AppointmentEmployee) {
  return {
    telefono: a.client_telefono ?? a.guest_telefono,
    email: a.client_email ?? a.guest_email,
  }
}

export default function EmployeeCalendar({
  appointments,
  from,
  to,
}: {
  appointments: AppointmentEmployee[]
  from: string
  to: string
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<AppointmentEmployee | null>(null)
  const [updating, setUpdating] = useState(false)
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)

  const days = getDays(from, to)

  const byDay = days.reduce<Record<string, AppointmentEmployee[]>>((acc, d) => {
    acc[d] = appointments.filter(a => a.fecha_hora.startsWith(d))
    return acc
  }, {})

  async function handleUpdate(estado: 'realizada' | 'cancelada' | 'no_asistio') {
    if (!selected) return
    setUpdating(true)
    setError(null)
    const res = await fetch(`/api/appointments/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, notas: nota || undefined }),
    })
    setUpdating(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error)
      return
    }
    setSelected(null)
    router.refresh()
  }

  async function handleSaveNota() {
    if (!selected || !nota) return
    setUpdating(true)
    await fetch(`/api/appointments/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas: nota }),
    })
    setUpdating(false)
    setSelected(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {days.map(day => {
        const appts = byDay[day] ?? []
        const isToday = day === new Date().toISOString().split('T')[0]
        return (
          <div key={day}>
            <h2 className={`text-sm font-semibold mb-3 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
              {formatDay(day)} {isToday && '(Hoy)'}
            </h2>
            {appts.length === 0 ? (
              <p className="text-sm text-gray-400 pl-2">Sin reservas</p>
            ) : (
              <div className="space-y-2">
                {appts.map(a => {
                  const hora = a.fecha_hora.split('T')[1]?.slice(0, 5)
                  const vehicleName = [a.vehicle_marca, a.vehicle_modelo, a.vehicle_version].filter(Boolean).join(' ')
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setSelected(a); setNota(a.notas ?? '') }}
                      className={`w-full text-left rounded-xl border px-4 py-3 hover:shadow-sm transition ${ESTADO_STYLE[a.estado]}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{hora} — {vehicleName}</span>
                        <span className="text-xs capitalize">{a.estado.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs mt-0.5 opacity-75">{getClientName(a)}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900">Detalle de reserva</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Vehículo */}
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm space-y-1">
              <p className="font-medium text-gray-900">
                {[selected.vehicle_marca, selected.vehicle_modelo, selected.vehicle_version].filter(Boolean).join(' ')}
              </p>
              <p className="text-gray-500">{selected.fecha_hora.replace('T', ' ').slice(0, 16)}</p>
            </div>

            {/* Cliente */}
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-700">Cliente</p>
              <p className="text-gray-900">{getClientName(selected)}</p>
              <p className="text-gray-500">{getClientContact(selected).telefono}</p>
              <p className="text-gray-500">{getClientContact(selected).email}</p>
              {selected.guest_mensaje && (
                <p className="text-gray-500 italic">"{selected.guest_mensaje}"</p>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas internas</label>
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="Agregar nota..."
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Acciones */}
            {selected.estado === 'confirmada' && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleUpdate('realizada')} disabled={updating}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60 transition">
                  Realizada
                </button>
                <button onClick={() => handleUpdate('no_asistio')} disabled={updating}
                  className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-60 transition">
                  No asistió
                </button>
                <button onClick={() => handleUpdate('cancelada')} disabled={updating}
                  className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition">
                  Cancelar
                </button>
              </div>
            )}

            <button onClick={handleSaveNota} disabled={updating || !nota}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">
              Guardar nota
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
