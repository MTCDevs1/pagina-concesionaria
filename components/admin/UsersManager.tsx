'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserAdmin } from '@/lib/db/users.admin'

const ROLES = [
  { id: 1, name: 'cliente' },
  { id: 2, name: 'empleado' },
  { id: 3, name: 'admin' },
]

const ROLE_STYLE: Record<string, string> = {
  cliente:  'bg-gray-100 text-gray-600',
  empleado: 'bg-blue-100 text-blue-700',
  admin:    'bg-purple-100 text-purple-700',
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition'

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
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
        + Nuevo usuario
      </button>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-center">Reservas</th>
              <th className="px-4 py-3 text-left">Registro</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className={`bg-white ${!u.activo ? 'opacity-40' : ''}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.nombre} {u.apellido}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[u.role_name]}`}>
                    {u.role_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{u.total_reservas}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.created_at}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    {u.activo && (
                      <button onClick={() => handleDeactivate(u.id)} disabled={deactivating === u.id}
                        className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-gray-900">{modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
                  <input value={form.apellido} onChange={e => set('apellido', e.target.value)} required className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email {modal === 'create' && '*'}</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  required={modal === 'create'} disabled={modal !== 'create'} className={inputCls + (modal !== 'create' ? ' opacity-50' : '')} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contraseña {modal === 'create' ? '*' : '(dejar en blanco para no cambiar)'}
                </label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  required={modal === 'create'} placeholder="Mínimo 8 caracteres" className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol *</label>
                <select value={form.role_id} onChange={e => set('role_id', Number(e.target.value))} className={inputCls}>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition">
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
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
