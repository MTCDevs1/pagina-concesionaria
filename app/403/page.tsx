import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-gray-900">403</p>
        <p className="mt-3 text-gray-500">No tenés permiso para acceder a esta página.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
