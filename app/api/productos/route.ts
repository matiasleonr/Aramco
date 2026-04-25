import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(productos)
  } catch {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, categoria, stockActual, stockMinimo, precioVenta, precioCosto } = body

    if (!nombre || !categoria || precioVenta == null || precioCosto == null) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const producto = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        categoria,
        stockActual: Number(stockActual) || 0,
        stockMinimo: Number(stockMinimo) || 0,
        precioVenta: Number(precioVenta),
        precioCosto: Number(precioCosto),
      },
    })

    return NextResponse.json(producto, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
