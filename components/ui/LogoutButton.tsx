'use client'

import { logoutAction } from '@/lib/auth/actions'

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={className ?? 'rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150'}
      >
        Cerrar sesión
      </button>
    </form>
  )
}
