'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowUpRight, ArrowDownRight, Filter, X, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

interface Movimiento {
  id: number; tipo: string; cantidad: number
  motivo: string | null; fecha: string
  producto: { nombre: string; categoria: string }
}
interface Producto { id: number; nombre: string }

const S = {
  card: { background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 } as React.CSSProperties,
  th: { padding: '13px 16px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.08em', background: '#0b1120', whiteSpace: 'nowrap' as const },
  td: { padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14, color: '#cbd5e1' } as React.CSSProperties,
  input: { background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 13, padding: '9px 12px', borderRadius: 10, outline: 'none', width: '100%', boxSizing: 'border-box' as const },
}

export default function HistorialPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [productos, setProductos]     = useState<Producto[]>([])
  const [loading, setLoading]         = useState(true)
  const [filters, setFilters]         = useState({ productoId: '', tipo: '', desde: '', hasta: '' })
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [statsOpen, setStatsOpen]     = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams({ limit: '200' })
    if (filters.productoId) p.set('productoId', filters.productoId)
    if (filters.tipo)       p.set('tipo', filters.tipo)
    if (filters.desde)      p.set('desde', filters.desde)
    if (filters.hasta)      p.set('hasta', filters.hasta)
    fetch(`/api/movimientos?${p}`).then(r => r.json()).then(setMovimientos).finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetch('/api/productos').then(r => r.json()).then(setProductos) }, [])
  useEffect(() => { load() }, [load])

  const hasFilters    = Object.values(filters).some(Boolean)
  const totalEntradas = movimientos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.cantidad, 0)
  const totalSalidas  = movimientos.filter(m => m.tipo === 'salida').reduce((s, m) => s + m.cantidad, 0)
  const soloEntradas  = movimientos.filter(m => m.tipo === 'entrada').length
  const soloSalidas   = movimientos.filter(m => m.tipo === 'salida').length

  return (
    <div style={{ padding: '64px 24px 48px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.4)', flexShrink: 0 }}>
          <ClipboardList size={28} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Historial de Movimientos</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>{movimientos.length} registros encontrados</p>
        </div>
      </div>

      {/* Stats colapsable */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <button onClick={() => setStatsOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumen del período</span>
          {statsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {statsOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Total registros', value: movimientos.length, color: '#f1f5f9' },
              { label: 'Movim. entradas', value: soloEntradas, color: '#34d399' },
              { label: 'Movim. salidas', value: soloSalidas, color: '#f87171' },
              { label: 'Unidades entradas', value: `+${totalEntradas}`, color: '#34d399' },
              { label: 'Unidades salidas', value: `-${totalSalidas}`, color: '#f87171' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '16px 20px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: 11, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtros colapsables */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <button onClick={() => setFiltersOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filtros {hasFilters && <span style={{ color: '#60a5fa' }}>· activos</span>}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {hasFilters && (
              <button onClick={e => { e.stopPropagation(); setFilters({ productoId: '', tipo: '', desde: '', hasta: '' }) }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={12} /> Limpiar
              </button>
            )}
            {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>
        {filtersOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ paddingTop: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Producto</label>
              <select value={filters.productoId} onChange={e => setFilters({ ...filters, productoId: e.target.value })} style={S.input}>
                <option value="">Todos los productos</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ paddingTop: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tipo</label>
              <select value={filters.tipo} onChange={e => setFilters({ ...filters, tipo: e.target.value })} style={S.input}>
                <option value="">Todos</option>
                <option value="entrada">Solo entradas</option>
                <option value="salida">Solo salidas</option>
              </select>
            </div>
            <div style={{ paddingTop: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Desde</label>
              <input type="date" value={filters.desde} onChange={e => setFilters({ ...filters, desde: e.target.value })} style={S.input} />
            </div>
            <div style={{ paddingTop: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Hasta</label>
              <input type="date" value={filters.hasta} onChange={e => setFilters({ ...filters, hasta: e.target.value })} style={S.input} />
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      {loading ? <Spinner /> : (
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, textAlign: 'center' }}>#</th>
                  <th style={{ ...S.th, textAlign: 'left' }}>Tipo</th>
                  <th style={{ ...S.th, textAlign: 'left' }}>Producto</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Cantidad</th>
                  <th style={{ ...S.th, textAlign: 'left' }}>Motivo</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#334155' }}>
                    <ClipboardList size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    No hay movimientos
                  </td></tr>
                ) : movimientos.map((m, idx) => (
                  <tr key={m.id}
                    style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)'}>
                    <td style={{ ...S.td, textAlign: 'center', color: '#334155', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ ...S.td }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: m.tipo === 'entrada' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        border: `1px solid ${m.tipo === 'entrada' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        color: m.tipo === 'entrada' ? '#34d399' : '#f87171',
                      }}>
                        {m.tipo === 'entrada' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td style={{ ...S.td }}>
                      <p style={{ fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{m.producto.nombre}</p>
                      <p style={{ fontSize: 12, color: '#475569', margin: '2px 0 0' }}>{m.producto.categoria}</p>
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: m.tipo === 'entrada' ? '#34d399' : '#f87171' }}>
                        {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: '#64748b' }}>{m.motivo ?? '—'}</td>
                    <td style={{ ...S.td, textAlign: 'right', color: '#475569', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(m.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
