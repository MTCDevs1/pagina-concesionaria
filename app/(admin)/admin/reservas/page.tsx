export const dynamic = 'force-dynamic'

import { getAllAppointments } from '@/lib/db/appointments.employee'
import { getActiveEmployees } from '@/lib/db/employees'
import AdminReservations from '@/components/admin/AdminReservations'

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const today = new Date()
  const from = params.from ?? today.toISOString().split('T')[0]
  const toDate = new Date(today)
  toDate.setDate(toDate.getDate() + 30)
  const to = params.to ?? toDate.toISOString().split('T')[0]

  const [appointments, employees] = await Promise.all([
    getAllAppointments(from, to),
    getActiveEmployees(),
  ])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">Reservas</h1>
      <AdminReservations appointments={appointments} employees={employees} from={from} to={to} />
    </div>
  )
}
