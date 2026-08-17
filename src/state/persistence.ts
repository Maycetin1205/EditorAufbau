import { type BlockTree } from '../core/blocks/BlockData'
import { baumAusRohdaten } from './ladeKette'
import { meldungen } from './meldungen'
import { CURRENT_SCHEMA_VERSION, DEMO_CLEANUP_BEFORE_SCHEMA } from './migrations'
import {
  backupKeyFor,
  meldeSpeicherPanne,
  merkeSpeicherErfolg,
  sichereUnlesbaren,
} from './notfallkopie'

export const STORAGE_KEY = 'aufbau_editor_mvp_v1'

export const BACKUP_KEY = backupKeyFor(STORAGE_KEY)
export const SAVE_DEBOUNCE_MS = 500

try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('aufbau_editor_verknuepfungen_v1')
    localStorage.removeItem(backupKeyFor('aufbau_editor_verknuepfungen_v1'))
  }
} catch {
  // Speicher gesperrt — dann bleibt der tote Schlüssel eben liegen.
}

interface PersistedState {
  schemaVersion: number
  tree: BlockTree
  selectedId: string | null
}

export interface LoadedState {
  tree: BlockTree
  selectedId: string | null

  resaveNeeded: boolean
}

function backupUnreadableState(raw: string): void {
  sichereUnlesbaren(STORAGE_KEY, raw, 'Editor-Stand')
}

export function meldeVerworfeneTypen(verworfen: Map<string, number>): void {
  if (verworfen.size === 0) return
  const anzahl = [...verworfen.values()].reduce((a, b) => a + b, 0)
  const typen = [...verworfen.keys()].map((t) => `"${t}"`).join(', ')
  meldungen.melde(
    `Beim Laden entfernt: ${anzahl} Baustein(e) der nicht mehr vorhandenen Typen ${typen}.\n`
    + 'Diese Bausteintypen gibt es im Editor nicht mehr. Ihr Inhalt wurde — '
    + 'falls vorhanden — an ihrer Stelle eingegliedert; der Rest der Maske ist unverändert.',
  )
}

export function loadFromStorage(): LoadedState | null {
  let raw: string | null = null
  try {
    if (typeof localStorage !== 'undefined') raw = localStorage.getItem(STORAGE_KEY)
  } catch (err) {
    console.warn('Browser-Speicher nicht lesbar — der Editor startet leer.', err)
    return null
  }
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: unknown
      tree?: unknown
      blocks?: unknown
      selectedId?: unknown
    }

    const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
    const baum = baumAusRohdaten(
      { ...parsed, schemaVersion },
      schemaVersion < DEMO_CLEANUP_BEFORE_SCHEMA,
    )
    if (!baum) {
      backupUnreadableState(raw)
      return null
    }
    meldeVerworfeneTypen(baum.verworfen)
    return {
      tree: baum.tree,
      selectedId: baum.selectedId,
      resaveNeeded: baum.schemaAdvanced,
    }
  } catch (error) {
    console.error('Editor: gespeicherter Stand nicht lesbar', error)
    backupUnreadableState(raw)
    return null
  }
}

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
