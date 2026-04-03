'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type ImageData = { id: number; url: string; es_portada: boolean; orden: number }

type InitialData = {
  id?: number
  marca?: string; modelo?: string; version?: string; anio?: number
  precio?: number; kilometraje?: number; combustible?: string
  transmision?: string; color?: string; descripcion?: string
  tipo?: string; estado_comercial?: string; publicado?: boolean
  destacado?: boolean; orden_destacado?: number | null
  images?: ImageData[]
}

const COMBUSTIBLES = ['Nafta', 'Diesel', 'Eléctrico', 'Híbrido', 'GNC']
const TRANSMISIONES = ['Manual', 'Automática']
const TIPOS = ['Sedán', 'Hatchback', 'SUV', 'Pickup', 'Camioneta', 'Coupé', 'Cabrio', 'Minivan', 'Furgón']
const ESTADOS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'reservado',  label: 'Reservado'  },
  { value: 'vendido',    label: 'Vendido'    },
]

const inputCls = 'w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition'
const labelCls = 'block text-xs font-medium text-[#94A3B8] mb-1'

export default function VehicleForm({ initial = {} }: { initial?: InitialData }) {
  const router = useRouter()
  const isEdit = !!initial.id

  const [form, setForm] = useState({
    marca:           initial.marca           ?? '',
    modelo:          initial.modelo          ?? '',
    version:         initial.version         ?? '',
    anio:            initial.anio            ?? new Date().getFullYear(),
    precio:          initial.precio          ?? '',
    kilometraje:     initial.kilometraje     ?? 0,
    combustible:     initial.combustible     ?? 'Nafta',
    transmision:     initial.transmision     ?? 'Manual',
    color:           initial.color           ?? '',
    descripcion:     initial.descripcion     ?? '',
    tipo:            initial.tipo            ?? '',
    estado_comercial: initial.estado_comercial ?? 'disponible',
    publicado:       initial.publicado       ?? true,
    destacado:       initial.destacado       ?? false,
    orden_destacado: initial.orden_destacado ?? '',
  })

  const [images, setImages]     = useState<ImageData[]>(initial.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      body: file,
    })
    const { url } = await res.json()
    setUploading(false)

    if (isEdit) {
      await fetch(`/api/vehicles/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_image', url, es_portada: images.length === 0, orden: images.length }),
      })
      setImages(prev => [...prev, { id: Date.now(), url, es_portada: prev.length === 0, orden: prev.length }])
    } else {
      setImages(prev => [...prev, { id: Date.now(), url, es_portada: prev.length === 0, orden: prev.length }])
    }
  }

  async function handleDeleteImage(img: ImageData) {
    if (isEdit) {
      await fetch(`/api/vehicles/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_image', imageId: img.id }),
      })
    }
    setImages(prev => prev.filter(i => i.id !== img.id))
  }

  async function handleSetPortada(img: ImageData) {
    if (isEdit) {
      await fetch(`/api/vehicles/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_portada', imageId: img.id }),
      })
    }
    setImages(prev => prev.map(i => ({ ...i, es_portada: i.id === img.id })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      ...form,
      anio:           Number(form.anio),
      precio:         Number(form.precio),
      kilometraje:    Number(form.kilometraje),
      tipo:           form.tipo || null,
      orden_destacado: form.orden_destacado !== '' ? Number(form.orden_destacado) : null,
    }

    if (isEdit) {
      const res = await fetch(`/api/vehicles/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setSubmitting(false)
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      router.push('/empleado/vehiculos')
      router.refresh()
    } else {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setSubmitting(false)
      if (!res.ok) { setError(data.error); return }

      for (const [i, img] of images.entries()) {
        await fetch(`/api/vehicles/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_image', url: img.url, es_portada: img.es_portada, orden: i }),
        })
      }

      router.push('/empleado/vehiculos')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Datos básicos */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Datos del vehículo</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Marca *</label>
            <input value={form.marca} onChange={e => set('marca', e.target.value)} required className={inputCls} placeholder="Toyota" />
          </div>
          <div>
            <label className={labelCls}>Modelo *</label>
            <input value={form.modelo} onChange={e => set('modelo', e.target.value)} required className={inputCls} placeholder="Corolla" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Versión</label>
            <input value={form.version} onChange={e => set('version', e.target.value)} className={inputCls} placeholder="XEI 2.0" />
          </div>
          <div>
            <label className={labelCls}>Tipo</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls}>
              <option value="">Sin especificar</option>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Año *</label>
            <input type="number" value={form.anio} onChange={e => set('anio', e.target.value)} required min={1900} max={2100} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Precio (USD) *</label>
            <input type="number" value={form.precio} onChange={e => set('precio', e.target.value)} required min={0} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Kilometraje</label>
            <input type="number" value={form.kilometraje} onChange={e => set('kilometraje', e.target.value)} min={0} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Combustible *</label>
            <select value={form.combustible} onChange={e => set('combustible', e.target.value)} className={inputCls}>
              {COMBUSTIBLES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Transmisión *</label>
            <select value={form.transmision} onChange={e => set('transmision', e.target.value)} className={inputCls}>
              {TRANSMISIONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Color *</label>
            <input value={form.color} onChange={e => set('color', e.target.value)} required className={inputCls} placeholder="Blanco" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Descripción</label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={4} className={inputCls + ' resize-none'} />
        </div>
      </section>

      {/* Estado y publicación */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Estado y publicación</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Estado comercial</label>
            <select value={form.estado_comercial} onChange={e => set('estado_comercial', e.target.value)} className={inputCls}>
              {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="publicado"
            type="checkbox"
            checked={form.publicado}
            onChange={e => set('publicado', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="publicado" className="text-sm text-[#94A3B8]">
            Publicado — visible en el catálogo y la web pública
          </label>
        </div>
      </section>

      {/* Destacado */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Destacado</h2>
        <div className="flex items-center gap-3">
          <input id="destacado" type="checkbox" checked={form.destacado} onChange={e => set('destacado', e.target.checked)} className="rounded" />
          <label htmlFor="destacado" className="text-sm text-[#94A3B8]">Mostrar en destacados del home</label>
        </div>
        {form.destacado && (
          <div className="max-w-xs">
            <label className={labelCls}>Orden (menor = primero)</label>
            <input type="number" value={form.orden_destacado} onChange={e => set('orden_destacado', e.target.value)} min={0} className={inputCls} />
          </div>
        )}
      </section>

      {/* Imágenes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Imágenes</h2>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map(img => (
              <div key={img.id} className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 ${img.es_portada ? 'border-blue-500' : 'border-[#334155]'}`}>
                <Image src={img.url} alt="" fill className="object-cover" sizes="96px" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition flex items-center justify-center opacity-0 hover:opacity-100 gap-1">
                  {!img.es_portada && (
                    <button type="button" onClick={() => handleSetPortada(img)}
                      className="rounded bg-[#1E293B]/90 px-1.5 py-0.5 text-xs text-[#F1F5F9]">
                      Portada
                    </button>
                  )}
                  <button type="button" onClick={() => handleDeleteImage(img)}
                    className="rounded bg-red-500 px-1.5 py-0.5 text-xs text-white">
                    ✕
                  </button>
                </div>
                {img.es_portada && (
                  <span className="absolute bottom-1 left-1 rounded bg-blue-500 px-1 text-xs text-white">★</span>
                )}
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-[#334155] px-4 py-3 hover:border-blue-500/40 transition max-w-xs">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
          <span className="text-sm text-[#64748B]">{uploading ? 'Subiendo...' : '+ Agregar imagen'}</span>
        </label>
      </section>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition">
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear vehículo'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-xl border border-[#334155] bg-[#1E293B] px-6 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[#334155] transition">
          Cancelar
        </button>
      </div>
    </form>
  )
}
