'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { UserAdmin } from '@/lib/db/users.admin'

const ROLES = [
  { id: 1, name: 'cliente' },
  { id: 2, name: 'empleado' },
  { id: 3, name: 'admin' },
]

const ROLE_STYLE: Record<string, string> = {
  cliente:  'bg-[#334155] text-[#94A3B8] border border-[#475569]/30',
  empleado: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  admin:    'bg-purple-500/15 text-purple-400 border border-purple-500/25',
}

const inputCls = 'w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition'

type FormData = {
  email: string; password: string; nombre: string
  apellido: string; telefono: string; role_id: number
}

const EMPTY_FORM: FormData = { email: '', password: '', nombre: '', apellido: '', telefono: '', role_id: 1 }

export default function UsersManager({ users }: { users: UserAdmin[] }) {
  const router = useRouter()
  const [modal, setModal] = useState<'create' | { user: UserAdmin } | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState<number | null>(null)

  function openCreate() {
    setForm(EMPTY_FORM)
    setError(null)
    setModal('create')
  }

  function openEdit(user: UserAdmin) {
    setForm({ email: user.email, password: '', nombre: user.nombre, apellido: user.apellido, telefono: user.telefono ?? '', role_id: user.role_id })
    setError(null)
    setModal({ user })
  }

  const set = (k: keyof FormData, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (modal === 'create') {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setSubmitting(false)
      if (!res.ok) { setError(data.error); return }
    } else if (modal && typeof modal === 'object') {
      const payload: Record<string, unknown> = { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono, role_id: form.role_id }
      if (form.password) payload.password = form.password
      const res = await fetch(`/api/users/${modal.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setSubmitting(false)
      if (!res.ok) { setError(data.error); return }
    }

    setModal(null)
    router.refresh()
  }

  async function handleDeactivate(id: number) {
    if (!confirm('¿Desactivar este usuario?')) return
    setDeactivating(id)
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeactivating(null)
    if (!res.ok) { alert(data.error); return }
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <button onClick={openCreate}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition">
        + Nuevo usuario
      </button>

      <div className="rounded-2xl border border-[#334155] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#020617] text-xs text-[#64748B] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-center">Reservas</th>
              <th className="px-4 py-3 text-left">Registro</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {users.map(u => (
              <tr key={u.id} className={`bg-[#1E293B] hover:bg-[#334155] transition-colors ${!u.activo ? 'opacity-40' : ''}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#F1F5F9]">{u.nombre} {u.apellido}</p>
                  <p className="text-xs text-[#64748B]">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[u.role_name]}`}>
                    {u.role_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-[#64748B]">{u.total_reservas}</td>
                <td className="px-4 py-3 text-[#64748B] text-xs">{u.created_at}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openEdit(u)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">Editar</button>
                    {u.role_name === 'empleado' && u.activo && (
                      <Link href={`/admin/usuarios/${u.id}/horario`} className="text-[#64748B] hover:text-[#94A3B8] text-xs transition-colors">
                        Horario
                      </Link>
                    )}
                    {u.activo && (
                      <button onClick={() => handleDeactivate(u.id)} disabled={deactivating === u.id}
                        className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50 transition-colors">
                        {deactivating === u.id ? '...' : 'Desactivar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[#F1F5F9]">{modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</h3>
              <button onClick={() => setModal(null)} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2 text-sm text-red-400">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Nombre *</label>
                  <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Apellido *</label>
                  <input value={form.apellido} onChange={e => set('apellido', e.target.value)} required className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">Email {modal === 'create' && '*'}</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  required={modal === 'create'} disabled={modal !== 'create'} className={inputCls + (modal !== 'create' ? ' opacity-50' : '')} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                  Contraseña {modal === 'create' ? '*' : '(dejar en blanco para no cambiar)'}
                </label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  required={modal === 'create'} placeholder="Mínimo 8 caracteres" className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">Teléfono</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">Rol *</label>
                <select value={form.role_id} onChange={e => set('role_id', Number(e.target.value))} className={inputCls + ' bg-[#0F172A]'}>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60 transition">
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 rounded-lg border border-[#334155] bg-[#0F172A] py-2 text-sm font-medium text-[#94A3B8] hover:bg-[#334155] transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
