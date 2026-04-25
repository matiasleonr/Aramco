'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Package, Search, Tag, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { formatCLP, CATEGORIAS } from '@/lib/utils'

interface Producto {
  id: number; nombre: string; categoria: string
  stockActual: number; stockMinimo: number
  precioVenta: number; precioCosto: number
}

const EMPTY_FORM: { nombre: string; categoria: string; stockActual: string; stockMinimo: string; precioVenta: string; precioCosto: string } = {
  nombre: '', categoria: CATEGORIAS[0],
  stockActual: '', stockMinimo: '', precioVenta: '', precioCosto: '',
}

const S = {
  card: { background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 } as React.CSSProperties,
  input: { width: '100%', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, padding: '10px 14px', borderRadius: 12, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 } as React.CSSProperties,
  th: { padding: '13px 16px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#0b1120', whiteSpace: 'nowrap' } as React.CSSProperties,
  td: { padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14, color: '#cbd5e1' } as React.CSSProperties,
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [editing, setEditing]     = useState<Producto | null>(null)
  const [form, setForm]           = useState({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [statsOpen, setStatsOpen] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/productos').then(r => r.json()).then(setProductos).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setError(''); setModalOpen(true) }
  const openEdit = (p: Producto) => {
    setEditing(p)
    setForm({ nombre: p.nombre, categoria: p.categoria, stockActual: String(p.stockActual), stockMinimo: String(p.stockMinimo), precioVenta: String(p.precioVenta), precioCosto: String(p.precioCosto) })
    setError(''); setModalOpen(true)
  }
  const handleSave = async () => {
    if (!form.nombre.trim()) return setError('El nombre es requerido')
    if (!form.precioVenta || !form.precioCosto) return setError('Los precios son requeridos')
    setSaving(true); setError('')
    try {
      const res = await fetch(editing ? `/api/productos/${editing.id}` : '/api/productos', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, categoria: form.categoria, stockActual: Number(form.stockActual), stockMinimo: Number(form.stockMinimo), precioVenta: Number(form.precioVenta), precioCosto: Number(form.precioCosto) }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error'); return }
      setModalOpen(false); load()
    } finally { setSaving(false) }
  }
  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/productos/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); load()
  }

  const filtered  = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) && (!catFilter || p.categoria === catFilter))
  const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo).length
  const sinStock  = productos.filter(p => p.stockActual === 0).length
  const valorInventario = productos.reduce((s, p) => s + p.stockActual * p.precioCosto, 0)

  const catColor: Record<string, string> = {
    'Bebidas y snacks': '#3b82f6', 'Cigarrillos y tabaco': '#8b5cf6',
    'Lubricantes y aceites': '#f59e0b', 'Repuestos y accesorios': '#10b981', 'Otros': '#64748b',
  }

  return (
    <div style={{ padding: '64px 24px 48px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #2563eb, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
            <Package size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Productos</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
              {productos.length} artículos {stockBajo > 0 && <span style={{ color: '#f87171' }}>· {stockBajo} con stock bajo</span>}
            </p>
          </div>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
          <Plus size={18} strokeWidth={2.5} /> Agregar Producto
        </button>
      </div>

      {/* Stats colapsable */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <button onClick={() => setStatsOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumen del inventario</span>
          {statsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {statsOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Total productos', value: productos.length, color: '#f1f5f9' },
              { label: 'Stock bajo mínimo', value: stockBajo, color: '#f87171' },
              { label: 'Sin stock', value: sinStock, color: '#ef4444' },
              { label: 'Valor inventario', value: formatCLP(valorInventario), color: '#34d399' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '18px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." style={{ ...S.input, paddingLeft: 36 }} />
        </div>
        <div style={{ position: 'relative' }}>
          <Tag size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            style={{ ...S.input, width: 'auto', paddingLeft: 32, paddingRight: 36, cursor: 'pointer', appearance: 'none' }}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Pills de categoría */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIAS.map(c => (
            <button key={c} onClick={() => setCatFilter(catFilter === c ? '' : c)}
              style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${catFilter === c ? catColor[c] ?? '#64748b' : 'rgba(255,255,255,0.08)'}`, background: catFilter === c ? `${catColor[c] ?? '#64748b'}22` : 'transparent', color: catFilter === c ? catColor[c] ?? '#64748b' : '#64748b', transition: 'all 0.15s' }}>
              {c.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {loading ? <Spinner /> : (
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, textAlign: 'left', borderRadius: '12px 0 0 0' }}>#</th>
                  <th style={{ ...S.th, textAlign: 'left' }}>Producto</th>
                  <th style={{ ...S.th, textAlign: 'left' }}>Categoría</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Stock Actual</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Stock Mín.</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Precio Venta</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Precio Costo</th>
                  <th style={{ ...S.th, textAlign: 'center', borderRadius: '0 12px 0 0' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center', color: '#334155' }}>
                    <Package size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    No se encontraron productos
                  </td></tr>
                ) : filtered.map((p, idx) => {
                  const bajo = p.stockActual <= p.stockMinimo
                  const sin  = p.stockActual === 0
                  return (
                    <tr key={p.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)'}>
                      <td style={{ ...S.td, color: '#334155', width: 40 }}>{idx + 1}</td>
                      <td style={{ ...S.td }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 6, height: 36, borderRadius: 99, background: sin ? '#ef4444' : bajo ? '#f97316' : '#3b82f6', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{p.nombre}</p>
                            {bajo && <p style={{ fontSize: 11, color: sin ? '#f87171' : '#fb923c', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={10} /> {sin ? 'Sin stock' : 'Stock bajo mínimo'}
                            </p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...S.td }}>
                        <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: `${catColor[p.categoria] ?? '#64748b'}20`, color: catColor[p.categoria] ?? '#94a3b8', border: `1px solid ${catColor[p.categoria] ?? '#64748b'}30` }}>
                          {p.categoria}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: sin ? '#f87171' : bajo ? '#fb923c' : '#f1f5f9' }}>{p.stockActual}</span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'center', color: '#64748b' }}>{p.stockMinimo}</td>
                      <td style={{ ...S.td, textAlign: 'right', color: '#34d399', fontWeight: 600 }}>{formatCLP(p.precioVenta)}</td>
                      <td style={{ ...S.td, textAlign: 'right', color: '#64748b' }}>{formatCLP(p.precioCosto)}</td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button onClick={() => openEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            <Pencil size={13} /> Editar
                          </button>
                          <button onClick={() => setDeleteId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            <Trash2 size={13} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '✏️ Editar Producto' : '➕ Nuevo Producto'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>{error}</div>}
          <div>
            <label style={S.label}>Nombre del producto *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Coca-Cola 350ml" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Categoría *</label>
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={S.input}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Stock Actual</label>
              <input type="number" min="0" value={form.stockActual} onChange={e => setForm({ ...form, stockActual: e.target.value })} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Stock Mínimo</label>
              <input type="number" min="0" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: e.target.value })} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Precio Venta (CLP) *</label>
              <input type="number" min="0" value={form.precioVenta} onChange={e => setForm({ ...form, precioVenta: e.target.value })} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Precio Costo (CLP) *</label>
              <input type="number" min="0" value={form.precioCosto} onChange={e => setForm({ ...form, precioCosto: e.target.value })} style={S.input} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : editing ? '✓ Guardar Cambios' : '+ Crear Producto'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="¿Eliminar producto?" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Trash2 size={28} color="#f87171" />
          </div>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Esta acción eliminará el producto y <strong style={{ color: '#f1f5f9' }}>todos sus movimientos</strong>. No se puede deshacer.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleDelete} style={{ flex: 1, padding: '12px', background: '#dc2626', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
