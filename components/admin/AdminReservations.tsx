'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Appointment = {
  id: number; fecha_hora: string; estado: string; notas: string | null
  vehicle_marca: string; vehicle_modelo: string; vehicle_version: string | null
  employee_nombre: string; employee_apellido: string; employee_id: number
  client_nombre: string | null; client_apellido: string | null
  guest_nombre: string | null; guest_apellido: string | null
  guest_telefono: string | null; client_telefono: string | null
  guest_email: string | null; client_email: string | null
}

type Employee = { id: number; nombre: string; apellido: string }

const ESTADO_STYLE: Record<string, string> = {
  confirmada: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  realizada:  'bg-green-500/15 text-green-400 border border-green-500/25',
  cancelada:  'bg-[#334155] text-[#64748B] border border-[#475569]/30',
  no_asistio: 'bg-red-500/15 text-red-400 border border-red-500/25',
}

const ESTADO_OPTS = ['confirmada', 'realizada', 'cancelada', 'no_asistio']

export default function AdminReservations({
  appointments, employees, from, to,
}: {
  appointments: Appointment[]; employees: Employee[]; from: string; to: string
}) {
  const router = useRouter()
  const [filterEstado, setFilterEstado] = useState('')
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [reassignTo, setReassignTo] = useState<number | null>(null)
  const [reassigning, setReassigning] = useState(false)
  const [updatingEstado, setUpdatingEstado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = filterEstado
    ? appointments.filter(a => a.estado === filterEstado)
    : appointments

  function getClientName(a: Appointment) {
    return a.client_nombre ? `${a.client_nombre} ${a.client_apellido}` : `${a.guest_nombre} ${a.guest_apellido}`
  }

  async function handleReassign() {
    if (!selected || !reassignTo) return
    setReassigning(true)
    setError(null)
    const res = await fetch(`/api/appointments/${selected.id}/reassign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmployeeId: reassignTo }),
    })
    const data = await res.json()
    setReassigning(false)
    if (!res.ok) { setError(data.error); return }
    setSelected(null)
    router.refresh()
  }

  async function handleUpdateEstado(estado: string) {
    if (!selected) return
    setUpdatingEstado(true)
    setError(null)
    const res = await fetch(`/api/appointments/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    const data = await res.json()
    setUpdatingEstado(false)
    if (!res.ok) { setError(data.error); return }
    setSelected(null)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm text-[#F1F5F9] focus:border-blue-500 outline-none">
          <option value="">Todos los estados</option>
          {ESTADO_OPTS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <span className="self-center text-sm text-[#64748B]">
          {filtered.length} reserva{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-[#334155] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#020617] text-xs text-[#64748B] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Fecha/Hora</th>
              <th className="px-4 py-3 text-left">Vehículo</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Empleado</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#475569]">Sin reservas</td></tr>
            ) : filtered.map(a => {
              const dt = new Date(a.fecha_hora)
              const vehicle = [a.vehicle_marca, a.vehicle_modelo, a.vehicle_version].filter(Boolean).join(' ')
              return (
                <tr key={a.id} onClick={() => { setSelected(a); setReassignTo(null); setError(null) }}
                  className="bg-[#1E293B] hover:bg-[#334155] cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-[#F1F5F9]">
                    <p className="font-medium">{dt.toLocaleDateString('es-UY')}</p>
                    <p className="text-xs text-[#64748B]">{dt.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{vehicle}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{getClientName(a)}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{a.employee_nombre} {a.employee_apellido}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_STYLE[a.estado]}`}>
                      {a.estado.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal detalle / reasignación */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-[#F1F5F9]">Reserva #{selected.id}</h3>
              <button onClick={() => setSelected(null)} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">✕</button>
            </div>

            <div className="rounded-xl bg-[#0F172A] border border-[#334155] px-4 py-3 text-sm space-y-1">
              <p className="font-medium text-[#F1F5F9]">{[selected.vehicle_marca, selected.vehicle_modelo, selected.vehicle_version].filter(Boolean).join(' ')}</p>
              <p className="text-[#64748B]">{new Date(selected.fecha_hora).toLocaleString('es-UY')}</p>
              <p className="text-[#64748B]">Cliente: {getClientName(selected)}</p>
              <p className="text-[#64748B]">
                Tel: {selected.client_telefono ?? selected.guest_telefono} ·{' '}
                {selected.client_email ?? selected.guest_email}
              </p>
              <p className="text-[#64748B]">Empleado: {selected.employee_nombre} {selected.employee_apellido}</p>
              {selected.notas && <p className="text-[#64748B] italic">"{selected.notas}"</p>}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {/* Cambiar estado */}
            {selected.estado === 'confirmada' && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#64748B]">Cambiar estado</p>
                <div className="flex gap-2 flex-wrap">
                  {['realizada', 'no_asistio', 'cancelada'].map(e => (
                    <button key={e} onClick={() => handleUpdateEstado(e)} disabled={updatingEstado}
                      className="rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:bg-[#334155] disabled:opacity-50 transition capitalize">
                      {e.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reasignar */}
            {selected.estado === 'confirmada' && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#64748B]">Reasignar empleado</p>
                <div className="flex gap-2">
                  <select value={reassignTo ?? ''} onChange={e => setReassignTo(Number(e.target.value))}
                    className="flex-1 rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm text-[#F1F5F9] outline-none focus:border-blue-500">
                    <option value="">Seleccionar empleado</option>
                    {employees.filter(e => e.id !== selected.employee_id).map(e => (
                      <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
                    ))}
                  </select>
                  <button onClick={handleReassign} disabled={!reassignTo || reassigning}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition">
                    {reassigning ? '...' : 'Reasignar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
