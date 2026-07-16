// persistence (U4, inkl. U1-Notfallkopie)
// Speichern/Laden des Editor-Stands in localStorage. Das Laden verteidigt
// sich (sanitizeTree), meldet Verluste in Klartext (nie still) und sichert
// unlesbare Stände als Notfallkopie unter eigenem Schlüssel (U1).

import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { sanitizeBlockEvents } from '../core/data/aktionen'
import {
  migrateFlatBlocks,
  migrateKanbanVorlage,
  migrateRootKanbanToViewportFill,
} from './migrations'
import { createEmptyTree, normalizeProps } from './treeOps'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'
// Notfallkopie eines UNLESBAREN Speicherstands (U1): getrennter Schlüssel,
// den der Autosave (STORAGE_KEY) nie anfasst — die beschädigten Rohdaten
// bleiben damit erhalten, auch nachdem der Editor leer weiterläuft und beim
// ersten Speichern den kaputten STORAGE_KEY überschreibt.
export const BACKUP_KEY = 'aufbau_editor_mvp_v1__notfallkopie'
const CURRENT_SCHEMA_VERSION = 2
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
function sanitizeTree(
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
    // Aktionsketten (Z2) laufen durch den eigenen strengen Lader — nur
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
  return tree
}

// Einen UNLESBAREN Speicherstand behandeln (U1, Nutzer-Regel „Verluste
// passieren nie still"): die Rohdaten ZUERST als Notfallkopie sichern (nur
// falls dort noch keine liegt — die früheste, wertvollste Kopie bleibt), dann
// Klartext melden. Der Editor startet danach leer weiter; die Kopie überlebt,
// weil sie unter einem eigenen Schlüssel liegt (Autosave rührt sie nie an).
function backupUnreadableState(raw: string): void {
  try {
    if (localStorage.getItem(BACKUP_KEY) === null) {
      localStorage.setItem(BACKUP_KEY, raw)
    }
  } catch { /* Das Sichern selbst darf nie zusätzlich Schaden anrichten. */ }
  if (typeof alert === 'function') {
    alert(
      'Der gespeicherte Editor-Stand war beschädigt und konnte nicht gelesen '
      + 'werden.\nEr wurde NICHT gelöscht, sondern als Notfallkopie gesichert '
      + `(Schlüssel „${BACKUP_KEY}" im Browser-Speicher).\n`
      + 'Der Editor startet vorerst leer; die Kopie bleibt erhalten, bis sie '
      + 'gerettet oder bewusst entfernt wird.',
    )
  }
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
    const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
    const migrated = schemaVersion < CURRENT_SCHEMA_VERSION
      ? migrateRootKanbanToViewportFill(tree)
      : false
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

export function saveToStorage(tree: BlockTree, selectedId: string | null): void {
  try {
    const state: PersistedState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tree,
      selectedId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Editor: localStorage-Speichern fehlgeschlagen', err)
  }
}
