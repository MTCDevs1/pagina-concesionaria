export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { queryOne } from '@/lib/db/client'
import Link from 'next/link'
import AvailabilityManagerAdmin from '@/components/admin/AvailabilityManagerAdmin'

export default async function HorarioEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin')

  const { id } = await params
  const empleado = await queryOne<{ id: number; nombre: string; apellido: string; email: string }>(
    `SELECT u.id, u.nombre, u.apellido, u.email
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1 AND r.name = 'empleado' AND u.activo = TRUE`,
    [Number(id)]
  )
  if (!empleado) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/usuarios" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          ← Volver a Usuarios
        </Link>
        <h1 className="text-2xl font-bold text-[#F1F5F9] mt-2">
          Horario de {empleado.nombre} {empleado.apellido}
        </h1>
        <p className="text-sm text-[#64748B]">{empleado.email}</p>
      </div>
      <AvailabilityManagerAdmin employeeId={empleado.id} />
    </div>
  )
}
