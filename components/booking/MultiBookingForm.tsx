'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import VehicleSelector from './VehicleSelector'
import SlotPicker from './SlotPicker'
import type { Vehicle } from '@/lib/db/vehicles'
// MAX_VEHICLES_PER_VISIT se usa en VehicleSelector — no necesita importarse acá

type Selection = {
  fecha: string; hora: string; employeeId: number; employeeName: string
}

type Props = {
  vehicles: Vehicle[]
  initialVehicleId?: number
}

export default function MultiBookingForm({ vehicles, initialVehicleId }: Props) {
  const router = useRouter()
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>(
    initialVehicleId ? [initialVehicleId] : []
  )
  const [selection, setSelection] = useState<Selection | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSlotSelect = useCallback((data: Selection) => setSelection(data), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedVehicles.length === 0) { setError('Seleccioná al menos un vehículo'); return }
    if (!selection) { setError('Seleccioná fecha, asesor y horario'); return }

    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/appointments/multi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleIds: selectedVehicles,
        employeeId: selection.employeeId,
        fecha: selection.fecha,
        hora: selection.hora,
      }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center space-y-3">
        <div className="text-3xl">✓</div>
        <h2 className="text-lg font-semibold text-green-800">¡Visita confirmada!</h2>
        <p className="text-sm text-green-700">
          {selection?.fecha} a las {selection?.hora} con {selection?.employeeName}
        </p>
        <p className="text-xs text-green-600">
          {selectedVehicles.length} vehículo{selectedVehicles.length > 1 ? 's' : ''} agendado{selectedVehicles.length > 1 ? 's' : ''}
        </p>
        <button onClick={() => router.push('/cliente/reservas')}
          className="mt-2 inline-block rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 transition">
          Ver mis reservas
        </button>
      </div>
    )
  }

  // Primer vehículo seleccionado (para el SlotPicker)
  const primaryVehicleId = selectedVehicles[0] ?? 0

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Paso 1: Vehículos */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
          <h2 className="text-sm font-semibold text-gray-900">Elegí los vehículos</h2>
        </div>
        <VehicleSelector
          vehicles={vehicles}
          selected={selectedVehicles}
          onChange={setSelectedVehicles}
        />
      </section>

      {/* Paso 2: Turno */}
      {selectedVehicles.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
            <h2 className="text-sm font-semibold text-gray-900">Elegí fecha y horario</h2>
          </div>
          <SlotPicker vehicleId={primaryVehicleId} onSelect={handleSlotSelect} />
        </section>
      )}

      {/* Resumen */}
      {selection && selectedVehicles.length > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm space-y-2">
          <p className="font-medium text-blue-900">Resumen de la visita</p>
          <p className="text-blue-700">
            {selection.fecha} a las {selection.hora} · {selection.employeeName}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedVehicles.map(id => {
              const v = vehicles.find(vv => vv.id === id)
              if (!v) return null
              return (
                <span key={id} className="rounded-full bg-blue-200 px-2.5 py-0.5 text-xs text-blue-800">
                  {v.marca} {v.modelo}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || selectedVehicles.length === 0 || !selection}
        className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {submitting ? 'Confirmando...' : 'Confirmar visita'}
      </button>
    </form>
  )
}
