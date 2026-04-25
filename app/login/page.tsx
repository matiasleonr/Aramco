'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Error al iniciar sesión')
        return
      }
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0b1120' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ width: 90, height: 90, borderRadius: 26, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', marginBottom: 16, overflow: 'hidden', padding: 6 }}>
            <Image src="/cca-logo.png" alt="CCA" width={80} height={80} style={{ objectFit: 'contain', width: '100%', height: '100%' }} priority
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0, textAlign: 'center' }}>Distribuidora CCA</h1>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Sistema de Gestión de Inventario</p>
        </div>

        {/* Card */}
        <div style={{ background: '#131f35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} color="#60a5fa" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Acceso al sistema</p>
              <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Ingresa la contraseña para continuar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  style={{ width: '100%', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 15, padding: '12px 44px 12px 14px', borderRadius: 12, outline: 'none', boxSizing: 'border-box', letterSpacing: showPwd ? 'normal' : '0.15em' }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !password}
              style={{ padding: '13px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading || !password ? 'not-allowed' : 'pointer', opacity: loading || !password ? 0.6 : 1, boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#1e293b', marginTop: 20 }}>
          Distribuidora CCA · Sistema privado
        </p>
      </div>
    </div>
  )
}
