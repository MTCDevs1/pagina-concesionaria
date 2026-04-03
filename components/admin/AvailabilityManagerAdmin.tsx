'use client'

import { useEffect, useState } from 'react'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

type ScheduleDay = {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  pausa_inicio: string | null
  pausa_fin: string | null
  active: boolean
}

const DEFAULT_SCHEDULE: ScheduleDay[] = DIAS.map((_, i) => ({
  dia_semana: i,
  hora_inicio: '09:00',
  hora_fin: '18:00',
  pausa_inicio: '13:00',
  pausa_fin: '13:30',
  active: i >= 1 && i <= 5,
}))

const inputCls = 'rounded-lg border border-[#334155] bg-[#0F172A] px-2.5 py-1.5 text-sm text-[#F1F5F9] focus:border-blue-500 outline-none transition'

export default function AvailabilityManagerAdmin({ employeeId }: { employeeId: number }) {
  const [schedule, setSchedule] = useState<ScheduleDay[]>(DEFAULT_SCHEDULE)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    fetch(`/api/employee-availability?employeeId=${employeeId}`)
      .then(r => r.json())
      .then(({ schedule: dbSchedule }) => {
        if (dbSchedule && dbSchedule.length > 0) {
          setSchedule(DEFAULT_SCHEDULE.map(def => {
            const found = dbSchedule.find((d: { dia_semana: number }) => d.dia_semana === def.dia_semana)
            return found ? { ...found, active: true } : { ...def, active: false }
          }))
        }
        setLoading(false)
      })
  }, [employeeId])

  function updateDay(dia: number, field: string, value: string | boolean) {
    setSchedule(prev => prev.map(d => d.dia_semana === dia ? { ...d, [field]: value } : d))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    const activeDays = schedule.filter(d => d.active)
    await fetch('/api/employee-availability', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ schedule: activeDays, employeeId }),
    })
    setSaving(false)
    setSuccess(true)
  }

  if (loading) return <div className="text-sm text-[#475569] py-8">Cargando horario...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#334155] divide-y divide-[#334155] overflow-hidden">
        {schedule.map(day => (
          <div key={day.dia_semana} className={`px-5 py-4 bg-[#1E293B] transition ${day.active ? '' : 'opacity-50'}`}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 w-28">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={e => updateDay(day.dia_semana, 'active', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-[#F1F5F9]">{DIAS[day.dia_semana]}</span>
              </div>

              {day.active && (
                <>
                  <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <input type="time" value={day.hora_inicio} onChange={e => updateDay(day.dia_semana, 'hora_inicio', e.target.value)} className={inputCls} />
                    <span>–</span>
                    <input type="time" value={day.hora_fin} onChange={e => updateDay(day.dia_semana, 'hora_fin', e.target.value)} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748B]">
                    <span className="text-xs">Pausa:</span>
                    <input type="time" value={day.pausa_inicio ?? ''} onChange={e => updateDay(day.dia_semana, 'pausa_inicio', e.target.value)} className={inputCls} />
                    <span>–</span>
                    <input type="time" value={day.pausa_fin ?? ''} onChange={e => updateDay(day.dia_semana, 'pausa_fin', e.target.value)} className={inputCls} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 text-sm text-emerald-400">
          Horario guardado correctamente.
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition">
        {saving ? 'Guardando...' : 'Guardar horario'}
      </button>
    </div>
  )
}
