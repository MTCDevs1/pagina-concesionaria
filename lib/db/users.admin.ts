import { query, queryOne } from './client'
import { hashPassword } from '@/lib/auth/passwords'

export type UserAdmin = {
  id: number; email: string; nombre: string; apellido: string
  telefono: string | null; role_id: number; role_name: string
  activo: boolean; created_at: string
  total_reservas: string
}

export async function getAllUsers(): Promise<UserAdmin[]> {
  return query<UserAdmin>(
    `SELECT
       u.id, u.email, u.nombre, u.apellido, u.telefono, u.role_id, u.activo,
       r.name AS role_name,
       TO_CHAR(u.created_at, 'DD/MM/YYYY') AS created_at,
       COUNT(a.id)::text AS total_reservas
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN appointments a ON a.client_id = u.id
     GROUP BY u.id, r.name
     ORDER BY u.created_at DESC`
  )
}

export async function createUser(data: {
  email: string; password: string; nombre: string
  apellido: string; telefono?: string; role_id: number
}): Promise<{ id: number } | { error: string }> {
  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [data.email])
  if (existing) return { error: 'Ya existe un usuario con ese email' }

  const hash = await hashPassword(data.password)
  const result = await queryOne<{ id: number }>(
    `INSERT INTO users (email, password_hash, nombre, apellido, telefono, role_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [data.email, hash, data.nombre, data.apellido, data.telefono ?? null, data.role_id]
  )
  return { id: result!.id }
}

export async function updateUser(id: number, data: {
  nombre?: string; apellido?: string; telefono?: string
  role_id?: number; activo?: boolean; password?: string
}): Promise<{ error?: string }> {
  const sets: string[] = []
  const values: unknown[] = []
  let i = 2

  if (data.nombre !== undefined)   { sets.push(`nombre = $${i++}`);   values.push(data.nombre) }
  if (data.apellido !== undefined) { sets.push(`apellido = $${i++}`); values.push(data.apellido) }
  if (data.telefono !== undefined) { sets.push(`telefono = $${i++}`); values.push(data.telefono) }
  if (data.role_id !== undefined)  { sets.push(`role_id = $${i++}`);  values.push(data.role_id) }
  if (data.activo !== undefined)   { sets.push(`activo = $${i++}`);   values.push(data.activo) }
  if (data.password) {
    const hash = await hashPassword(data.password)
    sets.push(`password_hash = $${i++}`)
    values.push(hash)
  }

  if (!sets.length) return {}
  await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $1`, [id, ...values])
  return {}
}

export async function deleteUser(id: number): Promise<{ error?: string }> {
  const futureAppts = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM appointments
     WHERE (client_id = $1 OR employee_id = $1) AND fecha_hora > NOW() AND estado = 'confirmada'`,
    [id]
  )
  if (futureAppts && parseInt(futureAppts.count) > 0) {
    return { error: `No se puede eliminar: tiene ${futureAppts.count} reserva(s) futura(s)` }
  }
  await query('UPDATE users SET activo = FALSE WHERE id = $1', [id])
  return {}
}
