import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: Number(params.id) },
    })
    if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json(producto)
  } catch {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { nombre, categoria, stockActual, stockMinimo, precioVenta, precioCosto } = body

    const producto = await prisma.producto.update({
      where: { id: Number(params.id) },
      data: {
        nombre: nombre?.trim(),
        categoria,
        stockActual: Number(stockActual),
        stockMinimo: Number(stockMinimo),
        precioVenta: Number(precioVenta),
        precioCosto: Number(precioCosto),
      },
    })

    return NextResponse.json(producto)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.producto.delete({ where: { id: Number(params.id) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
