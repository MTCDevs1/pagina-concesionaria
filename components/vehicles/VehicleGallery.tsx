'use client'

import { useState } from 'react'
import Image from 'next/image'

type Img = { id: number; url: string; es_portada: boolean; orden: number }

export default function VehicleGallery({ images, name }: { images: Img[]; name: string }) {
  const sorted = [...images].sort((a, b) => (b.es_portada ? 1 : 0) - (a.es_portada ? 1 : 0) || a.orden - b.orden)
  const [active, setActive] = useState(0)

  if (sorted.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
        Sin imágenes
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Imagen principal */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={sorted[active].url}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === active ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
