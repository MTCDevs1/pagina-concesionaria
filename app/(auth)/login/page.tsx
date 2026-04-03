'use client'

import { useActionState } from 'react'
import { loginAction } from '@/lib/auth/actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, action, pending] = useActionState(loginAction, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              D
            </div>
            <span className="text-xl font-bold text-white">DriveOne</span>
          </Link>
          <p className="text-[#64748B] text-sm">Ingresá a tu cuenta para continuar</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-8 shadow-2xl shadow-black/40">
          <form action={action} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label-dark">Email</label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                className="input-dark"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-dark">Contraseña</label>
              <input
                id="password" name="password" type="password" required autoComplete="current-password"
                className="input-dark"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base">
              {pending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Registrate gratis
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#475569]">
          <Link href="/catalogo" className="hover:text-[#94A3B8] transition-colors">
            ← Volver al catálogo
          </Link>
        </p>
      </div>
    </main>
  )
}
