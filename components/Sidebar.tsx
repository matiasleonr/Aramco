'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home, Package, ArrowLeftRight,
  ClipboardList, Bell, TrendingUp, Menu, X, LogOut,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',             label: 'Inicio',       Icon: Home,           color: '#60a5fa' },
  { href: '/productos',    label: 'Productos',    Icon: Package,        color: '#a78bfa' },
  { href: '/movimientos',  label: 'Movimientos',  Icon: ArrowLeftRight, color: '#34d399' },
  { href: '/historial',    label: 'Historial',    Icon: ClipboardList,  color: '#38bdf8' },
  { href: '/alertas',      label: 'Alertas',      Icon: Bell,           color: '#f87171' },
  { href: '/predicciones', label: 'Predicciones', Icon: TrendingUp,     color: '#fbbf24' },
]

function LogoutButton({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    onClose?.()
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: '#475569', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)' }}>
      <LogOut size={15} />
      Cerrar sesión
    </button>
  )
}

function NavInner({ onClose, alertCount }: { onClose?: () => void; alertCount: number }) {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
          <Image
            src="/cca-logo.png"
            alt="CCA"
            width={44}
            height={44}
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Distribuidora CCA</p>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Gestión de Inventario</p>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: 8 }}>Menú</p>
        {NAV.map(({ href, label, Icon, color }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={onClose} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 14,
                background: active ? 'rgba(255,255,255,.07)' : 'transparent',
                border: active ? '1px solid rgba(255,255,255,.08)' : '1px solid transparent',
                transition: 'all .15s ease', cursor: 'pointer',
              }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,.04)' }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: active ? `${color}22` : 'transparent',
                  color: active ? color : '#64748b',
                  transition: 'all .15s ease',
                }}>
                  <Icon size={17} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: active ? '#f1f5f9' : '#64748b', flex: 1 }}>{label}</span>
                {href === '/alertas' && alertCount > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#ef4444', color: '#fff', borderRadius: 99, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <LogoutButton onClose={onClose} />
        <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 10 }}>v1.0 · Distribuidora CCA</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/alertas?count=true').then((r) => r.json()).then((d) => setAlertCount(d.count ?? 0)).catch(() => {})
  }, [pathname])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {/* Hamburger toggle (CSS class: hidden on desktop) */}
      <button className="sidebar-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menú">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay (CSS class) */}
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      {/* Mobile drawer (CSS class: fixed, slides in/out) */}
      <div className={`sidebar-drawer${open ? ' open' : ''}`}>
        <NavInner onClose={() => setOpen(false)} alertCount={alertCount} />
      </div>

    </>
  )
}
