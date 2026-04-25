'use client'

import { useEffect, useState } from 'react'
import { Bell, ArrowRight, RefreshCw, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { formatCLP } from '@/lib/utils'

interface Alerta {
  id: number; nombre: string; categoria: string
  stockActual: number; stockMinimo: number
  precioVenta: number; precioCosto: number; deficit: number
}

const catColor: Record<string, string> = {
  'Bebidas y snacks': '#3b82f6', 'Cigarrillos y tabaco': '#8b5cf6',
  'Lubricantes y aceites': '#f59e0b', 'Repuestos y accesorios': '#10b981', 'Otros': '#64748b',
}

export default function AlertasPage() {
  const [alertas, setAlertas]       = useState<Alerta[]>([])
  const [loading, setLoading]       = useState(true)
  const [sinStockOpen, setSinStockOpen] = useState(true)
  const [bajoOpen, setBajoOpen]     = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/alertas').then(r => r.json()).then(setAlertas).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const criticas = alertas.filter(a => a.stockActual === 0)
  const bajas    = alertas.filter(a => a.stockActual > 0)

  return (
    <div style={{ padding: '64px 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #dc2626, #991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(220,38,38,0.4)', flexShrink: 0 }}>
            <Bell size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Alertas de Stock</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
              {loading ? 'Cargando...' : alertas.length === 0 ? 'Todo el stock está en orden' : `${alertas.length} producto${alertas.length > 1 ? 's' : ''} requieren atención`}
            </p>
          </div>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Cargando...</div>
      ) : alertas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={40} color="#34d399" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px' }}>¡Todo en orden!</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>Todos los productos tienen stock suficiente</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sin stock */}
          {criticas.length > 0 && (
            <div style={{ background: '#131f35', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, overflow: 'hidden' }}>
              <button onClick={() => setSinStockOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(239,68,68,0.06)', border: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: '#ef4444', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sin stock — {criticas.length} producto{criticas.length > 1 ? 's' : ''}</span>
                </div>
                {sinStockOpen ? <ChevronUp size={16} color="#f87171" /> : <ChevronDown size={16} color="#f87171" />}
              </button>
              {sinStockOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16 }}>
                  {criticas.map(a => <AlertCard key={a.id} alerta={a} nivel="critico" />)}
                </div>
              )}
            </div>
          )}

          {/* Stock bajo */}
          {bajas.length > 0 && (
            <div style={{ background: '#131f35', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, overflow: 'hidden' }}>
              <button onClick={() => setBajoOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(245,158,11,0.06)', border: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: '#f59e0b', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stock bajo mínimo — {bajas.length} producto{bajas.length > 1 ? 's' : ''}</span>
                </div>
                {bajoOpen ? <ChevronUp size={16} color="#fbbf24" /> : <ChevronDown size={16} color="#fbbf24" />}
              </button>
              {bajoOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16 }}>
                  {bajas.map(a => <AlertCard key={a.id} alerta={a} nivel="bajo" />)}
                </div>
              )}
            </div>
          )}

          {/* CTA predicciones */}
          <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>¿Necesitas generar una orden de compra?</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>El módulo de predicciones calcula automáticamente qué y cuánto pedir.</p>
            </div>
            <Link href="/predicciones" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#2563eb', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Ver predicciones <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function AlertCard({ alerta, nivel }: { alerta: Alerta; nivel: 'critico' | 'bajo' }) {
  const isCrit = nivel === 'critico'
  const color  = isCrit ? '#ef4444' : '#f59e0b'
  const catCol = catColor[alerta.categoria] ?? '#64748b'

  return (
    <div style={{ background: '#0f1a2e', border: `1px solid ${color}25`, borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, margin: '0 0 6px', lineHeight: 1.3 }}>{alerta.nombre}</p>
          <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${catCol}20`, color: catCol, border: `1px solid ${catCol}30` }}>{alerta.categoria}</span>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={20} color={color} />
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { label: 'Actual', value: alerta.stockActual, color },
          { label: 'Mínimo', value: alerta.stockMinimo, color: '#94a3b8' },
          { label: 'Déficit', value: alerta.deficit, color: '#f1f5f9' },
        ].map(({ label, value, color: c }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#475569', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: c, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: '#475569' }}>Precio venta</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>{formatCLP(alerta.precioVenta)}</span>
      </div>

      <Link href="/movimientos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', fontSize: 13, fontWeight: 700, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, textDecoration: 'none' }}>
        <ArrowRight size={14} /> Registrar entrada
      </Link>
    </div>
  )
}
