'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Vehicle = {
  id: number; marca: string; modelo: string; version: string | null
  anio: number; precio: number; destacado: boolean
  deleted_at: string | null; portada_url: string | null; total_reservas: string
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function VehicleAdminTable({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: number) {
    setDeleting(id)
    setConfirmId(null)
    setError(null)
    const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeleting(null)
    if (!res.ok) { setError(data.error); return }
    router.refresh()
  }

  const active = vehicles.filter(v => !v.deleted_at)
  const deleted = vehicles.filter(v => v.deleted_at)

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <VehicleTable title="Activos" items={active} deleting={deleting} confirmId={confirmId} onRequestDelete={setConfirmId} onConfirmDelete={handleDelete} onCancelDelete={() => setConfirmId(null)} />
      {deleted.length > 0 && (
        <VehicleTable title="Eliminados" items={deleted} deleting={deleting} confirmId={confirmId} onRequestDelete={setConfirmId} onConfirmDelete={handleDelete} onCancelDelete={() => setConfirmId(null)} dimmed />
      )}
    </div>
  )
}

function VehicleTable({
  title, items, deleting, confirmId, onRequestDelete, onConfirmDelete, onCancelDelete, dimmed
}: {
  title: string; items: Vehicle[]; deleting: number | null; confirmId: number | null
  onRequestDelete: (id: number) => void; onConfirmDelete: (id: number) => void
  onCancelDelete: () => void; dimmed?: boolean
}) {
  if (items.length === 0) return null
  return (
    <div>
      <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">{title}</h2>
      <div className="rounded-2xl border border-[#334155] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#020617] text-xs text-[#64748B] uppercase tracking-wider border-b border-[#334155]">
            <tr>
              <th className="px-4 py-3 text-left">Vehículo</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-center">Destacado</th>
              <th className="px-4 py-3 text-center">Reservas</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-[#334155] ${dimmed ? 'opacity-50' : ''}`}>
            {items.map(v => {
              const name = [v.marca, v.modelo, v.version].filter(Boolean).join(' ')
              return (
                <>
                  <tr key={v.id} className="bg-[#1E293B] hover:bg-[#334155] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#0F172A] shrink-0">
                          {v.portada_url
                            ? <Image src={v.portada_url} alt={name} fill className="object-cover" sizes="40px" />
                            : <div className="w-full h-full bg-[#334155]" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-[#F1F5F9]">{name}</p>
                          <p className="text-xs text-[#475569]">{v.anio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8] font-medium">{formatPrice(v.precio)}</td>
                    <td className="px-4 py-3 text-center text-[#64748B]">{v.destacado ? '★' : '—'}</td>
                    <td className="px-4 py-3 text-center text-[#64748B]">{v.total_reservas}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {!v.deleted_at && (
                          <Link href={`/empleado/vehiculos/${v.id}/editar`}
                            className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
                            Editar
                          </Link>
                        )}
                        {!v.deleted_at && (
                          confirmId === v.id ? (
                            <span className="flex items-center gap-1.5">
                              <button onClick={() => onConfirmDelete(v.id)} disabled={deleting === v.id}
                                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg disabled:opacity-50 transition-colors">
                                {deleting === v.id ? '...' : 'Sí, eliminar'}
                              </button>
                              <button onClick={onCancelDelete}
                                className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors">
                                Cancelar
                              </button>
                            </span>
                          ) : (
                            <button onClick={() => onRequestDelete(v.id)} disabled={deleting === v.id}
                              className="text-red-400 hover:text-red-300 text-xs font-medium disabled:opacity-50 transition-colors">
                              Eliminar
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
