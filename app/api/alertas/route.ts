import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const countOnly = searchParams.get('count') === 'true'

    const productos = await prisma.producto.findMany({
      where: {
        stockActual: { lte: prisma.producto.fields.stockMinimo },
      },
      orderBy: [{ stockActual: 'asc' }],
    })

    // Prisma SQLite doesn't support field comparisons in where, so we filter in JS
    const alertas = await prisma.producto.findMany({
      orderBy: { stockActual: 'asc' },
    })
    const productosAlerta = alertas.filter((p) => p.stockActual <= p.stockMinimo)

    if (countOnly) return NextResponse.json({ count: productosAlerta.length })

    return NextResponse.json(
      productosAlerta.map((p) => ({
        ...p,
        deficit: p.stockMinimo - p.stockActual,
      }))
    )
  } catch {
    return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 })
  }
}
