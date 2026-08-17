import { propertySichtbar, type PropertyVisibilityCondition } from './PropertyDescription'
import { styleToCss } from './styleCss'

export const RASTER = { spalten: 24, spaltePx: 40, zeilePx: 12, gapPx: 8 } as const

export interface RasterPos {
  x: number
  y: number
  w: number
  h: number
}

export interface RasterSpec {
  startW: number
  startH: number
  minW: number
  minH: number
  breiteZiehbar: boolean
  varianten: readonly RasterVariante[]
}

export interface RasterVariante extends Partial<Omit<RasterSpec, 'varianten'>> {
  wenn: PropertyVisibilityCondition
}

export const RASTER_FALLBACK: RasterSpec = {
  startW: 6,
  startH: 3,
  minW: 1,
  minH: 1,
  breiteZiehbar: true,
  varianten: [],
}

export const RASTER_DEFAULTS: Record<string, unknown> = {
  rasterX: 0,
  rasterY: 0,
  rasterW: RASTER.spalten,
  rasterH: 1,
}

export function parseRasterCell(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value)
  }
  return fallback
}

export function parseRasterPos(props: Record<string, unknown>): RasterPos {
  return {
    x: parseRasterCell(props.rasterX, 0),
    y: parseRasterCell(props.rasterY, 0),
    w: Math.max(1, parseRasterCell(props.rasterW, RASTER.spalten)),
    h: Math.max(1, parseRasterCell(props.rasterH, 1)),
  }
}

export function rasterSpecOf(
  def: { raster?: Partial<RasterSpec> } | undefined,
  props: Record<string, unknown> = {},
): RasterSpec {
  const basis: RasterSpec = { ...RASTER_FALLBACK, ...(def?.raster ?? {}) }
  for (const v of basis.varianten) {
    if (!propertySichtbar(v.wenn, props)) continue
    return {
      startW: v.startW ?? basis.startW,
      startH: v.startH ?? basis.startH,
      minW: v.minW ?? basis.minW,
      minH: v.minH ?? basis.minH,
      breiteZiehbar: v.breiteZiehbar ?? basis.breiteZiehbar,
      varianten: basis.varianten,
    }
  }
  return basis
}

export function rasterFlaecheStyle(): Record<string, string | number> {
  return {
    display: 'grid',

    gridTemplateColumns: `repeat(${RASTER.spalten}, 1fr)`,

    gridAutoRows: `${RASTER.zeilePx}px`,
    gap: `${RASTER.gapPx}px`,

    alignContent: 'start',
  }
}

export function rasterFlaecheCss(): string {
  return styleToCss(rasterFlaecheStyle())
}

export function rasterItemStyle(pos: RasterPos): Record<string, string | number> {
  return {
    gridColumn: `${pos.x + 1} / span ${pos.w}`,
    gridRow: `${pos.y + 1} / span ${pos.h}`,
    minWidth: 0,
    minHeight: 0,
  }
}

export function stapeleUntereinander(
  groessen: readonly { w: number; h: number }[],
): RasterPos[] {
  const out: RasterPos[] = []
  let y = 0
  for (const g of groessen) {
    const w = Math.max(1, Math.floor(g.w))
    const h = Math.max(1, Math.floor(g.h))
    out.push({ x: 0, y, w, h })
    y += h
  }
  return out
}

export function naechsteFreieZeile(positionen: readonly RasterPos[]): number {
  return positionen.reduce((max, p) => Math.max(max, p.y + p.h), 0)
}
