import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const PROMPT = `Eres un sistema de extracción de datos de documentos comerciales chilenos (facturas, boletas, órdenes de compra, órdenes de venta, guías de despacho).
Analiza esta imagen y extrae TODOS los productos/ítems listados.

Devuelve ÚNICAMENTE un JSON array (sin texto adicional, sin markdown, sin bloques de código) con esta estructura exacta:
[
  {
    "nombre": "nombre del producto tal como aparece en el documento",
    "cantidad": <número entero, usa 1 si no aparece>,
    "precioUnitario": <precio unitario en CLP como número entero, 0 si no aparece>
  }
]

Reglas:
- Incluye TODOS los productos/ítems del documento
- Si la cantidad no es clara, usa 1
- Si el precio no aparece, usa 0
- No incluyas totales, subtotales, impuestos, descuentos ni filas de resumen
- Si no puedes identificar productos, devuelve: []`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'tu-api-key-aqui') {
    return NextResponse.json(
      { error: 'API key de Anthropic no configurada. Agrega ANTHROPIC_API_KEY en el archivo .env' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { imageBase64, mediaType } = body

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const isPdf = mediaType === 'application/pdf'
    const fileBlock = isPdf
      ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: imageBase64 } }
      : { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageBase64 } }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [fileBlock, { type: 'text', text: PROMPT }],
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract JSON array from the response (handles cases where model adds extra text)
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) {
      return NextResponse.json({ items: [], raw })
    }

    const items = JSON.parse(match[0])
    return NextResponse.json({ items })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar la imagen'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
