import { query, queryOne } from './client'
import { TZ } from '@/lib/scheduling/slots'

export async function getDashboardMetrics() {
  const [totals, upcoming, topVehicles, topEmployees, byMonth] = await Promise.all([

    // Totales por estado
    query<{ estado: string; count: string }>(
      `SELECT estado, COUNT(*)::text AS count FROM appointments GROUP BY estado`
    ),

    // Próximas 5 reservas
    query<{
      id: number; fecha_hora: string; estado: string
      vehicle_marca: string; vehicle_modelo: string
      employee_nombre: string; employee_apellido: string
      client_nombre: string | null; guest_nombre: string | null
      client_apellido: string | null; guest_apellido: string | null
    }>(
      `SELECT
         a.id, a.estado,
         TO_CHAR(a.fecha_hora AT TIME ZONE $1, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_hora,
         v.marca AS vehicle_marca, v.modelo AS vehicle_modelo,
         emp.nombre AS employee_nombre, emp.apellido AS employee_apellido,
         u.nombre AS client_nombre, u.apellido AS client_apellido,
         a.guest_nombre, a.guest_apellido
       FROM appointments a
       JOIN vehicles v ON v.id = a.vehicle_id
       JOIN users emp ON emp.id = a.employee_id
       LEFT JOIN users u ON u.id = a.client_id
       WHERE a.estado = 'confirmada' AND a.fecha_hora > NOW()
       ORDER BY a.fecha_hora ASC
       LIMIT 5`,
      [TZ]
    ),

    // Top 5 vehículos más reservados
    query<{ marca: string; modelo: string; version: string | null; total: string }>(
      `SELECT v.marca, v.modelo, v.version, COUNT(a.id)::text AS total
       FROM appointments a
       JOIN vehicles v ON v.id = a.vehicle_id
       WHERE a.estado != 'cancelada'
       GROUP BY v.id, v.marca, v.modelo, v.version
       ORDER BY total DESC
       LIMIT 5`
    ),

    // Top 5 empleados
    query<{ nombre: string; apellido: string; realizadas: string; total: string }>(
      `SELECT
         u.nombre, u.apellido,
         COUNT(CASE WHEN a.estado = 'realizada' THEN 1 END)::text AS realizadas,
         COUNT(CASE WHEN a.estado != 'cancelada' THEN 1 END)::text AS total
       FROM appointments a
       JOIN users u ON u.id = a.employee_id
       GROUP BY u.id, u.nombre, u.apellido
       ORDER BY realizadas DESC
       LIMIT 5`
    ),

    // Reservas por mes (últimos 6 meses)
    query<{ mes: string; confirmadas: string; realizadas: string; canceladas: string }>(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', fecha_hora AT TIME ZONE $1), 'YYYY-MM') AS mes,
         COUNT(CASE WHEN estado = 'confirmada' THEN 1 END)::text AS confirmadas,
         COUNT(CASE WHEN estado = 'realizada'  THEN 1 END)::text AS realizadas,
         COUNT(CASE WHEN estado = 'cancelada'  THEN 1 END)::text AS canceladas
       FROM appointments
       WHERE fecha_hora >= NOW() - INTERVAL '6 months'
       GROUP BY mes
       ORDER BY mes ASC`,
      [TZ]
    ),
  ])

  const countMap = Object.fromEntries(totals.map(r => [r.estado, parseInt(r.count)]))

  return {
    totals: {
      confirmadas: countMap.confirmada ?? 0,
      realizadas: countMap.realizada ?? 0,
      canceladas: countMap.cancelada ?? 0,
      no_asistio: countMap.no_asistio ?? 0,
      total: Object.values(countMap).reduce((a, b) => a + b, 0),
    },
    upcoming,
    topVehicles,
    topEmployees,
    byMonth,
  }
}

export async function getAuditLogs(limit = 50, offset = 0) {
  return query<{
    id: number; action: string; entity_type: string; entity_id: number | null
    user_nombre: string | null; user_apellido: string | null
    old_data: unknown; new_data: unknown; ip: string | null; created_at: string
  }>(
    `SELECT
       al.id, al.action, al.entity_type, al.entity_id, al.old_data, al.new_data, al.ip,
       TO_CHAR(al.created_at AT TIME ZONE $3, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
       u.nombre AS user_nombre, u.apellido AS user_apellido
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset, TZ]
  )
}

export async function countAuditLogs(): Promise<number> {
  const r = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM audit_logs')
  return parseInt(r?.count ?? '0')
}
