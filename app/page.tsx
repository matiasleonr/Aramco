'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package, ArrowLeftRight, ClipboardList, Bell, TrendingUp } from 'lucide-react'

const MODULES = [
  {
    href: '/productos',
    Icon: Package,
    label: 'Productos',
    desc: 'Ver, agregar y editar productos del inventario',
    bg: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    shadow: 'rgba(37,99,235,.45)',
  },
  {
    href: '/movimientos',
    Icon: ArrowLeftRight,
    label: 'Movimientos',
    desc: 'Registrar entradas por compra y salidas por venta',
    bg: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
    shadow: 'rgba(5,150,105,.45)',
  },
  {
    href: '/historial',
    Icon: ClipboardList,
    label: 'Historial',
    desc: 'Consultar todos los movimientos registrados',
    bg: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    shadow: 'rgba(124,58,237,.45)',
  },
  {
    href: '/alertas',
    Icon: Bell,
    label: 'Alertas de Stock',
    desc: 'Productos con stock bajo el mínimo configurado',
    bg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    shadow: 'rgba(220,38,38,.45)',
  },
  {
    href: '/predicciones',
    Icon: TrendingUp,
    label: 'Predicciones',
    desc: 'Orden de compra sugerida · Exportar PDF y Excel',
    bg: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    shadow: 'rgba(217,119,6,.45)',
  },
]

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px 60px',
    }}>

      {/* ── Logo + title ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 48 }}>
        <div style={{
          width: 110, height: 110, borderRadius: 28,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 16px 48px rgba(0,0,0,.4)',
          marginBottom: 20,
          overflow: 'hidden',
          padding: 6,
        }}>
          <Image
            src="/cca-logo.png"
            alt="Distribuidora CCA"
            width={98}
            height={98}
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            priority
          />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', textAlign: 'center' }}>
          Distribuidora CCA
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, textAlign: 'center' }}>
          Sistema de Gestión de Inventario
        </p>
      </div>

      {/* ── Module cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
        width: '100%',
        maxWidth: 860,
      }}>
        {MODULES.map(({ href, Icon, label, desc, bg, shadow }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div
              className="mod-card"
              style={{ background: bg, boxShadow: `0 12px 36px ${shadow}` }}
            >
              <div className="mod-icon">
                <Icon size={36} color="#fff" strokeWidth={1.8} />
              </div>
              <p className="mod-title">{label}</p>
              <p className="mod-desc">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
