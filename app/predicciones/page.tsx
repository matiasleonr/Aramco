'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, FileSpreadsheet, FileText, RefreshCw, AlertTriangle, Clock, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCLP, formatDateShort } from '@/lib/utils'

interface Prediccion {
  id: number; nombre: string; categoria: string
  stockActual: number; stockMinimo: number
  precioCosto: number; precioVenta: number
  totalSalidas30: number; avgDiario: number; avgSemanal: number
  diasRestantes: number | null; fechaQuiebre: string | null
  cantidadSugerida: number; costoOrden: number
  urgencia: 'alta' | 'media' | 'baja' | 'sin_movimiento'
}

const URGENCIA = {
  alta:           { label: 'Urgente',   bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: '#f87171',  icon: AlertTriangle },
  media:          { label: 'Pronto',    bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  color: '#fbbf24',  icon: Clock },
  baja:           { label: 'Normal',    bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: '#34d399',  icon: undefined },
  sin_movimiento: { label: 'Sin datos', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', color: '#64748b',  icon: undefined },
}

const catColor: Record<string, string> = {
  'Bebidas y snacks': '#3b82f6', 'Cigarrillos y tabaco': '#8b5cf6',
  'Lubricantes y aceites': '#f59e0b', 'Repuestos y accesorios': '#10b981', 'Otros': '#64748b',
}

const S = {
  th: { padding: '13px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.07em', background: '#0b1120', whiteSpace: 'nowrap' as const },
  td: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: '#cbd5e1' } as React.CSSProperties,
}

export default function PrediccionesPage() {
  const [predicciones, setPredicciones] = useState<Prediccion[]>([])
  const [loading, setLoading]           = useState(true)
  const [exportingXlsx, setExportingXlsx] = useState(false)
  const [exportingPdf, setExportingPdf]   = useState(false)
  const [filterUrgencia, setFilterUrgencia] = useState('')
  const [statsOpen, setStatsOpen]         = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/predicciones').then(r => r.json()).then(setPredicciones).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered      = predicciones.filter(p => !filterUrgencia || p.urgencia === filterUrgencia)
  const conSugerencia = predicciones.filter(p => p.cantidadSugerida > 0)
  const costoTotal    = conSugerencia.reduce((s, p) => s + p.costoOrden, 0)

  const exportExcel = async () => {
    setExportingXlsx(true)
    try {
      const XLSX = await import('xlsx')
      const rows = conSugerencia.map(p => ({
        'Producto': p.nombre, 'Categoría': p.categoria,
        'Stock Actual': p.stockActual, 'Stock Mínimo': p.stockMinimo,
        'Salidas (30d)': p.totalSalidas30, 'Consumo Diario': p.avgDiario,
        'Días de Stock': p.diasRestantes ?? 'N/A',
        'Quiebre Estimado': p.fechaQuiebre ? formatDateShort(p.fechaQuiebre) : 'N/A',
        'Cant. Sugerida': p.cantidadSugerida, 'Precio Costo': p.precioCosto, 'Costo Orden': p.costoOrden,
        'Urgencia': URGENCIA[p.urgencia].label,
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [{ wch: 32 }, { wch: 26 }, ...Array(10).fill({ wch: 18 })]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Orden de Compra')
      XLSX.writeFile(wb, `orden-compra-${new Date().toISOString().split('T')[0]}.xlsx`)
    } finally { setExportingXlsx(false) }
  }

  const exportPdf = async () => {
    setExportingPdf(true)
    try {
      const { default: jsPDF }    = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const fecha = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
      doc.setFillColor(11, 17, 32); doc.rect(0, 0, 297, 210, 'F')
      doc.setTextColor(241, 245, 249); doc.setFontSize(18); doc.setFont('helvetica', 'bold')
      doc.text('Distribuidora CCA — Orden de Compra Sugerida', 14, 18)
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184)
      doc.text(`Generado: ${fecha}  ·  Costo total estimado: ${formatCLP(costoTotal)}`, 14, 27)
      autoTable(doc, {
        startY: 34,
        head: [['Producto', 'Categoría', 'Stock\nActual', 'Días\nStock', 'Quiebre\nEst.', 'Cant.\nSugerida', 'Precio\nCosto', 'Costo\nOrden', 'Urgencia']],
        body: conSugerencia.map(p => [p.nombre, p.categoria, p.stockActual, p.diasRestantes ?? 'N/A', p.fechaQuiebre ? formatDateShort(p.fechaQuiebre) : 'N/A', p.cantidadSugerida, formatCLP(p.precioCosto), formatCLP(p.costoOrden), URGENCIA[p.urgencia].label]),
        foot: [['', '', '', '', '', '', 'TOTAL', formatCLP(costoTotal), '']],
        styles: { fontSize: 8, cellPadding: 3, fillColor: [19, 31, 53] as [number,number,number], textColor: [241, 245, 249] as [number,number,number], lineColor: [50, 60, 80] as [number,number,number], lineWidth: 0.2 },
        headStyles: { fillColor: [37, 99, 235] as [number,number,number], textColor: [255, 255, 255] as [number,number,number], fontStyle: 'bold', fontSize: 8 },
        footStyles: { fillColor: [11, 17, 32] as [number,number,number], textColor: [241, 245, 249] as [number,number,number], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [15, 26, 46] as [number,number,number] },
      })
      doc.save(`orden-compra-${new Date().toISOString().split('T')[0]}.pdf`)
    } finally { setExportingPdf(false) }
  }

  const urgenciaPills = [
    { key: '', label: 'Todos', count: predicciones.length },
    { key: 'alta', label: 'Urgente', count: predicciones.filter(p => p.urgencia === 'alta').length },
    { key: 'media', label: 'Pronto', count: predicciones.filter(p => p.urgencia === 'media').length },
    { key: 'baja', label: 'Normal', count: predicciones.filter(p => p.urgencia === 'baja').length },
    { key: 'sin_movimiento', label: 'Sin datos', count: predicciones.filter(p => p.urgencia === 'sin_movimiento').length },
  ]

  return (
    <div style={{ padding: '64px 24px 48px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #d97706, #92400e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(217,119,6,0.4)', flexShrink: 0 }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Predicciones</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>Basado en consumo de los últimos 30 días</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Recalcular
          </button>
          <button onClick={exportExcel} disabled={exportingXlsx || loading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, color: '#34d399', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: exportingXlsx ? 0.6 : 1 }}>
            <FileSpreadsheet size={15} /> {exportingXlsx ? 'Exportando...' : 'Excel'}
          </button>
          <button onClick={exportPdf} disabled={exportingPdf || loading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, color: '#60a5fa', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: exportingPdf ? 0.6 : 1 }}>
            <FileText size={15} /> {exportingPdf ? 'Generando...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Stats colapsable */}
      {!loading && (
        <div style={{ background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, marginBottom: 16 }}>
          <button onClick={() => setStatsOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumen de la orden</span>
            {statsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {statsOpen && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { label: 'A reponer', value: conSugerencia.length, color: '#f1f5f9' },
                { label: 'Urgencia alta', value: predicciones.filter(p => p.urgencia === 'alta').length, color: '#f87171' },
                { label: 'Urgencia media', value: predicciones.filter(p => p.urgencia === 'media').length, color: '#fbbf24' },
                { label: 'Costo total est.', value: formatCLP(costoTotal), color: '#34d399' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: '18px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pills de urgencia */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {urgenciaPills.map(({ key, label, count }) => {
          const urg = key ? URGENCIA[key as keyof typeof URGENCIA] : null
          const active = filterUrgencia === key
          return (
            <button key={key} onClick={() => setFilterUrgencia(key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: active ? `1px solid ${urg?.border ?? 'rgba(59,130,246,0.5)'}` : '1px solid rgba(255,255,255,0.08)', background: active ? (urg?.bg ?? 'rgba(59,130,246,0.15)') : 'transparent', color: active ? (urg?.color ?? '#60a5fa') : '#64748b', transition: 'all 0.15s' }}>
              {label} <span style={{ fontSize: 10, opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Calculando predicciones...</div>
      ) : (
        <div style={{ background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, textAlign: 'left' }}>#</th>
                  <th style={{ ...S.th, textAlign: 'left' }}>Producto</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Stock</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Salidas 30d</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Cons./día</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Días stock</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Quiebre est.</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Cant. sugerida</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Costo orden</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Urgencia</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: '60px 20px', textAlign: 'center', color: '#334155' }}>
                    <ShoppingCart size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    No hay predicciones
                  </td></tr>
                ) : filtered.map((p, idx) => {
                  const urg = URGENCIA[p.urgencia]
                  const UrgIcon = urg.icon
                  const catCol = catColor[p.categoria] ?? '#64748b'
                  const diasColor = p.diasRestantes == null ? '#475569' : p.diasRestantes <= 7 ? '#f87171' : p.diasRestantes <= 14 ? '#fbbf24' : '#94a3b8'
                  return (
                    <tr key={p.id}
                      style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)'}>
                      <td style={{ ...S.td, color: '#334155', width: 36 }}>{idx + 1}</td>
                      <td style={{ ...S.td }}>
                        <p style={{ fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>{p.nombre}</p>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${catCol}20`, color: catCol, border: `1px solid ${catCol}30` }}>{p.categoria}</span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: p.stockActual <= p.stockMinimo ? '#f87171' : '#f1f5f9' }}>{p.stockActual}</span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>{p.totalSalidas30}</td>
                      <td style={{ ...S.td, textAlign: 'center', color: '#64748b' }}>{p.avgDiario > 0 ? p.avgDiario.toFixed(1) : '—'}</td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        {p.diasRestantes != null
                          ? <span style={{ fontWeight: 700, color: diasColor }}>{p.diasRestantes}d</span>
                          : <span style={{ color: '#334155' }}>—</span>
                        }
                      </td>
                      <td style={{ ...S.td, textAlign: 'center', color: '#475569', fontSize: 12 }}>{p.fechaQuiebre ? formatDateShort(p.fechaQuiebre) : '—'}</td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        {p.cantidadSugerida > 0
                          ? <span style={{ fontSize: 17, fontWeight: 800, color: '#60a5fa' }}>{p.cantidadSugerida} u.</span>
                          : <span style={{ color: '#334155' }}>—</span>
                        }
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', color: '#34d399', fontWeight: 600 }}>
                        {p.costoOrden > 0 ? formatCLP(p.costoOrden) : '—'}
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: urg.bg, border: `1px solid ${urg.border}`, color: urg.color }}>
                          {UrgIcon && <UrgIcon size={11} />} {urg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {conSugerencia.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#0b1120', borderTop: '2px solid rgba(255,255,255,0.08)' }}>
                    <td colSpan={8} style={{ padding: '14px 16px', textAlign: 'right', color: '#475569', fontSize: 13, fontWeight: 600 }}>Costo total de la orden:</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#34d399', fontSize: 18, fontWeight: 800 }}>{formatCLP(costoTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
        <span style={{ color: '#475569', fontWeight: 600 }}>¿Cómo se calcula?</span> Se analizan las salidas de los últimos 30 días para obtener el consumo diario promedio. Con ese dato se estima cuántos días de stock quedan y se sugiere reponer 2 semanas de inventario.
      </p>
    </div>
  )
}
