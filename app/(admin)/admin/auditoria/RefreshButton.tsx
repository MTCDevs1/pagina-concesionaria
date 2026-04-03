'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RefreshButton() {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)

  function handleRefresh() {
    setSpinning(true)
    router.refresh()
    setTimeout(() => setSpinning(false), 600)
  }

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center gap-2 rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-2 text-sm font-medium text-[#94A3B8] hover:bg-[#334155] hover:text-[#F1F5F9] transition-all duration-200"
    >
      <svg
        className={`h-4 w-4 transition-transform duration-500 ${spinning ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Actualizar
    </button>
  )
}
