import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db/client'
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/auth/passwords'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { nombre, apellido, telefono, email, currentPassword, newPassword } = body

  if (!nombre || !apellido || !email) {
    return NextResponse.json({ error: 'Nombre, apellido y email son obligatorios' }, { status: 400 })
  }

  // Si quiere cambiar contraseña, verificar la actual
  if (newPassword) {
    const user = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [session.id]
    )
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const valid = await verifyPassword(currentPassword ?? '', user.password_hash)
    if (!valid) return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })

    const pwError = validatePasswordStrength(newPassword)
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 })

    const newHash = await hashPassword(newPassword)
    await query(
      `UPDATE users SET nombre=$1, apellido=$2, telefono=$3, email=$4, password_hash=$5, updated_at=NOW() WHERE id=$6`,
      [nombre.trim(), apellido.trim(), telefono?.trim() || null, email.toLowerCase().trim(), newHash, session.id]
    )
  } else {
    // Verificar que el email no esté en uso por otro usuario
    if (email.toLowerCase().trim() !== session.email) {
      const existing = await queryOne('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase().trim(), session.id])
      if (existing) return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 })
    }

    await query(
      `UPDATE users SET nombre=$1, apellido=$2, telefono=$3, email=$4, updated_at=NOW() WHERE id=$5`,
      [nombre.trim(), apellido.trim(), telefono?.trim() || null, email.toLowerCase().trim(), session.id]
    )
  }

  return NextResponse.json({ ok: true })
}
