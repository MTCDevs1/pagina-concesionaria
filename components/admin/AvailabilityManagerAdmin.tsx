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

const inputCls = 'rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 outline-none transition'

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

  if (loading) return <div className="text-sm text-gray-500 py-8">Cargando horario...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 bg-white overflow-hidden">
        {schedule.map(day => (
          <div key={day.dia_semana} className={`px-5 py-4 transition ${day.active ? '' : 'opacity-50'}`}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 w-28">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={e => updateDay(day.dia_semana, 'active', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-800">{DIAS[day.dia_semana]}</span>
              </div>

              {day.active && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="time" value={day.hora_inicio} onChange={e => updateDay(day.dia_semana, 'hora_inicio', e.target.value)} className={inputCls} />
                    <span>–</span>
                    <input type="time" value={day.hora_fin} onChange={e => updateDay(day.dia_semana, 'hora_fin', e.target.value)} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
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
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Horario guardado correctamente.
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition">
        {saving ? 'Guardando...' : 'Guardar horario'}
      </button>
    </div>
  )
}
