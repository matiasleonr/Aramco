import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [productos, salidas] = await Promise.all([
      prisma.producto.findMany({ orderBy: { nombre: 'asc' } }),
      prisma.movimiento.groupBy({
        by: ['productoId'],
        where: { tipo: 'salida', fecha: { gte: thirtyDaysAgo } },
        _sum: { cantidad: true },
      }),
    ])

    const salidasMap = new Map(
      salidas.map((s) => [s.productoId, s._sum.cantidad ?? 0])
    )

    const predicciones = productos.map((p) => {
      const totalSalidas30 = salidasMap.get(p.id) ?? 0
      const avgDiario = totalSalidas30 / 30
      const avgSemanal = avgDiario * 7

      const diasRestantes = avgDiario > 0 ? p.stockActual / avgDiario : null
      const fechaQuiebre =
        diasRestantes != null
          ? new Date(Date.now() + diasRestantes * 86400000).toISOString()
          : null

      const cantidadSugerida = Math.ceil(avgSemanal * 2)

      let urgencia: 'alta' | 'media' | 'baja' | 'sin_movimiento'
      if (totalSalidas30 === 0) urgencia = 'sin_movimiento'
      else if (diasRestantes != null && diasRestantes <= 7) urgencia = 'alta'
      else if (diasRestantes != null && diasRestantes <= 14) urgencia = 'media'
      else urgencia = 'baja'

      return {
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo,
        precioCosto: p.precioCosto,
        precioVenta: p.precioVenta,
        totalSalidas30,
        avgDiario: Math.round(avgDiario * 100) / 100,
        avgSemanal: Math.round(avgSemanal * 100) / 100,
        diasRestantes: diasRestantes != null ? Math.round(diasRestantes) : null,
        fechaQuiebre,
        cantidadSugerida: cantidadSugerida > 0 ? cantidadSugerida : 0,
        costoOrden: cantidadSugerida * p.precioCosto,
        urgencia,
      }
    })

    predicciones.sort((a, b) => {
      const order = { alta: 0, media: 1, baja: 2, sin_movimiento: 3 }
      return order[a.urgencia] - order[b.urgencia]
    })

    return NextResponse.json(predicciones)
  } catch {
    return NextResponse.json({ error: 'Error al calcular predicciones' }, { status: 500 })
  }
}
