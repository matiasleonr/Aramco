'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { nombre: string; salidas: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm">
        <p className="text-slate-300 mb-1 font-medium">{label}</p>
        <p className="text-blue-400">{payload[0].value} unidades vendidas</p>
      </div>
    )
  }
  return null
}

export function TopProductsChart({ data }: Props) {
  const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n) + '…' : s)
  const chartData = data.map((d) => ({ ...d, nombre: truncate(d.nombre, 18) }))

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        Sin datos de movimientos en los últimos 30 días
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="nombre"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
        <Bar dataKey="salidas" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}
