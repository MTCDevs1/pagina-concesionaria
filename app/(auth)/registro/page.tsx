'use client'

import { useActionState } from 'react'
import { registroAction } from '@/lib/auth/actions'
import Link from 'next/link'

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all duration-200'

export default function RegistroPage() {
  const [error, action, pending] = useActionState(registroAction, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F3F5F9] px-4 py-12">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              D
            </div>
            <span className="text-xl font-bold text-slate-900">DriveOne</span>
          </Link>
          <p className="text-slate-500 text-sm">Creá tu cuenta y empezá a reservar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form action={action} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input id="nombre" name="nombre" type="text" required className={inputCls} placeholder="Juan" />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input id="apellido" name="apellido" type="text" required className={inputCls} placeholder="García" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} placeholder="tu@email.com" />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1.5">
                Teléfono
              </label>
              <input id="telefono" name="telefono" type="tel" className={inputCls} placeholder="099 000 000" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input id="password" name="password" type="password" required autoComplete="new-password" className={inputCls} placeholder="Mínimo 8 caracteres" />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <input id="confirm" name="confirm" type="password" required autoComplete="new-password" className={inputCls} placeholder="••••••••" />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
            >
              {pending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Ingresá
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/catalogo" className="hover:text-slate-600 transition-colors">
            ← Volver al catálogo
          </Link>
        </p>
      </div>
    </main>
  )
}
