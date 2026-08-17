import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import {
  RASTER,
  parseRasterPos,
  rasterSpecOf,
  stapeleUntereinander,
} from '../core/blocks/rasterLayout'
import { istSeitenBaustein, istFlaechenSeite } from './pageOps'
import { createEmptyTree, normalizeProps } from './treeOps'

export const CURRENT_SCHEMA_VERSION = 6

export const DEMO_CLEANUP_BEFORE_SCHEMA = 5

const ALTE_KARTEN_DEMOS: ReadonlyArray<readonly [string, string]> = [
  ['heading', 'Rückruf Fr. Wagner'],
  ['time', '09:15'],
  ['meta', 'Katze · EKH'],
  ['text', 'Befund Minka besprechen'],
  ['chipText', 'Heute'],
]

export function putzeAlteKartenDemos(tree: BlockTree): string[] {
  const geleert: string[] = []
  for (const node of Object.values(tree)) {
    if (node.type !== 'card') continue
    for (const [prop, demo] of ALTE_KARTEN_DEMOS) {
      if (node.props[prop] !== demo) continue
      node.props[prop] = ''
      geleert.push(`${node.id}.${prop}`)
    }
  }
  return geleert
}

const WEGGEFALLENE_PROPS: ReadonlyArray<readonly [string, string]> = [

  ['tabelle', 'proSeite'],
  ['tabelle', 'zeilenWaehler'],
]

export function weggefalleneProps(rohBaum: Record<string, unknown>): string[] {
  const raus: string[] = []
  for (const [id, knoten] of Object.entries(rohBaum)) {
    if (!knoten || typeof knoten !== 'object') continue
    const k = knoten as { type?: unknown; props?: unknown }
    if (!k.props || typeof k.props !== 'object') continue
    const props = k.props as Record<string, unknown>
    for (const [typ, prop] of WEGGEFALLENE_PROPS) {
      if (k.type !== typ) continue
      if (Object.prototype.hasOwnProperty.call(props, prop)) raus.push(`${id}.${prop}`)
    }
  }
  return raus
}

export function migrateFlatBlocks(blocks: unknown[]): BlockTree {
  const tree = createEmptyTree()
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') continue
    const b = raw as { id?: unknown; type?: unknown; props?: unknown }
    if (typeof b.id !== 'string' || typeof b.type !== 'string') continue
    if (!getBlockDefinition(b.type)) continue
    tree[b.id] = {
      id: b.id,
      type: b.type,
      props: normalizeProps(b.type, b.props && typeof b.props === 'object' ? b.props as Record<string, unknown> : {}),
      parentId: ROOT_ID,
      childIds: [],
    }
    tree[ROOT_ID].childIds.push(b.id)
  }
  return tree
}

export function migrateRootKanbanToViewportFill(tree: BlockTree): boolean {
  let migrated = false
  for (const id of tree[ROOT_ID]?.childIds ?? []) {
    const node = tree[id]
    if (node?.type !== 'kanban') continue
    if (node.props.width === 'fill' && node.props.height === 'fill') continue
    tree[id] = { ...node, props: { ...node.props, width: 'fill', height: 'fill' } }
    migrated = true
  }
  return migrated
}

function migrationsHoehe(node: BlockNode): number {
  const h = node.props.height
  if (typeof h === 'number' && Number.isFinite(h) && h > 0) {
    return Math.max(1, Math.ceil(h / RASTER.zeilePx))
  }
  return rasterSpecOf(getBlockDefinition(node.type)).startH
}

const PX_PRO_ZELLE = RASTER.spaltePx

function migrationsBreite(node: BlockNode): number {
  const w = node.props.width
  if (typeof w === 'number' && Number.isFinite(w) && w > 0) {
    return Math.min(RASTER.spalten, Math.max(1, Math.ceil(w / PX_PRO_ZELLE)))
  }
  if (w === 'fill') return RASTER.spalten
  return rasterSpecOf(getBlockDefinition(node.type), node.props).startW
}

function rasterFlaechenIds(tree: BlockTree): string[] {
  const popups = Object.values(tree)
    .filter((n) => getBlockDefinition(n.type)?.pageBlock === true)
    .map((n) => n.id)
  return [ROOT_ID, ...popups]
}

export function migrateFlowToRaster(tree: BlockTree): boolean {
  let migrated = false
  for (const flaecheId of rasterFlaechenIds(tree)) {
    const flaeche = tree[flaecheId]
    if (!flaeche) continue
    const kinder = flaeche.childIds
      .map((id) => tree[id])
      .filter((n): n is BlockNode => Boolean(n) && getBlockDefinition(n.type)?.pageBlock !== true)
    if (kinder.length === 0) continue
    const positionen = stapeleUntereinander(
      kinder.map((n) => ({ w: migrationsBreite(n), h: migrationsHoehe(n) })),
    )
    kinder.forEach((node, i) => {
      const p = positionen[i]
      node.props = { ...node.props, rasterX: p.x, rasterY: p.y, rasterW: p.w, rasterH: p.h }
    })
    migrated = true
  }
  return migrated
}

export function migrateRasterBreitenReparatur(tree: BlockTree): boolean {
  let migrated = false
  for (const flaecheId of rasterFlaechenIds(tree)) {
    const flaeche = tree[flaecheId]
    if (!flaeche) continue
    const kinder = flaeche.childIds
      .map((id) => tree[id])
      .filter((n): n is BlockNode => Boolean(n) && getBlockDefinition(n.type)?.pageBlock !== true)
    if (kinder.length === 0) continue

    const istKaputt = (node: BlockNode): boolean => {
      const p = parseRasterPos(node.props)
      const startW = rasterSpecOf(getBlockDefinition(node.type), node.props).startW
      return p.x === 0 && p.w === RASTER.spalten && startW < RASTER.spalten
    }
    if (!kinder.some(istKaputt)) continue

    const groessen = kinder.map((node) => {
      const p = parseRasterPos(node.props)
      const w = istKaputt(node) ? rasterSpecOf(getBlockDefinition(node.type), node.props).startW : p.w
      return { w, h: p.h }
    })
    const positionen = stapeleUntereinander(groessen)
    kinder.forEach((node, i) => {
      const p = positionen[i]
      node.props = { ...node.props, rasterX: p.x, rasterY: p.y, rasterW: p.w, rasterH: p.h }
    })
    migrated = true
  }
  return migrated
}

export function migratePopupInhaltAufRaster(tree: BlockTree): boolean {
  let migriert = false
  for (const knoten of Object.values(tree)) {
    if (!istSeitenBaustein(knoten) || istFlaechenSeite(knoten)) continue
    const kinder = knoten.childIds
      .map((id) => tree[id])
      .filter((n): n is BlockNode => Boolean(n))
    if (kinder.length === 0) continue
    const positionen = stapeleUntereinander(kinder.map((n) => {
      const spec = rasterSpecOf(getBlockDefinition(n.type), n.props)
      return { w: spec.startW, h: spec.startH }
    }))
    kinder.forEach((n, i) => {
      const p = positionen[i]
      n.props = { ...n.props, rasterX: p.x, rasterY: p.y, rasterW: p.w, rasterH: p.h }
    })
    migriert = true
  }
  return migriert
}

export function migrateRasterHoehenReset(tree: BlockTree): boolean {
  let migrated = false
  for (const flaecheId of rasterFlaechenIds(tree)) {
    const flaeche = tree[flaecheId]
    if (!flaeche) continue
    for (const id of flaeche.childIds) {
      const node = tree[id]
      if (!node || getBlockDefinition(node.type)?.pageBlock === true) continue
      const p = parseRasterPos(node.props)
      const startH = rasterSpecOf(getBlockDefinition(node.type)).startH
      const neu = Math.min(p.h, startH)
      if (neu !== p.h) {
        node.props = { ...node.props, rasterH: neu }
        migrated = true
      }
    }
  }
  return migrated
}
