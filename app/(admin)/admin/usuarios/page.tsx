export const dynamic = 'force-dynamic'

import { getAllUsers } from '@/lib/db/users.admin'
import UsersManager from '@/components/admin/UsersManager'

export default async function UsuariosPage() {
  const users = await getAllUsers()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">Usuarios</h1>
      <UsersManager users={users} />
    </div>
  )
}
