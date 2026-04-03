export const dynamic = 'force-dynamic'

import { getAuditLogs, countAuditLogs } from '@/lib/db/metrics'
import RefreshButton from './RefreshButton'

const PAGE_SIZE = 50

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page ?? 1))
  const offset = (currentPage - 1) * PAGE_SIZE

  const [logs, total] = await Promise.all([
    getAuditLogs(PAGE_SIZE, offset),
    countAuditLogs(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Auditoría</h1>
          <p className="text-sm text-[#64748B] mt-1">{total} registros totales</p>
        </div>
        <RefreshButton />
      </div>

      <div className="rounded-2xl border border-[#334155] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#020617] text-xs text-[#64748B] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Acción</th>
              <th className="px-4 py-3 text-left">Entidad</th>
              <th className="px-4 py-3 text-left">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#475569]">Sin registros</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="bg-[#1E293B] hover:bg-[#334155] transition-colors">
                <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{log.created_at}</td>
                <td className="px-4 py-3 text-[#94A3B8]">
                  {log.user_nombre ? `${log.user_nombre} ${log.user_apellido}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-[#334155] px-2 py-0.5 text-xs font-mono text-[#94A3B8]">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#64748B] text-xs">
                  {log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}
                </td>
                <td className="px-4 py-3 text-xs text-[#475569]">{log.ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <span>Página {currentPage} de {totalPages}</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a href={`?page=${currentPage - 1}`}
                className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-1.5 hover:bg-[#334155] text-[#94A3B8] transition">
                ← Anterior
              </a>
            )}
            {currentPage < totalPages && (
              <a href={`?page=${currentPage + 1}`}
                className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-1.5 hover:bg-[#334155] text-[#94A3B8] transition">
                Siguiente →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
