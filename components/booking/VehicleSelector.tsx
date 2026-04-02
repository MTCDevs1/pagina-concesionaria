'use client'

import Image from 'next/image'
import type { Vehicle } from '@/lib/db/vehicles'
import { MAX_VEHICLES_PER_VISIT } from '@/lib/scheduling/constants'

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

type Props = {
  vehicles: Vehicle[]
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function VehicleSelector({ vehicles, selected, onChange }: Props) {
  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter(v => v !== id))
    } else if (selected.length < MAX_VEHICLES_PER_VISIT) {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Seleccioná los vehículos que querés ver
        </p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          selected.length === MAX_VEHICLES_PER_VISIT
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {selected.length}/{MAX_VEHICLES_PER_VISIT}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
        {vehicles.map(v => {
          const isSelected = selected.includes(v.id)
          const isDisabled = !isSelected && selected.length >= MAX_VEHICLES_PER_VISIT
          const name = [v.marca, v.modelo, v.version].filter(Boolean).join(' ')

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => toggle(v.id)}
              disabled={isDisabled}
              className={`flex gap-3 items-center rounded-xl border-2 p-3 text-left transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {v.portada_url
                  ? <Image src={v.portada_url} alt={name} fill className="object-cover" sizes="56px" />
                  : <div className="w-full h-full bg-gray-200" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-500">{v.anio}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{formatPrice(v.precio)}</p>
              </div>
              {isSelected && (
                <div className="shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
