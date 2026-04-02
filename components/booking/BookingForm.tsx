'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import SlotPicker from './SlotPicker'
import type { SessionUser } from '@/lib/auth/session'

type Selection = {
  fecha: string
  hora: string
  employeeId: number
  employeeName: string
}

type Props = {
  vehicleId: number
  vehicleName: string
  session: SessionUser | null
}

export default function BookingForm({ vehicleId, vehicleName, session }: Props) {
  const router = useRouter()
  const [selection, setSelection] = useState<Selection | null>(null)
  const [step, setStep] = useState<'picker' | 'form' | 'done'>('picker')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSelect = useCallback((data: Selection) => {
    setSelection(data)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selection) return
    setSubmitting(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const body: Record<string, string | number> = {
      vehicleId,
      employeeId: selection.employeeId,
      fecha: selection.fecha,
      hora: selection.hora,
    }

    if (!session) {
      body.nombre    = fd.get('nombre')    as string
      body.apellido  = fd.get('apellido')  as string
      body.telefono  = fd.get('telefono')  as string
      body.email     = fd.get('email')     as string
      body.mensaje   = fd.get('mensaje')   as string
    }

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error ?? 'Error al crear la reserva')
      return
    }

    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center space-y-3">
        <div className="text-3xl">✓</div>
        <h2 className="text-lg font-semibold text-green-800">¡Reserva confirmada!</h2>
        <p className="text-sm text-green-700">
          {selection?.fecha} a las {selection?.hora} con {selection?.employeeName}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          {session && (
            <button
              onClick={() => router.push('/cliente/reservas')}
              className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 transition"
            >
              Ver mis reservas
            </button>
          )}
          <button
            onClick={() => router.push('/catalogo')}
            className="rounded-lg border border-green-300 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-100 transition"
          >
            Ver más autos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Vehículo */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-500">Vehículo</p>
        <p className="text-sm font-semibold text-gray-900">{vehicleName}</p>
      </div>

      {/* Selector de turno */}
      <SlotPicker vehicleId={vehicleId} onSelect={handleSelect} />

      {/* Formulario de datos */}
      {selection && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span className="font-medium">{selection.fecha}</span> a las{' '}
            <span className="font-medium">{selection.hora}</span> con{' '}
            <span className="font-medium">{selection.employeeName}</span>
          </div>

          {session ? (
            <div className="rounded-xl border border-gray-200 px-4 py-3 space-y-1">
              <p className="text-xs text-gray-500">Tus datos</p>
              <p className="text-sm font-medium text-gray-900">
                {session.nombre} {session.apellido}
              </p>
              <p className="text-sm text-gray-500">{session.email}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Tus datos de contacto</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input name="nombre" required className={inputCls} placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input name="apellido" required className={inputCls} placeholder="García" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input name="telefono" required type="tel" className={inputCls} placeholder="099 000 000" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input name="email" required type="email" className={inputCls} placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Mensaje (opcional)
                </label>
                <textarea
                  name="mensaje"
                  rows={3}
                  className={inputCls + ' resize-none'}
                  placeholder="¿Alguna consulta o comentario?"
                />
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
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {submitting ? 'Confirmando...' : 'Confirmar reserva'}
          </button>
        </form>
      )}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition'
