import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [productos, movimientosHoy, movimientosRecientes, topSalidas] = await Promise.all([
      prisma.producto.findMany(),
      prisma.movimiento.count({
        where: { fecha: { gte: today, lt: tomorrow } },
      }),
      prisma.movimiento.findMany({
        take: 8,
        orderBy: { fecha: 'desc' },
        include: { producto: { select: { nombre: true } } },
      }),
      prisma.movimiento.groupBy({
        by: ['productoId'],
        where: { tipo: 'salida', fecha: { gte: thirtyDaysAgo } },
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 5,
      }),
    ])

    const productosConStockBajo = productos.filter(
      (p) => p.stockActual <= p.stockMinimo
    ).length

    const valorInventario = productos.reduce(
      (sum, p) => sum + p.stockActual * p.precioCosto,
      0
    )

    const productIds = topSalidas.map((s) => s.productoId)
    const productosTop = await prisma.producto.findMany({
      where: { id: { in: productIds } },
      select: { id: true, nombre: true },
    })

    const topProductos = topSalidas.map((s) => ({
      nombre: productosTop.find((p) => p.id === s.productoId)?.nombre ?? `Prod. ${s.productoId}`,
      salidas: s._sum.cantidad ?? 0,
    }))

    return NextResponse.json({
      productosConStockBajo,
      movimientosHoy,
      valorInventario,
      totalProductos: productos.length,
      movimientosRecientes,
      topProductos,
    })
  } catch {
    return NextResponse.json({ error: 'Error al cargar dashboard' }, { status: 500 })
  }
}
