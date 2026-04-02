import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE = 'driveone_session'

type Role = 'cliente' | 'empleado' | 'admin'

const PROTECTED: { pattern: RegExp; roles: Role[] }[] = [
  { pattern: /^\/admin(\/|$)/,    roles: ['admin'] },
  { pattern: /^\/empleado(\/|$)/, roles: ['empleado', 'admin'] },
  { pattern: /^\/cliente(\/|$)/,  roles: ['cliente', 'empleado', 'admin'] },
]

const AUTH_ROUTES = ['/login', '/registro']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE)?.value

  let role: Role | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET)
      role = payload.role as Role
    } catch {
      // token inválido → tratar como no logueado
    }
  }

  // Si está logueado e intenta entrar a /login o /registro → redirigir
  if (role && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    const redirects: Record<Role, string> = {
      admin: '/admin',
      empleado: '/empleado/calendario',
      cliente: '/cliente/reservas',
    }
    return NextResponse.redirect(new URL(redirects[role], req.url))
  }

  // Rutas protegidas
  for (const { pattern, roles } of PROTECTED) {
    if (pattern.test(pathname)) {
      if (!role) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      if (!roles.includes(role)) {
        return NextResponse.redirect(new URL('/403', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/empleado/:path*', '/cliente/:path*', '/login', '/registro', '/reservar'],
}
