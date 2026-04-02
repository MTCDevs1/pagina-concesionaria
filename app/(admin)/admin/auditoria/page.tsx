export const dynamic = 'force-dynamic'

import { getAuditLogs, countAuditLogs } from '@/lib/db/metrics'

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
      <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
      <p className="text-sm text-gray-500">{total} registros totales</p>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Acción</th>
              <th className="px-4 py-3 text-left">Entidad</th>
              <th className="px-4 py-3 text-left">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{log.created_at}</td>
                <td className="px-4 py-3 text-gray-700">
                  {log.user_nombre ? `${log.user_nombre} ${log.user_apellido}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{log.ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Página {currentPage} de {totalPages}</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a href={`?page=${currentPage - 1}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition">
                ← Anterior
              </a>
            )}
            {currentPage < totalPages && (
              <a href={`?page=${currentPage + 1}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition">
                Siguiente →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
