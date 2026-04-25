# Inventario Gasolinera — Instrucciones de Instalación

## Requisitos previos

1. **Node.js 18+** — Descarga desde: https://nodejs.org/en/download
   - Elige "Windows Installer (.msi)" versión LTS
   - Instala con opciones por defecto
   - Reinicia la terminal después de instalar

## Instalación (ejecutar en este orden)

Abre una terminal (cmd o PowerShell) en la carpeta del proyecto y ejecuta:

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos SQLite
npx prisma db push

# 3. (Opcional) Cargar datos de ejemplo
npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Luego abre tu navegador en: **http://localhost:3000**

## Módulos disponibles

| Módulo | URL | Descripción |
|--------|-----|-------------|
| Dashboard | `/` | KPIs, gráfico de rotación, movimientos recientes |
| Productos | `/productos` | CRUD completo con búsqueda y filtros |
| Movimientos | `/movimientos` | Registrar entradas (compras) y salidas (ventas/mermas) |
| Historial | `/historial` | Tabla filtrable por fecha, producto y tipo |
| Alertas | `/alertas` | Productos con stock bajo el mínimo configurado |
| Predicciones | `/predicciones` | Orden de compra sugerida con exportación PDF/Excel |

## Categorías de productos

- Bebidas y snacks
- Lubricantes y aceites
- Repuestos y accesorios
- Cigarrillos y tabaco

## Base de datos

Los datos se guardan en `prisma/dev.db` (SQLite local, no requiere servidor).
Para resetear completamente: elimina `dev.db` y ejecuta `npx prisma db push` de nuevo.

## Exportación

- **Excel**: genera `orden-compra-FECHA.xlsx` con todos los campos de predicción
- **PDF**: genera `orden-compra-FECHA.pdf` en formato A4 horizontal con tabla formateada
