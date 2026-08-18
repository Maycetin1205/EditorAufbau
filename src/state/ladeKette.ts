import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { sanitizeBlockEvents } from '../core/data/aktionen'
import { BEREICH_AUFBAU, type LadeProblem } from '../core/data/ladeProblem'
import {
  CURRENT_SCHEMA_VERSION,
  DEMO_CLEANUP_BEFORE_SCHEMA,
  migrateFlatBlocks,
  migrateFlowToRaster,
  migratePopupInhaltAufRaster,
  migrateRasterBreitenReparatur,
  migrateRasterHoehenReset,
  migrateRootKanbanToViewportFill,
  putzeAlteKartenDemos,
  weggefalleneProps,
} from './migrations'
import {
  migrateAnzeigeFeldAufSpalten,
  migrateErfassungsRollenWeg,
  migrateKanbanVorlage,
  migrateKnopfAusTabelle,
  migrateZeileAufloesen,
} from './migrationenRoh'
import { topologieProbleme } from './topologie'
import { createEmptyTree, normalizeProps } from './treeOps'

export function sanitizeTree(
  raw: Record<string, unknown>,
  meldungen?: {
    typVerworfen?: (type: string) => void
    absichtlichEntfernt?: (id: string) => void
  },
): BlockTree {
  const tree = createEmptyTree()
  const src = raw as Record<string, { type?: unknown; props?: unknown; childIds?: unknown; events?: unknown }>
  const onDropType = meldungen?.typVerworfen
  migrateAnzeigeFeldAufSpalten(src)
  migrateErfassungsRollenWeg(src)
  const rohEntfernt = [
    ...migrateKanbanVorlage(src),
    ...migrateKnopfAusTabelle(src),
    ...migrateZeileAufloesen(src),
  ]
  for (const id of rohEntfernt) {
    meldungen?.absichtlichEntfernt?.(id)
  }

  const addChild = (parentId: string, childId: unknown): void => {
    if (typeof childId !== 'string' || tree[childId]) return
    const node = src[childId]
    if (!node || typeof node !== 'object') return
    if (typeof node.type !== 'string') return
    const def = getBlockDefinition(node.type)
    if (!def) {
      onDropType?.(node.type)

      const kids = Array.isArray(node.childIds) ? node.childIds : []
      for (const k of kids) addChild(parentId, k)
      return
    }

    const events = sanitizeBlockEvents(node.events, (def.blockEvents ?? []).map((e) => e.key))
    tree[childId] = {
      id: childId,
      type: node.type,
      props: normalizeProps(node.type, node.props && typeof node.props === 'object' ? node.props as Record<string, unknown> : {}),
      ...(events ? { events } : {}),
      parentId,
      childIds: [],
    }
    tree[parentId].childIds.push(childId)
    const grand = Array.isArray(node.childIds) ? node.childIds : []
    for (const g of grand) addChild(childId, g)
  }

  const rootSrc = src[ROOT_ID]
  const rootChildren = rootSrc && Array.isArray(rootSrc.childIds) ? rootSrc.childIds : []
  for (const cid of rootChildren) addChild(ROOT_ID, cid)
  return tree
}

export interface BaumErgebnis {
  tree: BlockTree
  selectedId: string | null

  schemaAdvanced: boolean

  absichtlichGeleert: ReadonlySet<string>

  absichtlichEntfernt: ReadonlySet<string>

  verworfen: Map<string, number>
}

export function baumAusRohdaten(parsed: {
  schemaVersion?: unknown
  tree?: unknown
  blocks?: unknown
  selectedId?: unknown
}, putzeDemos = true): BaumErgebnis | null {
  let tree: BlockTree | null = null

  const verworfen = new Map<string, number>()
  const absichtlichGeleert = new Set<string>()
  const absichtlichEntfernt = new Set<string>()
  if (parsed.tree && typeof parsed.tree === 'object') {
    tree = sanitizeTree(parsed.tree as Record<string, unknown>, {
      typVerworfen: (type) => {
        verworfen.set(type, (verworfen.get(type) ?? 0) + 1)
      },
      absichtlichEntfernt: (id) => absichtlichEntfernt.add(id),
    })

    if (putzeDemos) for (const p of putzeAlteKartenDemos(tree)) absichtlichGeleert.add(p)

    for (const p of weggefalleneProps(parsed.tree as Record<string, unknown>)) {
      absichtlichGeleert.add(p)
    }
  } else if (Array.isArray(parsed.blocks)) {
    tree = migrateFlatBlocks(parsed.blocks)
  }

  if (!tree) return null

  const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
  let schemaAdvanced = false
  if (schemaVersion < 2) schemaAdvanced = migrateRootKanbanToViewportFill(tree) || schemaAdvanced
  if (schemaVersion < 3) schemaAdvanced = migrateFlowToRaster(tree) || schemaAdvanced

  if (schemaVersion < 4) schemaAdvanced = migrateRasterBreitenReparatur(tree) || schemaAdvanced

  if (schemaVersion < 5) schemaAdvanced = migrateRasterHoehenReset(tree) || schemaAdvanced

  if (schemaVersion < 6) schemaAdvanced = migratePopupInhaltAufRaster(tree) || schemaAdvanced

  const selectedId =
    typeof parsed.selectedId === 'string' && tree[parsed.selectedId] && parsed.selectedId !== ROOT_ID
      ? parsed.selectedId
      : null
  return { tree, selectedId, schemaAdvanced, absichtlichGeleert, absichtlichEntfernt, verworfen }
}

export function keinVerlust(roh: unknown, rein: unknown): boolean {
  if (roh === rein) return true
  if (Array.isArray(roh) || Array.isArray(rein)) {
    if (!Array.isArray(roh) || !Array.isArray(rein) || roh.length !== rein.length) return false
    return roh.every((x, i) => keinVerlust(x, rein[i]))
  }
  if (typeof roh !== 'object' || typeof rein !== 'object' || roh === null || rein === null) return false
  const a = roh as Record<string, unknown>
  const b = rein as Record<string, unknown>
  return Object.keys(a)
    .filter((k) => a[k] !== undefined)
    .every((k) => Object.prototype.hasOwnProperty.call(b, k) && keinVerlust(a[k], b[k]))
}

function ohneGeleerte(
  props: unknown,
  bausteinId: string,
  geleert: ReadonlySet<string>,
): unknown {
  if (geleert.size === 0 || !props || typeof props !== 'object' || Array.isArray(props)) {
    return props
  }
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
    if (!geleert.has(`${bausteinId}.${k}`)) out[k] = v
  }
  return out
}

export function strukturProbleme(rohBaum: Record<string, unknown>): LadeProblem[] {
  const raus: LadeProblem[] = []
  for (const [id, knoten] of Object.entries(rohBaum)) {
    const kinder = knoten && typeof knoten === 'object'
      ? (knoten as Record<string, unknown>).childIds
      : undefined
    if (!knoten || typeof knoten !== 'object' || (kinder !== undefined && !Array.isArray(kinder))) {
      raus.push({ bereich: BEREICH_AUFBAU, stelle: id, grund: `der Baustein „${id}" ist unlesbar` })
      continue
    }
    for (const kind of Array.isArray(kinder) ? kinder : []) {
      if (typeof kind !== 'string' || !(kind in rohBaum)) {
        raus.push({
          bereich: BEREICH_AUFBAU,
          stelle: id,
          grund: 'ein Baustein verweist auf einen anderen, den der Stand nicht enthält',
        })
      }
    }
  }
  return raus
}

export function verlustProbleme(
  rohBaum: Record<string, unknown>,
  baum: BaumErgebnis,
): LadeProblem[] {
  const raus: LadeProblem[] = []

  const rohKnoten = Object.keys(rohBaum)
    .filter((id) => id !== ROOT_ID && !baum.absichtlichEntfernt.has(id)).length
  const reinKnoten = Object.keys(baum.tree).filter((id) => id !== ROOT_ID).length
  const bekanntVerworfen = [...baum.verworfen.values()].reduce((a, b) => a + b, 0)
  if (rohKnoten > reinKnoten + bekanntVerworfen) {
    raus.push({
      bereich: BEREICH_AUFBAU,
      stelle: '',
      grund: 'im Masken-Aufbau fehlen Bausteine '
        + `(${rohKnoten - reinKnoten - bekanntVerworfen} von ${rohKnoten})`,
    })
  }

  if (baum.schemaAdvanced || bekanntVerworfen > 0 || baum.absichtlichEntfernt.size > 0) return raus
  for (const [id, rohKnoten] of Object.entries(rohBaum)) {
    const rein = baum.tree[id]
    const roh = rohKnoten as Record<string, unknown>

    if (id === ROOT_ID) {
      if (keinVerlust(roh.childIds, rein?.childIds)) continue
      raus.push({
        bereich: BEREICH_AUFBAU,
        stelle: ROOT_ID,
        grund: 'im Masken-Aufbau fehlen Beziehungen zwischen Bausteinen',
      })
      continue
    }

    if (!rein || rein.type !== roh.type
      || !keinVerlust(ohneGeleerte(roh.props, id, baum.absichtlichGeleert), rein.props)
      || !keinVerlust(roh.events, rein.events)
      || !keinVerlust(roh.childIds, rein.childIds)) {
      raus.push({
        bereich: BEREICH_AUFBAU,
        stelle: id,
        grund: `am Baustein „${id}" stimmen Angaben nicht`,
      })
    }
  }
  return raus
}

export type AblehnGrund =

  | 'zukunft'
  // Gueltiges JSON, aber kein verwertbarer Masken-Aufbau.
  | 'unlesbar'
  // Beim Laden waere etwas verlorengegangen (A4).
  | 'verlust'

export type LadeAusgang =
  | { art: 'ok'; baum: BaumErgebnis }
  // Heil, aber eine Schemastufe lief: der Stand muss unter der neuen Version
  // neu gespeichert werden.
  | { art: 'migriert'; baum: BaumErgebnis }
  | { art: 'abgelehnt'; ursache: AblehnGrund; probleme: LadeProblem[] }

export function pruefeBaumStand(
  roh: { schemaVersion: number; tree?: unknown; blocks?: unknown; selectedId?: unknown },
): LadeAusgang {
  if (roh.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return {
      art: 'abgelehnt',
      ursache: 'zukunft',
      probleme: [{
        bereich: BEREICH_AUFBAU,
        stelle: '',
        grund: `gespeichert unter Aufbau-Version ${roh.schemaVersion}, `
          + `dieser Editor kennt ${CURRENT_SCHEMA_VERSION}`,
      }],
    }
  }

  const baum = baumAusRohdaten(roh, roh.schemaVersion < DEMO_CLEANUP_BEFORE_SCHEMA)
  if (!baum) return { art: 'abgelehnt', ursache: 'unlesbar', probleme: [] }

  const probleme: LadeProblem[] = []
  if (roh.tree && typeof roh.tree === 'object') {
    const rohBaum = roh.tree as Record<string, unknown>
    probleme.push(...strukturProbleme(rohBaum), ...verlustProbleme(rohBaum, baum))
  }

  probleme.push(...topologieProbleme(baum.tree))
  if (probleme.length > 0) return { art: 'abgelehnt', ursache: 'verlust', probleme }

  return { art: baum.schemaAdvanced ? 'migriert' : 'ok', baum }
}
