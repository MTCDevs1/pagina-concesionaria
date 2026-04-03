'use client'

import { useState } from 'react'

type Props = {
  user: { nombre: string; apellido: string; email: string; telefono: string | null }
}

const inputCls = 'w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition'
const labelCls = 'block text-xs font-medium text-[#94A3B8] mb-1'

export default function ProfileEditForm({ user }: Props) {
  const [form, setForm] = useState({
    nombre:          user.nombre,
    apellido:        user.apellido,
    email:           user.email,
    telefono:        user.telefono ?? '',
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [showPw, setShowPw]   = useState(false)

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSuccess(false); setError(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (showPw && form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    setSaving(true)
    setError(null)

    const body: Record<string, string> = {
      nombre:   form.nombre,
      apellido: form.apellido,
      email:    form.email,
      telefono: form.telefono,
    }
    if (showPw && form.newPassword) {
      body.currentPassword = form.currentPassword
      body.newPassword     = form.newPassword
    }

    const res = await fetch('/api/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error); return }
    setSuccess(true)
    setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
    setShowPw(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nombre</label>
          <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Apellido</label>
          <input value={form.apellido} onChange={e => set('apellido', e.target.value)} required className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Teléfono</label>
          <input value={form.telefono} onChange={e => set('telefono', e.target.value)} className={inputCls} placeholder="099 000 000" />
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div>
        <button type="button" onClick={() => setShowPw(v => !v)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          {showPw ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
        </button>
      </div>

      {showPw && (
        <div className="space-y-4 rounded-xl border border-[#334155] p-4 bg-[#0F172A]">
          <div>
            <label className={labelCls}>Contraseña actual</label>
            <input type="password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} required className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nueva contraseña</label>
              <input type="password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Confirmar nueva contraseña</label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required className={inputCls} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 text-sm text-emerald-400">
          Datos actualizados correctamente.
        </div>
      )}

      <button type="submit" disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition">
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
