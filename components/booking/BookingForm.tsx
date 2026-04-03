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

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all duration-200'

function formatDateLong(dateStr: string) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-UY', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function BookingForm({ vehicleId, vehicleName, session }: Props) {
  const router = useRouter()
  const [selection, setSelection] = useState<Selection | null>(null)
  const [step, setStep] = useState<'picker' | 'done'>('picker')
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
      body.nombre   = fd.get('nombre')   as string
      body.apellido = fd.get('apellido') as string
      body.telefono = fd.get('telefono') as string
      body.email    = fd.get('email')    as string
      body.mensaje  = fd.get('mensaje')  as string
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
      <div className="text-center space-y-5 py-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">¡Reserva confirmada!</h2>
          <p className="mt-1 text-sm text-slate-500">Te esperamos para la visita</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm text-emerald-800">
            <span>📅</span>
            <span className="font-semibold capitalize">{selection && formatDateLong(selection.fecha)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-800">
            <span>🕐</span>
            <span className="font-semibold">{selection?.hora} hs</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-800">
            <span>👤</span>
            <span className="font-semibold">{selection?.employeeName}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          {session && (
            <button
              onClick={() => router.push('/cliente/reservas')}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all duration-200"
            >
              Ver mis reservas
            </button>
          )}
          <button
            onClick={() => router.push('/catalogo')}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            Ver más autos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Selector de turno */}
      <SlotPicker vehicleId={vehicleId} onSelect={handleSelect} />

      {/* Resumen + datos + confirmar */}
      {selection && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          {/* Card resumen */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Tu selección</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-blue-900">
              <span className="flex items-center gap-1.5">
                <span>📅</span>
                <span className="font-semibold capitalize">{formatDateLong(selection.fecha)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span>🕐</span>
                <span className="font-semibold">{selection.hora} hs</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span>👤</span>
                <span className="font-semibold">{selection.employeeName}</span>
              </span>
            </div>
          </div>

          {/* Datos del usuario */}
          {session ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tus datos</p>
              <p className="text-sm font-semibold text-slate-900">
                {session.nombre} {session.apellido}
              </p>
              <p className="text-sm text-slate-500">{session.email}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tus datos de contacto</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input name="nombre" required className={inputCls} placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input name="apellido" required className={inputCls} placeholder="García" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input name="telefono" required type="tel" className={inputCls} placeholder="099 000 000" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input name="email" required type="email" className={inputCls} placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
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
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Confirmando...
              </span>
            ) : (
              'Confirmar reserva'
            )}
          </button>
        </form>
      )}
    </div>
  )
}
