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
      <h1 className="text-2xl font-bold text-[#F1F5F9]">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total"        value={totals.total}       color="border-[#334155] bg-[#1E293B] text-[#F1F5F9]" />
        <StatCard label="Confirmadas"  value={totals.confirmadas} color="border-blue-500/25 bg-blue-600/10 text-blue-300" />
        <StatCard label="Realizadas"   value={totals.realizadas}  color="border-green-500/25 bg-green-500/10 text-green-300" />
        <StatCard label="Canceladas"   value={totals.canceladas}  color="border-[#334155] bg-[#1E293B] text-[#64748B]" />
        <StatCard label="No asistió"   value={totals.no_asistio}  color="border-red-500/25 bg-red-500/10 text-red-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Próximas reservas */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">Próximas reservas</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[#475569]">Sin reservas próximas</p>
          ) : (
            <div className="rounded-2xl border border-[#334155] divide-y divide-[#1E293B] overflow-hidden">
              {upcoming.map(a => {
                const client = a.client_nombre ? `${a.client_nombre} ${a.client_apellido}` : `${a.guest_nombre} ${a.guest_apellido}`
                const vehicle = `${a.vehicle_marca} ${a.vehicle_modelo}`
                const dt = new Date(a.fecha_hora)
                return (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm bg-[#1E293B] hover:bg-[#334155] transition-colors">
                    <div>
                      <p className="font-medium text-[#F1F5F9]">{vehicle}</p>
                      <p className="text-xs text-[#64748B]">{client} · {a.employee_nombre} {a.employee_apellido}</p>
                    </div>
                    <p className="text-xs text-[#64748B] shrink-0 ml-4">
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
          <h2 className="text-sm font-semibold text-[#F1F5F9]">Top empleados</h2>
          <div className="rounded-2xl border border-[#334155] divide-y divide-[#334155] overflow-hidden">
            {topEmployees.length === 0 ? (
              <p className="text-sm text-[#475569] p-4">Sin datos</p>
            ) : topEmployees.map(e => (
              <div key={e.nombre} className="flex items-center justify-between px-4 py-3 text-sm bg-[#1E293B] hover:bg-[#334155] transition-colors">
                <p className="font-medium text-[#F1F5F9]">{e.nombre} {e.apellido}</p>
                <div className="text-right text-xs text-[#64748B]">
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
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Vehículos más reservados</h2>
        <div className="rounded-2xl border border-[#334155] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#020617] text-xs text-[#64748B] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Vehículo</th>
                <th className="px-4 py-3 text-right">Reservas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {topVehicles.map(v => (
                <tr key={`${v.marca}-${v.modelo}`} className="bg-[#1E293B] hover:bg-[#334155] transition-colors">
                  <td className="px-4 py-3 text-[#F1F5F9]">
                    {[v.marca, v.modelo, v.version].filter(Boolean).join(' ')}
                  </td>
                  <td className="px-4 py-3 text-right text-[#64748B]">{v.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservas por mes */}
      {byMonth.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">Reservas últimos 6 meses</h2>
          <div className="rounded-2xl border border-[#334155] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#020617] text-xs text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Mes</th>
                  <th className="px-4 py-3 text-right">Confirmadas</th>
                  <th className="px-4 py-3 text-right">Realizadas</th>
                  <th className="px-4 py-3 text-right">Canceladas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {byMonth.map(m => (
                  <tr key={m.mes} className="bg-[#1E293B] hover:bg-[#334155] transition-colors">
                    <td className="px-4 py-3 text-[#F1F5F9] font-medium">{m.mes}</td>
                    <td className="px-4 py-3 text-right text-blue-400">{m.confirmadas}</td>
                    <td className="px-4 py-3 text-right text-green-400">{m.realizadas}</td>
                    <td className="px-4 py-3 text-right text-[#64748B]">{m.canceladas}</td>
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
