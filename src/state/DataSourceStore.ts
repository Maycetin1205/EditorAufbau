// DataSourceStore
// Datenquellen-Vorlagen sind BENUTZERDEFINIERT — Felder sind je
// SoftEngine-Installation individuell. Dieser Store ist die gelebte Wahrheit
// der Vorlagen-Bibliothek: persistiert in localStorage NEBEN den Bäumen
// (Muster: Editor.ts — Subject + sanitize beim Laden + entprelltes Speichern).
//
// Ein frischer Browser startet LEER (Nutzer-Entscheidung 2026-07-30). Bis
// dahin wurden zwei mitgelieferte Quellen eingespielt (Terminplaner
// IDBID0001, Kundenhaustiere IDBID0004) — die Wahrheit einer einzigen
// Installation, festgeschrieben im Code, s. dataSources.ts. Bestehende
// Bibliotheken sind davon unberührt: was im Speicher liegt, wird geladen.
//
// Bewusst KEIN Undo/Redo: die Bibliothek ist kein Canvas-Gestenraum; vor
// destruktiven Aktionen fragt die UI nach (wie das Kreuzchen).

import { sanitizeDataSources, type DataSource } from '../core/data/dataSources'
import { deepClone } from '../lib/deepClone'
import { meldeSpeicherPanne, merkeSpeicherErfolg, sichereUnlesbaren } from './notfallkopie'
import { Subject } from './Subject'

const STORAGE_KEY = 'aufbau_editor_datenquellen_v1'
const SAVE_DEBOUNCE_MS = 500

// null = noch nie gespeichert (→ leere Bibliothek); sonst die sanitierte
// Liste (auch wenn leer — der Bediener hat dann alles gelöscht).
//
// Ein BESCHÄDIGTER Stand endet in derselben leeren Liste, ist aber etwas
// anderes: bis 2026-07-27 fielen beide still auf die mitgelieferten Vorlagen
// zurück, die echten Datenquellen des Bedieners waren damit wortlos weg.
// Darum wird ein unlesbarer Stand gesichert und GEMELDET, statt nur ersetzt
// (Regel „nichts scheitert still").
function loadFromStorage(): DataSource[] | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { sources?: unknown }
    // Gültiges JSON, aber keine Liste, wo eine stehen muss: fremder oder
    // halb-kaputter Inhalt — wie einen Lesefehler behandeln.
    if (!Array.isArray(parsed?.sources)) {
      sichereUnlesbaren(STORAGE_KEY, raw, 'Datenquellen')
      return null
    }
    return sanitizeDataSources(parsed.sources)
  } catch {
    sichereUnlesbaren(STORAGE_KEY, raw, 'Datenquellen')
    return null
  }
}

export class DataSourceStore extends Subject<DataSourceStore> {
  private _sources: DataSource[]
  private _version = 0
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false

  constructor() {
    super()
    this._sources = loadFromStorage() ?? []
    this._hydrated = true
  }

  get list(): readonly DataSource[] { return this._sources }
  get version(): number { return this._version }

  get(id: string): DataSource | undefined {
    return this._sources.find((s) => s.id === id)
  }

  override notify(data: DataSourceStore): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  // Neue Vorlage mit frischem, stabilem Technikwert (Blöcke referenzieren
  // die id in ihrer source-Prop — sie ändert sich nie wieder).
  add(data: Omit<DataSource, 'id'>): DataSource {
    const source: DataSource = { ...deepClone(data), id: crypto.randomUUID() }
    this._sources = [...this._sources, source]
    this.notify(this)
    return source
  }

  // Bearbeiten ersetzt alles AUSSER der id (angehängte Blöcke behalten
  // ihre Quelle). Unbekannte id = kein Effekt.
  update(id: string, data: Omit<DataSource, 'id'>): void {
    const at = this._sources.findIndex((s) => s.id === id)
    if (at < 0) return
    const next = [...this._sources]
    next[at] = { ...deepClone(data), id }
    this._sources = next
    this.notify(this)
  }

  // Die GANZE Bibliothek ersetzen — nur fuer das Laden einer Maskendatei
  // (2026-07-28). Ersetzen statt Zusammenfuehren: eine Maskendatei ist ein
  // vollstaendiger Stand, und Zusammenfuehren braeuchte Konfliktregeln
  // (gleiche id, anderer Inhalt — wer gewinnt?), die niemand angefordert
  // hat (Regel 10). Die Datei ist beim Auspacken bereits vollstaendig
  // geprueft; hier wird nicht noch einmal bereinigt.
  ersetzeAlle(sources: readonly DataSource[]): void {
    this._sources = deepClone(sources) as DataSource[]
    this.notify(this)
  }

  remove(id: string): void {
    const next = this._sources.filter((s) => s.id !== id)
    if (next.length === this._sources.length) return
    this._sources = next
    this.notify(this)
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sources: this._sources }))
        merkeSpeicherErfolg(STORAGE_KEY)
      } catch (err) {
        meldeSpeicherPanne(STORAGE_KEY, 'Datenquellen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }
}

export const dataSourceStore = new DataSourceStore()
