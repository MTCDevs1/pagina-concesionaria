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

  // Cargar empleados cuando cambia la fecha
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

  // Cargar turnos cuando cambia el empleado
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

  // Notificar selección completa
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
    <div className="space-y-6">
      {/* Fecha */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Seleccioná una fecha</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                selectedDate === d
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              {formatDate(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Empleado */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Seleccioná un asesor</p>
        {loadingEmployees ? (
          <p className="text-sm text-gray-400">Cargando asesores...</p>
        ) : employees.length === 0 ? (
          <p className="text-sm text-gray-400">No hay asesores disponibles para esta fecha</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {employees.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEmployee(e.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  selectedEmployee === e.id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
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
          <p className="text-sm font-medium text-gray-700 mb-3">Seleccioná un horario</p>
          {loadingSlots ? (
            <p className="text-sm text-gray-400">Cargando horarios...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-400">No hay horarios disponibles</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    selectedSlot === slot
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
          {slots.length > 0 && (
            <p className="mt-2 text-xs text-gray-400">Duración de la visita: 45 min</p>
          )}
        </div>
      )}
    </div>
  )
}
