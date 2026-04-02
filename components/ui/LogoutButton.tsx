'use client'

import { logoutAction } from '@/lib/auth/actions'

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={className ?? 'text-sm text-gray-500 hover:text-gray-900 transition'}
      >
        Cerrar sesión
      </button>
    </form>
  )
}
