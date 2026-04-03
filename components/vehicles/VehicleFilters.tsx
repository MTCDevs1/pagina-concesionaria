'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  marcas: string[]; combustibles: string[]; transmisiones: string[]
  years: number[]; tipos: string[]
}

export default function VehicleFilters({ marcas, combustibles, transmisiones, years, tipos }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) { params.set(key, value) } else { params.delete(key) }
    params.delete('page')
    router.push(`/catalogo?${params.toString()}`)
  }, [router, searchParams])

  const get = (key: string) => searchParams.get(key) ?? ''
  const hasFilters = [...searchParams.entries()].length > 0

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider">Filtros</h2>
        {hasFilters && (
          <button onClick={() => router.push('/catalogo')}
            className="text-xs text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Limpiar todo
          </button>
        )}
      </div>

      <FilterSection label="Buscar">
        <input type="text" defaultValue={get('q')} placeholder="Marca, modelo..."
          className="input-dark"
          onKeyDown={e => { if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value) }}
          onBlur={e => update('q', e.target.value)}
        />
      </FilterSection>

      {tipos.length > 0 && (
        <FilterSection label="Tipo">
          <select value={get('tipo')} onChange={e => update('tipo', e.target.value)} className="select-dark">
            <option value="">Todos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FilterSection>
      )}

      <FilterSection label="Marca">
        <select value={get('marca')} onChange={e => update('marca', e.target.value)} className="select-dark">
          <option value="">Todas</option>
          {marcas.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Combustible">
        <select value={get('combustible')} onChange={e => update('combustible', e.target.value)} className="select-dark">
          <option value="">Todos</option>
          {combustibles.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Transmisión">
        <select value={get('transmision')} onChange={e => update('transmision', e.target.value)} className="select-dark">
          <option value="">Todas</option>
          {transmisiones.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Año">
        <div className="flex gap-2">
          <select value={get('anio_min')} onChange={e => update('anio_min', e.target.value)} className="select-dark">
            <option value="">Desde</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={get('anio_max')} onChange={e => update('anio_max', e.target.value)} className="select-dark">
            <option value="">Hasta</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </FilterSection>

      <FilterSection label="Precio máx (USD)">
        <input type="number" defaultValue={get('precio_max')} placeholder="Sin límite"
          className="input-dark"
          onBlur={e => update('precio_max', e.target.value)} />
      </FilterSection>

      <FilterSection label="Kilometraje máx">
        <input type="number" defaultValue={get('km_max')} placeholder="Sin límite"
          className="input-dark"
          onBlur={e => update('km_max', e.target.value)} />
      </FilterSection>
    </aside>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t border-[#334155] pt-4">
      <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}
