// persistence — Laden, Verteidigen, Retten und Speichern des Editor-Stands.
// Verhaltensgleich herausgezogen aus Editor.ts.
// Hier wohnt der BROWSER-Weg (lesen, Notfallkopie, schreiben); die eigentliche
// Lade-Kette (Migrationen, Bereinigen, Verlust-Pruefungen) wohnt seit
// 2026-08-10 in `ladeKette.ts` — sie teilen der Browser-Speicher und die
// Maskendatei. Der Store ruft nur noch loadFromStorage/persistState.

import { type BlockTree } from '../core/blocks/BlockData'
import { pruefeBaumStand, ZUKUNFT_GRUND, type LadeProblem } from './ladeKette'
import { CURRENT_SCHEMA_VERSION } from './migrations'
import {
  backupKeyFor,
  meldeSpeicherPanne,
  merkeSpeicherErfolg,
  sichereQuarantaene,
  sichereUnlesbaren,
} from './notfallkopie'
import { speicherGate } from './speicherGate'

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

// Der Satz fuer einen Stand, bei dem beim Laden etwas verlorengegangen waere
// (A4 schaltet diesen Weg ein).
const VERLUST_GRUND =
  'Beim Laden dieses Standes wären Teile verlorengegangen. Er wurde deshalb '
  + 'unter Quarantäne gestellt und NICHT geöffnet.'

// Einen lesbaren, aber unantastbaren Stand unter Quarantaene stellen (A3):
//   1. Rohdaten unveraendert mit Zeitstempel sichern (die Kopie fasst nie
//      wieder jemand an);
//   2. den Riegel vorlegen — ab hier schreibt KEIN Speicherweg mehr, auch
//      nicht die zwei Bibliotheken;
//   3. nichts hydrieren: der Aufrufer bekommt null und der Editor startet
//      leer, waehrend die Oberflaeche die Sperransicht zeigt.
// Der ORIGINAL-Schluessel bleibt dabei unangetastet. Er wird erst
// ueberschrieben, wenn der Bediener in der Sperransicht ausdruecklich einen
// anderen Weg waehlt — dafuer gibt es die Kopie aus Schritt 1.
function stelleUnterQuarantaene(
  raw: string,
  grund: string,
  probleme: readonly LadeProblem[],
): void {
  const kopieSchluessel = sichereQuarantaene(STORAGE_KEY, raw, new Date().toISOString())
  speicherGate.sperre({ grund, probleme, kopieSchluessel, rohdaten: raw })
}

// Der EINZIGE Weg, der etwas wegwirft — und nur nach ausdruecklicher
// Bestaetigung in der Sperransicht („verwerfen und leer beginnen").
// Entfernt GENAU den Autosave-Schluessel des Baums. Notfallkopie,
// Quarantaene-Kopien und die zwei Bibliotheken bleiben unangetastet: was
// nicht unter Quarantaene stand, wird auch nicht mit weggeraeumt.
export function verwerfeLokalenStand(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('Der lokale Stand konnte nicht entfernt werden.', err)
  }
  speicherGate.entsperre()
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

    // Eine fehlende Versionsangabe gilt weiter als 1 (Altbestand aus der Zeit
    // vor der Zaehlung) — anders als am Datei-Weg, der sie VERLANGT. Ein
    // gewachsener Browser-Speicher ist kein Dateiformat.
    // Alles andere entscheidet die geteilte Kette: Zukunft abweisen,
    // migrieren + bereinigen (Demotext-Putzer nur fuer alte Staende, feste
    // historische Grenze aus A2), dann pruefen.
    const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
    const stand = pruefeBaumStand(
      { ...parsed, schemaVersion },
      // A3 baut den Riegel; ob ein TEILVERLUST im Browser sperrt, entscheidet
      // A4. Bis dahin duennt der Browser-Weg aus wie seit 2026-07-02.
      { verlustPruefen: false },
    )
    if (stand.art === 'quarantaene') {
      if (stand.ursache === 'unlesbar') {
        // Gültiges JSON, aber KEINE verwertbare Baum-/Block-Struktur (fremder
        // oder halb-kaputter Inhalt, in dem echte Arbeit stecken könnte): wie
        // einen Lesefehler behandeln — sichern + melden, nicht still leer starten.
        backupUnreadableState(raw)
        return null
      }
      stelleUnterQuarantaene(raw, stand.ursache === 'zukunft' ? ZUKUNFT_GRUND : VERLUST_GRUND, stand.probleme)
      return null
    }
    meldeVerworfeneTypen(stand.baum.verworfen)
    return {
      tree: stand.baum.tree,
      selectedId: stand.baum.selectedId,
      resaveNeeded: stand.art === 'migriert',
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
  // Der Riegel aus A3: steht der geladene Stand unter Quarantaene, schreibt
  // hier NICHTS mehr — kein Timer, kein pagehide, kein Klick. Sonst haette
  // die alte App den neueren Stand 500 ms nach dem Start ueberschrieben.
  if (!speicherGate.darfSchreiben()) return
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
