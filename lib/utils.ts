import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export const CATEGORIAS = [
  'Bebidas y snacks',
  'Lubricantes y aceites',
  'Repuestos y accesorios',
  'Cigarrillos y tabaco',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const CATEGORIA_COLORS: Record<string, string> = {
  'Bebidas y snacks': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Lubricantes y aceites': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Repuestos y accesorios': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Cigarrillos y tabaco': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
}
