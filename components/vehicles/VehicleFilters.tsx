'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  marcas: string[]
  combustibles: string[]
  transmisiones: string[]
  years: number[]
}

export default function VehicleFilters({ marcas, combustibles, transmisiones, years }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/catalogo?${params.toString()}`)
    },
    [router, searchParams]
  )

  const get = (key: string) => searchParams.get(key) ?? ''

  return (
    <aside className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Filtros</h2>
        <button
          onClick={() => router.push('/catalogo')}
          className="text-xs text-blue-600 hover:underline"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Búsqueda */}
      <FilterSection label="Buscar">
        <input
          type="text"
          defaultValue={get('q')}
          placeholder="Marca, modelo..."
          onKeyDown={e => {
            if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value)
          }}
          onBlur={e => update('q', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
      </FilterSection>

      {/* Marca */}
      <FilterSection label="Marca">
        <select
          value={get('marca')}
          onChange={e => update('marca', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
        >
          <option value="">Todas</option>
          {marcas.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </FilterSection>

      {/* Combustible */}
      <FilterSection label="Combustible">
        <select
          value={get('combustible')}
          onChange={e => update('combustible', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
        >
          <option value="">Todos</option>
          {combustibles.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FilterSection>

      {/* Transmisión */}
      <FilterSection label="Transmisión">
        <select
          value={get('transmision')}
          onChange={e => update('transmision', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
        >
          <option value="">Todas</option>
          {transmisiones.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </FilterSection>

      {/* Año */}
      <FilterSection label="Año">
        <div className="flex gap-2">
          <select
            value={get('anio_min')}
            onChange={e => update('anio_min', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
          >
            <option value="">Desde</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={get('anio_max')}
            onChange={e => update('anio_max', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
          >
            <option value="">Hasta</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </FilterSection>

      {/* Precio */}
      <FilterSection label="Precio máximo (USD)">
        <input
          type="number"
          defaultValue={get('precio_max')}
          placeholder="Sin límite"
          onBlur={e => update('precio_max', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
      </FilterSection>

      {/* Kilometraje */}
      <FilterSection label="Kilometraje máximo">
        <input
          type="number"
          defaultValue={get('km_max')}
          placeholder="Sin límite"
          onBlur={e => update('km_max', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
      </FilterSection>
    </aside>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )
}
