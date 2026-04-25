'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  ArrowUpRight, ArrowDownRight, CheckCircle,
  ScanLine, Upload, X, Loader2, AlertCircle, Plus, Trash2,
  ArrowLeftRight, ArrowLeft, ShoppingCart, TrendingDown, Sparkles, FileText,
} from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { CATEGORIAS } from '@/lib/utils'

interface Producto {
  id: number
  nombre: string
  categoria: string
  stockActual: number
}

interface MovimientoReciente {
  id: number
  tipo: string
  cantidad: number
  motivo: string | null
  fecha: string
  producto: { nombre: string; categoria: string }
}

interface ScannedItem {
  nombre: string
  cantidad: number
  precioUnitario: number
  productoId: string
  autoCreate: boolean
  categoria: string
  _key: number
}

const MOTIVOS_ENTRADA = ['Compra a proveedor', 'Devolución cliente', 'Ajuste de inventario', 'Otro']
const MOTIVOS_SALIDA  = ['Venta', 'Merma / Vencimiento', 'Robo / Extravío', 'Ajuste de inventario', 'Otro']

export default function MovimientosPage() {
  const [productos, setProductos]     = useState<Producto[]>([])
  const [recientes, setRecientes]     = useState<MovimientoReciente[]>([])
  const [loading, setLoading]         = useState(true)
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [scannerTipo, setScannerTipo] = useState<'entrada' | 'salida' | null>(null)

  const [form, setForm] = useState({
    productoId: '', tipo: 'salida', cantidad: '',
    motivo: '', motivoCustom: '',
    fecha: new Date().toISOString().split('T')[0],
  })

  const selectedProducto = productos.find((p) => p.id === Number(form.productoId))
  const motivosList = form.tipo === 'entrada' ? MOTIVOS_ENTRADA : MOTIVOS_SALIDA

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/productos').then((r) => r.json()),
      fetch('/api/movimientos?limit=12').then((r) => r.json()),
    ]).then(([prods, movs]) => {
      setProductos(prods)
      setRecientes(movs)
      if (prods.length && !form.productoId)
        setForm((f) => ({ ...f, productoId: String(prods[0].id) }))
    }).finally(() => setLoading(false))
  }, []) // eslint-disable-line

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.productoId)           return setError('Selecciona un producto')
    if (Number(form.cantidad) <= 0) return setError('La cantidad debe ser mayor a 0')
    const motivoFinal = form.motivo === 'Otro' ? form.motivoCustom : form.motivo
    if (!motivoFinal) return setError('Selecciona o escribe un motivo')

    setSaving(true)
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoId: Number(form.productoId), tipo: form.tipo,
          cantidad: Number(form.cantidad), motivo: motivoFinal, fecha: form.fecha,
        }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error ?? 'Error al registrar')
      setSuccess(`✓ ${form.tipo === 'entrada' ? '+' : '-'}${form.cantidad} unidades registradas`)
      setForm((f) => ({ ...f, cantidad: '', motivo: '', motivoCustom: '' }))
      fetch('/api/productos').then((r) => r.json()).then(setProductos)
      fetch('/api/movimientos?limit=12').then((r) => r.json()).then(setRecientes)
    } finally { setSaving(false) }
  }

  const refreshAll = () => {
    fetch('/api/productos').then((r) => r.json()).then(setProductos)
    fetch('/api/movimientos?limit=12').then((r) => r.json()).then(setRecientes)
  }

  const inp: React.CSSProperties = { width: '100%', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, padding: '10px 12px', borderRadius: 12, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }

  if (loading) return <div style={{ padding: '80px 24px', textAlign: 'center' }}><Spinner /></div>

  return (
    <div style={{ padding: '64px 24px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', textDecoration: 'none', marginBottom: 24 }}>
        <ArrowLeft size={14} /> Inicio
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #059669, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(5,150,105,0.4)', flexShrink: 0 }}>
            <ArrowLeftRight size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Movimientos</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>Registra entradas y salidas de inventario</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setScannerTipo('entrada')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 12, color: '#34d399', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <ShoppingCart size={16} /> Orden de Compra
          </button>
          <button onClick={() => setScannerTipo('salida')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, color: '#60a5fa', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <TrendingDown size={16} /> Orden de Venta
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, alignItems: 'start' }}>
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: 0 }}>Registro manual</p>

          {/* Tipo toggle */}
          <div>
            <label style={lbl}>Tipo *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['salida', 'entrada'] as const).map((t) => {
                const active = form.tipo === t
                const activeStyle = t === 'entrada'
                  ? { background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.4)', color: '#34d399' }
                  : { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
                return (
                  <button key={t} type="button" onClick={() => setForm({ ...form, tipo: t, motivo: '', motivoCustom: '' })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', ...(active ? activeStyle : { background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }) }}>
                    {t === 'entrada' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {t === 'entrada' ? 'Entrada' : 'Salida'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Producto */}
          <div>
            <label style={lbl}>Producto *</label>
            <select value={form.productoId} onChange={(e) => setForm({ ...form, productoId: e.target.value })} style={inp}>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {selectedProducto && (
              <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>
                Stock actual: <span style={{ fontWeight: 700, color: selectedProducto.stockActual <= 0 ? '#f87171' : '#94a3b8' }}>{selectedProducto.stockActual} u.</span>
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label style={lbl}>Cantidad *</label>
            <input type="number" min="1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder="0" style={inp} />
          </div>

          {/* Motivo */}
          <div>
            <label style={lbl}>Motivo *</label>
            <select value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value, motivoCustom: '' })} style={inp}>
              <option value="">Seleccionar...</option>
              {motivosList.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {form.motivo === 'Otro' && (
              <input value={form.motivoCustom} onChange={(e) => setForm({ ...form, motivoCustom: e.target.value })} placeholder="Describe el motivo..." style={{ ...inp, marginTop: 8 }} />
            )}
          </div>

          {/* Fecha */}
          <div>
            <label style={lbl}>Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full bg-[#0f1a2e] border border-white/[.08] text-slate-100 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/60" />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, color: '#34d399', fontSize: 13 }}>
              <CheckCircle size={14} /> {success}
            </div>
          )}

          <button type="submit" disabled={saving} style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', opacity: saving ? 0.6 : 1, background: form.tipo === 'entrada' ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: form.tipo === 'entrada' ? '0 4px 16px rgba(5,150,105,0.3)' : '0 4px 16px rgba(37,99,235,0.3)' }}>
            {saving ? 'Registrando...' : `Registrar ${form.tipo === 'entrada' ? 'Entrada' : 'Salida'}`}
          </button>
        </form>

        {/* ── Recientes ── */}
        <div style={{ background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Últimos movimientos</p>
          </div>
          {recientes.length === 0
            ? <p style={{ textAlign: 'center', color: '#334155', fontSize: 13, padding: '40px 20px' }}>Sin movimientos registrados</p>
            : recientes.map((m, idx) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', transition: 'background 0.12s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: m.tipo === 'entrada' ? 'rgba(5,150,105,0.12)' : 'rgba(239,68,68,0.12)', color: m.tipo === 'entrada' ? '#34d399' : '#f87171' }}>
                  {m.tipo === 'entrada' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.producto.nombre}</p>
                  <p style={{ fontSize: 12, color: '#475569', margin: '2px 0 0' }}>{m.motivo ?? '—'}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: m.tipo === 'entrada' ? '#34d399' : '#f87171', margin: 0 }}>
                    {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                  </p>
                  <p style={{ fontSize: 11, color: '#334155', margin: '2px 0 0' }}>{new Date(m.fecha).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Scanners ── */}
      <OrderScanner
        open={scannerTipo !== null}
        tipo={scannerTipo ?? 'entrada'}
        onClose={() => setScannerTipo(null)}
        productos={productos}
        onSaved={() => { setScannerTipo(null); refreshAll() }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Order Scanner (Compra = entrada / Venta = salida)
// ─────────────────────────────────────────────────────────────
function OrderScanner({
  open, tipo, onClose, productos, onSaved,
}: {
  open: boolean
  tipo: 'entrada' | 'salida'
  onClose: () => void
  productos: Producto[]
  onSaved: () => void
}) {
  const [step, setStep]           = useState<'upload' | 'review' | 'saving'>('upload')
  const [preview, setPreview]     = useState<string | null>(null)
  const [scanning, setScanning]   = useState(false)
  const [scanError, setScanError] = useState('')
  const [items, setItems]         = useState<ScannedItem[]>([])
  const [motivo, setMotivo]       = useState('')
  const [fecha, setFecha]         = useState(new Date().toISOString().split('T')[0])
  const [saveMsg, setSaveMsg]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const motivosList = tipo === 'entrada' ? MOTIVOS_ENTRADA : MOTIVOS_SALIDA
  const isCompra = tipo === 'entrada'

  useEffect(() => {
    setMotivo(isCompra ? 'Compra a proveedor' : 'Venta')
  }, [isCompra])

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('upload'); setPreview(null)
        setScanning(false); setScanError('')
        setItems([]); setSaveMsg('')
      }, 300)
    }
  }, [open])

  const handleFile = async (file: File) => {
    const allowed = file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!allowed) { setScanError('Sube una imagen (JPG, PNG, WEBP) o un PDF'); return }
    setScanError('')
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(file.type === 'application/pdf' ? 'pdf' : dataUrl)
      await scanFile(dataUrl, file.type, file.name)
    }
    reader.readAsDataURL(file)
  }

  const scanFile = async (dataUrl: string, mimeType: string, fileName?: string) => {
    setScanning(true)
    try {
      const base64 = dataUrl.split(',')[1]
      const res = await fetch('/api/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: mimeType }),
      })
      const data = await res.json()
      if (!res.ok) { setScanError(data.error ?? 'Error al procesar'); return }
      if (!data.items?.length) { setScanError('No se encontraron productos en el documento'); return }

      const mapped: ScannedItem[] = data.items.map((item: { nombre: string; cantidad: number; precioUnitario: number }, i: number) => {
        const nameLower = item.nombre.toLowerCase()
        const match = productos.find((p) =>
          p.nombre.toLowerCase().includes(nameLower.slice(0, 5)) ||
          nameLower.includes(p.nombre.toLowerCase().slice(0, 5))
        )
        return {
          nombre: item.nombre,
          cantidad: item.cantidad || 1,
          precioUnitario: item.precioUnitario || 0,
          productoId: match ? String(match.id) : '',
          autoCreate: !match,
          categoria: CATEGORIAS[0],
          _key: i,
        }
      })
      setItems(mapped)
      setStep('review')
    } catch {
      setScanError('Error de conexión al procesar la imagen')
    } finally {
      setScanning(false)
    }
  }

  const updateItem = (key: number, field: keyof ScannedItem, value: string | number | boolean) => {
    setItems((prev) => prev.map((it) => it._key === key ? { ...it, [field]: value } : it))
  }

  const removeItem = (key: number) => setItems((prev) => prev.filter((it) => it._key !== key))

  const addItem = () => setItems((prev) => [...prev, {
    nombre: '', cantidad: 1, precioUnitario: 0,
    productoId: '', autoCreate: false, categoria: CATEGORIAS[0], _key: Date.now(),
  }])

  const handleSave = async () => {
    const toSave = items.filter((it) => (it.productoId || it.autoCreate) && it.cantidad > 0)
    if (!toSave.length) { setScanError('Asocia o marca para crear al menos un producto'); return }
    setScanError('')
    setStep('saving')
    let ok = 0

    for (const item of toSave) {
      let prodId = item.productoId

      if (item.autoCreate && !prodId) {
        const precio = item.precioUnitario || 0
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: item.nombre,
            categoria: item.categoria,
            stockActual: 0,
            stockMinimo: 5,
            precioCosto: precio,
            precioVenta: precio > 0 ? Math.round(precio * 1.3) : 0,
          }),
        })
        if (res.ok) { const p = await res.json(); prodId = String(p.id) }
      }

      if (!prodId) continue

      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoId: Number(prodId), tipo, cantidad: item.cantidad, motivo, fecha }),
      })
      if (res.ok) ok++
    }

    const created = items.filter((it) => it.autoCreate && !it.productoId).length
    setSaveMsg(`✓ ${ok} movimiento${ok !== 1 ? 's' : ''} registrado${ok !== 1 ? 's' : ''}${created > 0 ? ` · ${created} producto${created > 1 ? 's' : ''} nuevo${created > 1 ? 's' : ''} creado${created > 1 ? 's' : ''}` : ''}`)
    setTimeout(() => onSaved(), 2000)
  }

  const newCount   = items.filter((it) => it.autoCreate && !it.productoId).length
  const matchCount = items.filter((it) => it.productoId).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCompra ? '📋 Orden de Compra — Registrar Entradas' : '🧾 Orden de Venta — Registrar Salidas'}
      size="lg"
    >
      {step === 'upload' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            {isCompra
              ? 'Sube la imagen de tu orden de compra o factura de proveedor. La IA extrae los productos y registra las entradas automáticamente.'
              : 'Sube la imagen de tu orden de venta o boleta. La IA extrae los productos y registra las salidas automáticamente.'}
          </p>

          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors group ${
              isCompra ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-600 hover:border-blue-500'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          >
            {scanning ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className={`animate-spin ${isCompra ? 'text-emerald-400' : 'text-blue-400'}`} />
                <p className="text-sm text-slate-300 font-medium">Analizando documento con IA...</p>
                <p className="text-xs text-slate-500">Esto puede tardar unos segundos</p>
              </div>
            ) : preview === 'pdf' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <FileText size={28} className="text-red-400" />
                </div>
                <p className="text-sm font-semibold text-slate-300">PDF cargado correctamente</p>
                <p className="text-xs text-slate-500">Haz clic para cambiar el archivo</p>
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Documento" className="max-h-48 rounded-xl object-contain" />
                <p className="text-xs text-slate-500">Haz clic para cambiar la imagen</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isCompra
                    ? 'bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20'
                    : 'bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20'
                }`}>
                  <Upload size={24} className={isCompra ? 'text-emerald-400' : 'text-blue-400'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300">Arrastra una imagen aquí</p>
                  <p className="text-xs text-slate-500 mt-1">o haz clic para seleccionar · JPG, PNG, WEBP, PDF</p>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>

          {scanError && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {scanError}
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-400 bg-[#0f1a2e] hover:bg-[#131f35] border border-white/[.08] rounded-xl transition-colors">
            Cancelar
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">{matchCount} asociados</span>
            {newCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 font-semibold">
                <Sparkles size={12} /> {newCount} nuevos a crear
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Motivo</label>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-[#0f1a2e] border border-white/[.08] text-slate-100 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500/60">
                {motivosList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-[#0f1a2e] border border-white/[.08] text-slate-100 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500/60" />
            </div>
          </div>

          <div className="border border-white/[.07] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#0f1a2e] border-b border-white/[.07]">
                <tr>
                  <th className="text-left px-3 py-2.5 text-slate-400 font-semibold">Detectado</th>
                  <th className="text-left px-3 py-2.5 text-slate-400 font-semibold">Producto / Acción</th>
                  <th className="text-right px-3 py-2.5 text-slate-400 font-semibold w-20">Cant.</th>
                  <th className="w-8 px-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[.04]">
                {items.map((item) => (
                  <tr key={item._key} className="bg-[#131f35]">
                    <td className="px-3 py-2.5">
                      <p className="text-slate-300 font-medium">{item.nombre || '—'}</p>
                      {item.precioUnitario > 0 && (
                        <p className="text-slate-600 text-[10px]">${item.precioUnitario.toLocaleString('es-CL')} c/u</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {item.autoCreate && !item.productoId ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-violet-400 font-semibold text-[10px]">
                            <Sparkles size={10} /> Crear nuevo producto
                          </div>
                          <select value={item.categoria} onChange={(e) => updateItem(item._key, 'categoria', e.target.value)}
                            className="w-full bg-[#0f1a2e] border border-violet-500/30 text-slate-200 text-xs px-2 py-1 rounded-lg focus:outline-none">
                            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <button onClick={() => updateItem(item._key, 'autoCreate', false)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 underline">
                            Asociar a existente
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <select value={item.productoId} onChange={(e) => updateItem(item._key, 'productoId', e.target.value)}
                            className="w-full bg-[#0f1a2e] border border-white/[.08] text-slate-100 text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500/60">
                            <option value="">— No registrar —</option>
                            {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select>
                          {!item.productoId && (
                            <button onClick={() => updateItem(item._key, 'autoCreate', true)}
                              className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300">
                              <Sparkles size={9} /> Crear como nuevo producto
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <input type="number" min="1" value={item.cantidad}
                        onChange={(e) => updateItem(item._key, 'cantidad', Number(e.target.value))}
                        className="w-full bg-[#0f1a2e] border border-white/[.08] text-slate-100 text-xs px-2 py-1.5 rounded-lg text-right focus:outline-none focus:border-blue-500/60" />
                    </td>
                    <td className="px-2 py-2.5">
                      <button onClick={() => removeItem(item._key)}
                        className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors">
                        <X size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addItem}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <Plus size={13} /> Agregar fila manualmente
          </button>

          {scanError && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {scanError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={() => setStep('upload')}
              className="flex-1 py-2.5 text-sm font-medium text-slate-400 bg-[#0f1a2e] hover:bg-[#131f35] border border-white/[.08] rounded-xl transition-colors">
              ← Volver
            </button>
            <button onClick={handleSave}
              className={`flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${
                isCompra ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'
              }`}>
              Confirmar {matchCount + newCount} ítem{matchCount + newCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {step === 'saving' && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          {saveMsg ? (
            <>
              <CheckCircle size={40} className="text-emerald-400" />
              <p className="text-base font-semibold text-white text-center">{saveMsg}</p>
            </>
          ) : (
            <>
              <Loader2 size={36} className="text-blue-400 animate-spin" />
              <p className="text-sm text-slate-400">Procesando{newCount > 0 ? ' y creando productos' : ''}...</p>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
