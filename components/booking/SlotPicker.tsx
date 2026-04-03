'use client'

import { useEffect, useState } from 'react'
import { MAX_BOOKING_DAYS } from '@/lib/scheduling/slots'

type Employee = { id: number; nombre: string; apellido: string }

type Props = {
  vehicleId: number
  onSelect: (data: { fecha: string; hora: string; employeeId: number; employeeName: string }) => void
}

function getDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < MAX_BOOKING_DAYS; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-UY', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default function SlotPicker({ vehicleId, onSelect }: Props) {
  const dates = getDates()
  const [selectedDate, setSelectedDate] = useState<string>(dates[0])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    setLoadingEmployees(true)
    setEmployees([])
    setSelectedEmployee(null)
    setSlots([])
    setSelectedSlot(null)

    fetch(`/api/availability?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => setEmployees(data.employees ?? []))
      .finally(() => setLoadingEmployees(false))
  }, [selectedDate])

  useEffect(() => {
    if (!selectedEmployee) return
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)

    fetch(`/api/availability?date=${selectedDate}&employeeId=${selectedEmployee}&vehicleId=${vehicleId}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false))
  }, [selectedEmployee, selectedDate, vehicleId])

  useEffect(() => {
    if (!selectedDate || !selectedEmployee || !selectedSlot) return
    const emp = employees.find(e => e.id === selectedEmployee)
    if (!emp) return
    onSelect({
      fecha: selectedDate,
      hora: selectedSlot,
      employeeId: selectedEmployee,
      employeeName: `${emp.nombre} ${emp.apellido}`,
    })
  }, [selectedDate, selectedEmployee, selectedSlot, employees, onSelect])

  return (
    <div className="space-y-7">
      {/* Fecha */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          1 · Elegí una fecha
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {dates.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                selectedDate === d
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {formatDate(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Asesor */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          2 · Elegí un asesor
        </p>
        {loadingEmployees ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando asesores...
          </div>
        ) : employees.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No hay asesores disponibles para esta fecha</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {employees.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEmployee(e.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  selectedEmployee === e.id
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {e.nombre} {e.apellido}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horarios */}
      {selectedEmployee && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            3 · Elegí un horario
          </p>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando horarios...
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No hay horarios disponibles para este asesor</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2.5">
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border py-3 text-sm font-bold transition-all duration-200 ${
                      selectedSlot === slot
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.03]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.02]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">Duración de la visita: 45 min · Sin compromiso</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
