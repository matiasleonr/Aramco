import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.movimiento.deleteMany()
  await prisma.producto.deleteMany()

  const productos = await prisma.producto.createMany({
    data: [
      { nombre: 'Coca-Cola 350ml', categoria: 'Bebidas y snacks', stockActual: 48, stockMinimo: 20, precioVenta: 1200, precioCosto: 700 },
      { nombre: 'Agua Mineral 500ml', categoria: 'Bebidas y snacks', stockActual: 60, stockMinimo: 30, precioVenta: 800, precioCosto: 400 },
      { nombre: 'Papas Fritas Lays 45g', categoria: 'Bebidas y snacks', stockActual: 8, stockMinimo: 15, precioVenta: 950, precioCosto: 550 },
      { nombre: 'Energizante Monster 473ml', categoria: 'Bebidas y snacks', stockActual: 24, stockMinimo: 12, precioVenta: 2500, precioCosto: 1500 },
      { nombre: 'Chocolate Barra 45g', categoria: 'Bebidas y snacks', stockActual: 3, stockMinimo: 10, precioVenta: 700, precioCosto: 400 },
      { nombre: 'Aceite Motor 5W-30 1L', categoria: 'Lubricantes y aceites', stockActual: 15, stockMinimo: 8, precioVenta: 12000, precioCosto: 7500 },
      { nombre: 'Aceite Motor 10W-40 1L', categoria: 'Lubricantes y aceites', stockActual: 5, stockMinimo: 8, precioVenta: 10500, precioCosto: 6500 },
      { nombre: 'Liquido Frenos DOT4 500ml', categoria: 'Lubricantes y aceites', stockActual: 10, stockMinimo: 5, precioVenta: 5500, precioCosto: 3000 },
      { nombre: 'Filtro de Aceite Universal', categoria: 'Repuestos y accesorios', stockActual: 12, stockMinimo: 6, precioVenta: 8500, precioCosto: 5000 },
      { nombre: 'Escobillas Limpiaparabrisas 26"', categoria: 'Repuestos y accesorios', stockActual: 4, stockMinimo: 4, precioVenta: 14000, precioCosto: 8000 },
      { nombre: 'Cargador USB Auto', categoria: 'Repuestos y accesorios', stockActual: 20, stockMinimo: 8, precioVenta: 6500, precioCosto: 3500 },
      { nombre: 'Cigarrillos Marlboro Gold', categoria: 'Cigarrillos y tabaco', stockActual: 30, stockMinimo: 20, precioVenta: 4200, precioCosto: 3000 },
      { nombre: 'Cigarrillos Belmont Azul', categoria: 'Cigarrillos y tabaco', stockActual: 25, stockMinimo: 20, precioVenta: 3800, precioCosto: 2700 },
      { nombre: 'Tabaco para Armar 30g', categoria: 'Cigarrillos y tabaco', stockActual: 18, stockMinimo: 10, precioVenta: 5500, precioCosto: 4000 },
    ],
  })

  console.log(`Creados ${productos.count} productos`)

  const allProducts = await prisma.producto.findMany()

  const now = new Date()
  const movimientos: Array<{
    productoId: number
    tipo: string
    cantidad: number
    motivo: string
    fecha: Date
  }> = []

  for (const prod of allProducts) {
    for (let i = 29; i >= 0; i--) {
      const fecha = new Date(now)
      fecha.setDate(fecha.getDate() - i)

      const ventas = Math.floor(Math.random() * 5) + 1
      movimientos.push({
        productoId: prod.id,
        tipo: 'salida',
        cantidad: ventas,
        motivo: 'Venta',
        fecha,
      })
    }
    movimientos.push({
      productoId: prod.id,
      tipo: 'entrada',
      cantidad: 50,
      motivo: 'Compra a proveedor',
      fecha: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    })
  }

  await prisma.movimiento.createMany({ data: movimientos })
  console.log(`Creados ${movimientos.length} movimientos de ejemplo`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
