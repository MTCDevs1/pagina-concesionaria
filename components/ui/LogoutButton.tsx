'use client'

import { logoutAction } from '@/lib/auth/actions'

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={className ?? 'rounded-xl px-3.5 py-2 text-sm font-medium text-[#64748B] hover:text-red-400 hover:bg-red-500/8 transition-all duration-200'}
      >
        Salir
      </button>
    </form>
  )
}
