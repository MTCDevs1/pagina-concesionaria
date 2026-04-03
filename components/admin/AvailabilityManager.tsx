'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

type ScheduleDay = {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  pausa_inicio: string | null
  pausa_fin: string | null
  active: boolean
}

type Exception = { id: number; fecha: string; motivo: string | null }

type AffectedAppointment = {
  id: number
  vehicle_marca: string; vehicle_modelo: string; vehicle_version: string | null
  client_nombre: string | null; client_apellido: string | null
  guest_nombre: string | null; guest_apellido: string | null
  guest_email: string | null; client_email: string | null
  fecha_hora: string
}

const DEFAULT_SCHEDULE: ScheduleDay[] = DIAS.map((_, i) => ({
  dia_semana: i,
  hora_inicio: '09:00',
  hora_fin: '18:00',
  pausa_inicio: '13:00',
  pausa_fin: '13:30',
  active: i >= 1 && i <= 5, // lun-vie por defecto
}))

export default function AvailabilityManager() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduleDay[]>(DEFAULT_SCHEDULE)
  const [exceptions, setExceptions] = useState<Exception[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Nuevo día no disponible
  const [newException, setNewException] = useState({ fecha: '', motivo: '' })
  const [addingException, setAddingException] = useState(false)

  // Popup reservas afectadas
  const [affected, setAffected] = useState<AffectedAppointment[] | null>(null)
  const [pendingException, setPendingException] = useState<{ fecha: string; motivo: string } | null>(null)

  useEffect(() => {
    fetch('/api/employee-availability')
      .then(r => r.json())
      .then(data => {
        if (data.schedule?.length) {
          setSchedule(DEFAULT_SCHEDULE.map(def => {
            const found = data.schedule.find((s: ScheduleDay) => s.dia_semana === def.dia_semana)
            return found ? { ...found, active: true } : { ...def, active: false }
          }))
        }
        setExceptions(data.exceptions ?? [])
        setLoading(false)
      })
  }, [])

  function updateDay(i: number, key: string, value: string | boolean) {
    setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, [key]: value } : d))
  }

  async function saveSchedule() {
    setSaving(true)
    const payload = schedule.filter(d => d.active).map(d => ({
      dia_semana: d.dia_semana,
      hora_inicio: d.hora_inicio,
      hora_fin: d.hora_fin,
      pausa_inicio: d.pausa_inicio,
      pausa_fin: d.pausa_fin,
    }))
    await fetch('/api/employee-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule: payload }),
    })
    setSaving(false)
  }

  async function handleAddException() {
    if (!newException.fecha) return
    setAddingException(true)

    const res = await fetch('/api/employee-availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newException, confirmar: false }),
    })
    const data = await res.json()
    setAddingException(false)

    if (data.affected?.length > 0) {
      setAffected(data.affected)
      setPendingException(newException)
      return
    }

    setExceptions(prev => [...prev, { id: Date.now(), fecha: newException.fecha, motivo: newException.motivo || null }])
    setNewException({ fecha: '', motivo: '' })
  }

  async function confirmException() {
    if (!pendingException) return
    setAddingException(true)
    await fetch('/api/employee-availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pendingException, confirmar: true }),
    })
    setAddingException(false)
    setAffected(null)
    setPendingException(null)
    setNewException({ fecha: '', motivo: '' })
    router.refresh()
  }

  async function handleDeleteException(id: number) {
    await fetch('/api/employee-availability', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exceptionId: id }),
    })
    setExceptions(prev => prev.filter(e => e.id !== id))
  }

  if (loading) return <p className="text-sm text-[#475569]">Cargando...</p>

  const timeInputCls = 'w-full rounded-lg border border-[#334155] bg-[#0F172A] px-2 py-1.5 text-sm text-[#F1F5F9] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

  return (
    <div className="space-y-10 max-w-2xl">

      {/* Horario semanal */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">Horario semanal</h2>
          <button onClick={saveSchedule} disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-60 transition">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        <div className="space-y-3">
          {schedule.map((day, i) => (
            <div key={day.dia_semana} className={`rounded-xl border p-4 transition ${day.active ? 'border-[#334155] bg-[#1E293B]' : 'border-[#1E293B] bg-[#0F172A] opacity-60'}`}>
              <div className="flex items-center gap-3 mb-3">
                <input type="checkbox" checked={day.active} onChange={e => updateDay(i, 'active', e.target.checked)} className="rounded" />
                <span className={`text-sm font-medium ${day.active ? 'text-[#F1F5F9]' : 'text-[#475569]'}`}>{DIAS[day.dia_semana]}</span>
              </div>
              {day.active && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B]">Entrada</label>
                    <input type="time" value={day.hora_inicio} onChange={e => updateDay(i, 'hora_inicio', e.target.value)} className={timeInputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B]">Salida</label>
                    <input type="time" value={day.hora_fin} onChange={e => updateDay(i, 'hora_fin', e.target.value)} className={timeInputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B]">Pausa inicio</label>
                    <input type="time" value={day.pausa_inicio ?? ''} onChange={e => updateDay(i, 'pausa_inicio', e.target.value)} className={timeInputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B]">Pausa fin</label>
                    <input type="time" value={day.pausa_fin ?? ''} onChange={e => updateDay(i, 'pausa_fin', e.target.value)} className={timeInputCls} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Días no disponibles */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Días no disponibles</h2>

        {exceptions.length > 0 && (
          <div className="space-y-2">
            {exceptions.map(ex => (
              <div key={ex.id} className="flex items-center justify-between rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#F1F5F9]">{ex.fecha}</p>
                  {ex.motivo && <p className="text-xs text-[#64748B]">{ex.motivo}</p>}
                </div>
                <button onClick={() => handleDeleteException(ex.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-[#64748B]">Fecha</label>
            <input type="date" value={newException.fecha} onChange={e => setNewException(p => ({ ...p, fecha: e.target.value }))}
              className="rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm text-[#F1F5F9] outline-none focus:border-blue-500" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-[#64748B]">Motivo (opcional)</label>
            <input value={newException.motivo} onChange={e => setNewException(p => ({ ...p, motivo: e.target.value }))}
              placeholder="Vacaciones, enfermedad..."
              className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm text-[#F1F5F9] placeholder:text-[#475569] outline-none focus:border-blue-500" />
          </div>
          <button onClick={handleAddException} disabled={!newException.fecha || addingException}
            className="rounded-lg bg-[#334155] px-4 py-2 text-sm font-medium text-[#F1F5F9] hover:bg-[#475569] disabled:opacity-50 transition">
            {addingException ? '...' : 'Agregar'}
          </button>
        </div>
      </section>

      {/* Popup: reservas afectadas */}
      {affected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg p-6 space-y-5">
            <h3 className="font-bold text-[#F1F5F9]">Reservas que serán canceladas</h3>
            <p className="text-sm text-[#64748B]">
              Al marcar este día como no disponible, las siguientes reservas quedarán canceladas automáticamente.
              Podés contactar a los clientes manualmente.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {affected.map(a => {
                const clientName = a.client_nombre ? `${a.client_nombre} ${a.client_apellido}` : `${a.guest_nombre} ${a.guest_apellido}`
                const email = a.client_email ?? a.guest_email
                const vehicleName = [a.vehicle_marca, a.vehicle_modelo, a.vehicle_version].filter(Boolean).join(' ')
                return (
                  <div key={a.id} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm">
                    <p className="font-medium text-[#F1F5F9]">{clientName}</p>
                    <p className="text-[#64748B]">{email}</p>
                    <p className="text-[#64748B]">{vehicleName} — {a.fecha_hora.replace('T', ' ').slice(0, 16)}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={confirmException} disabled={addingException}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition">
                {addingException ? 'Cancelando...' : 'Confirmar y cancelar reservas'}
              </button>
              <button onClick={() => { setAffected(null); setPendingException(null) }}
                className="flex-1 rounded-lg border border-[#334155] bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[#334155] transition">
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
