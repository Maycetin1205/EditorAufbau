// persistence — Laden, Verteidigen, Retten und Speichern des Editor-Stands.
// Verhaltensgleich herausgezogen aus Editor.ts.
// Hier wohnt der BROWSER-Weg (lesen, Notfallkopie, schreiben); die eigentliche
// Lade-Kette (Migrationen, Bereinigen, Verlust-Pruefungen) wohnt seit
// 2026-08-10 in `ladeKette.ts` — sie teilen der Browser-Speicher und die
// Maskendatei. Der Store ruft nur noch loadFromStorage/persistState.

import { type BlockTree } from '../core/blocks/BlockData'
import { baumAusRohdaten } from './ladeKette'
import {
  CURRENT_SCHEMA_VERSION,
  DEMO_CLEANUP_BEFORE_SCHEMA,
} from './migrations'
import {
  backupKeyFor,
  meldeSpeicherPanne,
  merkeSpeicherErfolg,
  sichereUnlesbaren,
} from './notfallkopie'

export const STORAGE_KEY = 'aufbau_editor_mvp_v1'
// Notfallkopie eines UNLESBAREN Speicherstands: getrennter Schlüssel,
// den der Autosave (STORAGE_KEY) nie anfasst — die beschädigten Rohdaten
// bleiben damit erhalten, auch nachdem der Editor leer weiterläuft und beim
// ersten Speichern den kaputten STORAGE_KEY überschreibt.
export const BACKUP_KEY = backupKeyFor(STORAGE_KEY)
export const SAVE_DEBOUNCE_MS = 500

// Aufräumen hinter dem entfernten SourceLinkStore (Verknüpfungs-Bibliothek,
// raus am 2026-07-30): sein Speicherstand läge sonst für immer in jedem
// Browser, der den Editor je geöffnet hat — samt möglicher Notfallkopie.
// Löschen ist hier KEIN stiller Verlust: der Bestand hat nie etwas bewirkt
// (kein Produktivcode las ihn), und die Schlüsselregel lebt längst in den
// Block-Props (`weitereQuellen`), die der Baum selbst trägt.
// typeof-Wache: dieses Modul läuft auch in Umgebungen ohne localStorage.
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
  // Der geladene Stand muss unter der aktuellen Version neu gespeichert
  // werden. Hiess bis A2.1 `migrated` — ein Name, der beschrieb, was PASSIERT
  // war, statt was zu TUN ist; genau diese Unschaerfe hat der Datei-Weg
  // geerbt. Gespeist wird er heute allein aus `schemaAdvanced`; ein zweiter
  // Grund zum Neuspeichern existiert noch nicht (Regel 10).
  resaveNeeded: boolean
}

// Einen UNLESBAREN Speicherstand behandeln (U1, Nutzer-Regel „Verluste
// passieren nie still"). Die Mechanik selbst wohnt seit 2026-07-27 in
// `notfallkopie.ts` — dieselbe Stelle bedient auch die drei Bibliotheken.
function backupUnreadableState(raw: string): void {
  sichereUnlesbaren(STORAGE_KEY, raw, 'Editor-Stand')
}

// Meldung ueber verworfene Bausteintypen — dieselbe fuer beide Leser.
export function meldeVerworfeneTypen(verworfen: Map<string, number>): void {
  if (verworfen.size === 0 || typeof alert !== 'function') return
  const anzahl = [...verworfen.values()].reduce((a, b) => a + b, 0)
  const typen = [...verworfen.keys()].map((t) => `"${t}"`).join(', ')
  alert(
    `Beim Laden entfernt: ${anzahl} Baustein(e) der nicht mehr vorhandenen Typen ${typen}.\n`
    + 'Diese Bausteintypen gibt es im Editor nicht mehr. Ihr Inhalt wurde — '
    + 'falls vorhanden — an ihrer Stelle eingegliedert; der Rest der Maske ist unverändert.',
  )
}

export function loadFromStorage(): LoadedState | null {
  // Gleiche Schutzform wie oben beim Aufraeumen: in Umgebungen ohne
  // localStorage (Node-Tests) und bei gesperrtem Speicher (Privatmodus,
  // blockierte Cookies) WIRFT schon der Zugriff. Ohne diese Wache riss der
  // Fehler den ganzen Editor-Start mit — weisse Seite, keine Meldung.
  // Behandelt wie "nichts gespeichert"; ein console.warn statt eines
  // Alerts, denn ungespeichert ist noch nichts verloren.
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

    // Der Karten-Demotext-Putzer laeuft nur fuer ALTE Staende — GENAU dieselbe
    // Regel wie am Datei-Weg (maskenDatei.auspacken). Bis 2026-08-06 lief er
    // hier fuer JEDEN Stand, weil der Default `putzeDemos = true` griff: tippte
    // der Bediener „Heute" in den Chip oder „09:15" ins Zeitfeld einer Karte
    // (beides echte Werte), war der Wert nach dem naechsten Laden still weg —
    // und der Autosave schrieb den Verlust sofort fest. Der Fix vom 2026-07-28
    // hatte nur den Datei-Weg erreicht.
    // Die Grenze ist seit A2 die feste historische Zahl statt
    // CURRENT_SCHEMA_VERSION: „aelter als aktuell" haette denselben Verlust
    // beim naechsten Versionssprung von selbst wieder aufgemacht.
    const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
    const ergebnis = baumAusRohdaten(parsed, schemaVersion < DEMO_CLEANUP_BEFORE_SCHEMA)
    if (!ergebnis) {
      // Gültiges JSON, aber KEINE verwertbare Baum-/Block-Struktur (fremder
      // oder halb-kaputter Inhalt, in dem echte Arbeit stecken könnte): wie
      // einen Lesefehler behandeln — sichern + melden, nicht still leer starten.
      backupUnreadableState(raw)
      return null
    }
    meldeVerworfeneTypen(ergebnis.verworfen)
    return {
      tree: ergebnis.tree,
      selectedId: ergebnis.selectedId,
      resaveNeeded: ergebnis.schemaAdvanced,
    }
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
