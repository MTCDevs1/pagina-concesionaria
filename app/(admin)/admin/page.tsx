export const dynamic = 'force-dynamic'

import { getDashboardMetrics } from '@/lib/db/metrics'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-60">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const { totals, upcoming, topVehicles, topEmployees, byMonth } = await getDashboardMetrics()

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total"        value={totals.total}       color="border-gray-200 bg-white text-gray-900" />
        <StatCard label="Confirmadas"  value={totals.confirmadas} color="border-blue-200 bg-blue-50 text-blue-900" />
        <StatCard label="Realizadas"   value={totals.realizadas}  color="border-green-200 bg-green-50 text-green-900" />
        <StatCard label="Canceladas"   value={totals.canceladas}  color="border-gray-200 bg-gray-50 text-gray-700" />
        <StatCard label="No asistió"   value={totals.no_asistio}  color="border-red-200 bg-red-50 text-red-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Próximas reservas */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Próximas reservas</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400">Sin reservas próximas</p>
          ) : (
            <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {upcoming.map(a => {
                const client = a.client_nombre ? `${a.client_nombre} ${a.client_apellido}` : `${a.guest_nombre} ${a.guest_apellido}`
                const vehicle = `${a.vehicle_marca} ${a.vehicle_modelo}`
                const dt = new Date(a.fecha_hora)
                return (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{vehicle}</p>
                      <p className="text-xs text-gray-500">{client} · {a.employee_nombre} {a.employee_apellido}</p>
                    </div>
                    <p className="text-xs text-gray-500 shrink-0 ml-4">
                      {dt.toLocaleDateString('es-UY')} {dt.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top empleados */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Top empleados</h2>
          <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {topEmployees.length === 0 ? (
              <p className="text-sm text-gray-400 p-4">Sin datos</p>
            ) : topEmployees.map(e => (
              <div key={e.nombre} className="flex items-center justify-between px-4 py-3 text-sm">
                <p className="font-medium text-gray-900">{e.nombre} {e.apellido}</p>
                <div className="text-right text-xs text-gray-500">
                  <p>{e.realizadas} realizadas</p>
                  <p>{e.total} total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top vehículos */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Vehículos más reservados</h2>
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Vehículo</th>
                <th className="px-4 py-3 text-right">Reservas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topVehicles.map(v => (
                <tr key={`${v.marca}-${v.modelo}`} className="bg-white">
                  <td className="px-4 py-3 text-gray-900">
                    {[v.marca, v.modelo, v.version].filter(Boolean).join(' ')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{v.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservas por mes */}
      {byMonth.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Reservas últimos 6 meses</h2>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Mes</th>
                  <th className="px-4 py-3 text-right">Confirmadas</th>
                  <th className="px-4 py-3 text-right">Realizadas</th>
                  <th className="px-4 py-3 text-right">Canceladas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {byMonth.map(m => (
                  <tr key={m.mes} className="bg-white">
                    <td className="px-4 py-3 text-gray-900 font-medium">{m.mes}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{m.confirmadas}</td>
                    <td className="px-4 py-3 text-right text-green-600">{m.realizadas}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{m.canceladas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
