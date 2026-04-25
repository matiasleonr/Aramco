import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productoId = searchParams.get('productoId')
    const tipo = searchParams.get('tipo')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const limit = Number(searchParams.get('limit') || 100)

    const where: Record<string, unknown> = {}
    if (productoId) where.productoId = Number(productoId)
    if (tipo) where.tipo = tipo
    if (desde || hasta) {
      where.fecha = {}
      if (desde) (where.fecha as Record<string, Date>).gte = new Date(desde)
      if (hasta) {
        const hastaDate = new Date(hasta)
        hastaDate.setHours(23, 59, 59, 999)
        ;(where.fecha as Record<string, Date>).lte = hastaDate
      }
    }

    const movimientos = await prisma.movimiento.findMany({
      where,
      include: { producto: { select: { nombre: true, categoria: true } } },
      orderBy: { fecha: 'desc' },
      take: limit,
    })

    return NextResponse.json(movimientos)
  } catch {
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productoId, tipo, cantidad, motivo, fecha } = body

    if (!productoId || !tipo || !cantidad) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!['entrada', 'salida'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const cantNum = Number(cantidad)
    if (cantNum <= 0) {
      return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 400 })
    }

    const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } })
    if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    if (tipo === 'salida' && producto.stockActual < cantNum) {
      return NextResponse.json({ error: 'Stock insuficiente para registrar la salida' }, { status: 400 })
    }

    const [movimiento] = await prisma.$transaction([
      prisma.movimiento.create({
        data: {
          productoId: Number(productoId),
          tipo,
          cantidad: cantNum,
          motivo: motivo?.trim() || null,
          fecha: fecha ? new Date(fecha) : new Date(),
        },
        include: { producto: { select: { nombre: true, categoria: true } } },
      }),
      prisma.producto.update({
        where: { id: Number(productoId) },
        data: {
          stockActual: tipo === 'entrada'
            ? { increment: cantNum }
            : { decrement: cantNum },
        },
      }),
    ])

    return NextResponse.json(movimiento, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al registrar movimiento' }, { status: 500 })
  }
}
