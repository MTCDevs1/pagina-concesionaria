'use server'

import { redirect } from 'next/navigation'
import { queryOne } from '@/lib/db/client'
import { createSession, deleteSession, getSession } from './session'
import { hashPassword, verifyPassword, validatePasswordStrength } from './passwords'
import { logAudit } from '@/lib/db/audit'

type User = {
  id: number
  email: string
  password_hash: string
  nombre: string
  apellido: string
  role_name: string
  activo: boolean
}

// ─── LOGIN ───────────────────────────────────────────────────
export async function loginAction(prevState: string | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return 'Completá todos los campos'

  const user = await queryOne<User>(
    `SELECT u.id, u.email, u.password_hash, u.nombre, u.apellido, u.activo, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email.toLowerCase().trim()]
  )

  if (!user || !user.activo) return 'Credenciales inválidas'

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return 'Credenciales inválidas'

  await createSession({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    role: user.role_name as 'cliente' | 'empleado' | 'admin',
  })

  await logAudit({ action: 'LOGIN', entityType: 'users', entityId: user.id, userId: user.id })

  const redirects: Record<string, string> = {
    admin: '/admin',
    empleado: '/empleado/calendario',
    cliente: '/cliente/reservas',
  }
  redirect(redirects[user.role_name] ?? '/')
}

// ─── REGISTRO ────────────────────────────────────────────────
export async function registroAction(prevState: string | null, formData: FormData) {
  const nombre   = (formData.get('nombre')   as string)?.trim()
  const apellido = (formData.get('apellido') as string)?.trim()
  const email    = (formData.get('email')    as string)?.toLowerCase().trim()
  const telefono = (formData.get('telefono') as string)?.trim()
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  if (!nombre || !apellido || !email || !password)
    return 'Completá todos los campos obligatorios'

  const pwError = validatePasswordStrength(password)
  if (pwError) return pwError

  if (password !== confirm) return 'Las contraseñas no coinciden'

  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email])
  if (existing) return 'Ya existe una cuenta con ese email'

  const hash = await hashPassword(password)

  const { query } = await import('@/lib/db/client')
  await query(
    `INSERT INTO users (email, password_hash, nombre, apellido, telefono, role_id)
     VALUES ($1, $2, $3, $4, $5, 1)`,
    [email, hash, nombre, apellido, telefono || null]
  )

  const user = await queryOne<User>(
    `SELECT u.id, u.email, u.password_hash, u.nombre, u.apellido, u.activo, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = $1`,
    [email]
  )

  if (!user) return 'Error al crear la cuenta'

  await createSession({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    role: 'cliente',
  })

  await logAudit({ action: 'REGISTER', entityType: 'users', entityId: user.id, userId: user.id, newData: { email, nombre, apellido } })

  redirect('/cliente/reservas')
}

// ─── LOGOUT ──────────────────────────────────────────────────
export async function logoutAction() {
  const session = await getSession()
  if (session) {
    await logAudit({ action: 'LOGOUT', entityType: 'users', entityId: session.id, userId: session.id })
  }
  await deleteSession()
  redirect('/')
}
