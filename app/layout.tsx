import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Distribuidora CCA — Gestión de Inventario',
  description: 'Sistema de gestión de inventario para Distribuidora CCA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[#0b1120] text-slate-100 antialiased">
        <Sidebar />
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
