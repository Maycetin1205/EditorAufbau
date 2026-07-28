// persistence — Laden, Verteidigen, Retten und Speichern des Editor-Stands.
// Verhaltensgleich herausgezogen aus Editor.ts.
// Hier wohnt der komplette Lade-Weg (sanitize + Migrationen + Notfallkopie)
// und der Speicher-Rumpf; der Store ruft nur noch loadFromStorage/persistState.

import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { sanitizeBlockEvents } from '../core/data/aktionen'
import {
  CURRENT_SCHEMA_VERSION,
  migrateFlatBlocks,
  migrateFlowToRaster,
  migrateKanbanVorlage,
  migrateRasterBreitenReparatur,
  migrateRasterHoehenReset,
  migrateRootKanbanToViewportFill,
  putzeAlteKartenDemos,
} from './migrations'
import {
  backupKeyFor,
  meldeSpeicherPanne,
  merkeSpeicherErfolg,
  sichereUnlesbaren,
} from './notfallkopie'
import { createEmptyTree, normalizeProps } from './treeOps'

export const STORAGE_KEY = 'aufbau_editor_mvp_v1'
// Notfallkopie eines UNLESBAREN Speicherstands: getrennter Schlüssel,
// den der Autosave (STORAGE_KEY) nie anfasst — die beschädigten Rohdaten
// bleiben damit erhalten, auch nachdem der Editor leer weiterläuft und beim
// ersten Speichern den kaputten STORAGE_KEY überschreibt.
export const BACKUP_KEY = backupKeyFor(STORAGE_KEY)
export const SAVE_DEBOUNCE_MS = 500

interface PersistedState {
  schemaVersion: number
  tree: BlockTree
  selectedId: string | null
}

export interface LoadedState {
  tree: BlockTree
  selectedId: string | null
  migrated: boolean
}

// Baut aus rohen (evtl. kaputten) Daten einen sauberen Baum: läuft von der
// Wurzel über childIds, übernimmt nur Knoten mit bekanntem Typ, normalisiert
// Props, repariert parentId und verwirft Waisen/Zyklen.
// onDropType: meldet jeden verworfenen UNBEKANNTEN Typ (z. B. die 2026-07-14
// abgeschafften Bausteine Text/Bereich/Infobox/Chip/Eingabefeld in alten
// Speicherständen) — Nutzer-Regel: Verluste beim Laden passieren NIE still.
export function sanitizeTree(
  raw: Record<string, unknown>,
  onDropType?: (type: string) => void,
): BlockTree {
  const tree = createEmptyTree()
  const src = raw as Record<string, { type?: unknown; props?: unknown; childIds?: unknown; events?: unknown }>
  migrateKanbanVorlage(src)

  const addChild = (parentId: string, childId: unknown): void => {
    if (typeof childId !== 'string' || tree[childId]) return
    const node = src[childId]
    if (!node || typeof node !== 'object') return
    if (typeof node.type !== 'string') return
    const def = getBlockDefinition(node.type)
    if (!def) {
      onDropType?.(node.type)
      // Kinder eines unbekannten Typs werden zum Eltern-Knoten HOCHGEZOGEN
      // statt still mitzuverschwinden (z. B. der Inhalt eines abgeschafften
      // "Bereich"): der unbekannte Rahmen fällt, der Inhalt bleibt an
      // seiner Position im Fluss.
      const kids = Array.isArray(node.childIds) ? node.childIds : []
      for (const k of kids) addChild(parentId, k)
      return
    }
    // Aktionsketten laufen durch den eigenen strengen Lader — nur
    // Ereignis-Keys, die der Typ in der Registry deklariert.
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
  putzeAlteKartenDemos(tree)
  return tree
}

// Einen UNLESBAREN Speicherstand behandeln (U1, Nutzer-Regel „Verluste
// passieren nie still"). Die Mechanik selbst wohnt seit 2026-07-27 in
// `notfallkopie.ts` — dieselbe Stelle bedient auch die drei Bibliotheken.
function backupUnreadableState(raw: string): void {
  sichereUnlesbaren(STORAGE_KEY, raw, 'Editor-Stand')
}

export function loadFromStorage(): LoadedState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: unknown
      tree?: unknown
      blocks?: unknown
      selectedId?: unknown
    }

    let tree: BlockTree | null = null
    // Verworfene unbekannte Typen sammeln und MELDEN (nie still): trifft
    // v. a. die 2026-07-14 abgeschafften Bausteine in alten Speicherständen.
    const verworfen = new Map<string, number>()
    if (parsed.tree && typeof parsed.tree === 'object') {
      tree = sanitizeTree(parsed.tree as Record<string, unknown>, (type) => {
        verworfen.set(type, (verworfen.get(type) ?? 0) + 1)
      })
    } else if (Array.isArray(parsed.blocks)) {
      tree = migrateFlatBlocks(parsed.blocks)
    }
    if (!tree) {
      // Gültiges JSON, aber KEINE verwertbare Baum-/Block-Struktur (fremder
      // oder halb-kaputter Inhalt, in dem echte Arbeit stecken könnte): wie
      // einen Lesefehler behandeln — sichern + melden, nicht still leer starten.
      backupUnreadableState(raw)
      return null
    }
    // Gestufte Migrationen: jede läuft nur beim Aufstieg über IHRE
    // Schwellenversion, damit ein schon migrierter Stand nicht erneut
    // umgeschrieben wird (z. B. bewusst gesetzte Kanban-Pixelhöhen aus Schema 2
    // rührt die 1→2-Migration nicht mehr an).
    const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
    let migrated = false
    if (schemaVersion < 2) migrated = migrateRootKanbanToViewportFill(tree) || migrated
    if (schemaVersion < 3) migrated = migrateFlowToRaster(tree) || migrated
    // Schema 4: heilt die Riesen-Rahmen aus der ersten (kaputten) Raster-
    // Migration bei Nutzern, deren Speicher schon auf Schema 3 stand.
    if (schemaVersion < 4) migrated = migrateRasterBreitenReparatur(tree) || migrated
    // Schema 5: setzt zu grosse Alt-Starthoehen (aus der ersten Raster-
    // Migration) auf die neuen, engen Registry-Starthoehen zurueck — jetzt, wo
    // der Baustein seine Zelle fuellt, liegt der Rahmen damit eng am Inhalt.
    if (schemaVersion < 5) migrated = migrateRasterHoehenReset(tree) || migrated
    if (verworfen.size > 0 && typeof alert === 'function') {
      const anzahl = [...verworfen.values()].reduce((a, b) => a + b, 0)
      const typen = [...verworfen.keys()].map((t) => `"${t}"`).join(', ')
      alert(
        `Beim Laden entfernt: ${anzahl} Baustein(e) der nicht mehr vorhandenen Typen ${typen}.\n`
        + 'Diese Bausteintypen gibt es im Editor nicht mehr. Ihr Inhalt wurde — '
        + 'falls vorhanden — an ihrer Stelle eingegliedert; der Rest der Maske ist unverändert.',
      )
    }

    const selectedId =
      typeof parsed.selectedId === 'string' && tree[parsed.selectedId] && parsed.selectedId !== ROOT_ID
        ? parsed.selectedId
        : null
    return { tree, selectedId, migrated }
  } catch (error) {
    // Unlesbarer Stand (kaputtes JSON, unerwarteter Fehler beim Aufbau):
    // NIE still leer starten und NIE vom Autosave überschreiben lassen —
    // Rohdaten sichern, dann melden.
    console.error('Editor: gespeicherter Stand nicht lesbar', error)
    backupUnreadableState(raw)
    return null
  }
}

// Speicher-Rumpf des Autosave (der Store entprellt; hier wird geschrieben).
export function persistState(tree: BlockTree, selectedId: string | null): void {
  try {
    const state: PersistedState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tree,
      selectedId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    merkeSpeicherErfolg(STORAGE_KEY)
  } catch (err) {
    meldeSpeicherPanne(STORAGE_KEY, 'Maske', err)
  }
}
