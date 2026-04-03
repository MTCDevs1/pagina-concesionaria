export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/auth/session'
import { getEmployeeAppointments } from '@/lib/db/appointments.employee'
import EmployeeCalendar from '@/components/admin/EmployeeCalendar'

export default async function CalendarioPage() {
  const session = await getSession()

  // Mostrar semana actual
  const today = new Date()
  const from = today.toISOString().split('T')[0]
  const toDate = new Date(today)
  toDate.setDate(toDate.getDate() + 13)
  const to = toDate.toISOString().split('T')[0]

  const appointments = await getEmployeeAppointments(session!.id, from, to)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">Calendario</h1>
      <EmployeeCalendar appointments={appointments} from={from} to={to} />
    </div>
  )
}
