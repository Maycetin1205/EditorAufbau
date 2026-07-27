// SourceLinkStore
// Die gelebte Wahrheit der VERKNUEPFUNGEN zwischen Datenquellen: welche
// Quelle haengt ueber welche Felder mit welcher zusammen. Persistiert in
// localStorage NEBEN den Baeumen, Datenquellen und Relationen — gleiche
// Bauart wie DataSourceStore und RelationStore, damit niemand eine dritte
// Bedienlogik lernen muss (Muster: RelationStore).
//
// KEIN Startbestand: Verknuepfungen sind vollstaendig installationsabhaengig
// (welche Quellen es gibt, welche Feldcodes passen). Etwas mitzuliefern
// waere Raten — und geratene SE-Kontrakte sind genau das, was Regel 5
// verbietet. Es beginnt leer, der Bediener legt an, was er braucht.
//
// Bewusst KEIN Undo/Redo: die Bibliothek ist kein Canvas-Gestenraum; vor
// destruktiven Aktionen fragt die UI nach (wie das Kreuzchen).

import { sanitizeSourceLinks, type SourceLink } from '../core/data/sourceLinks'
import { deepClone } from '../lib/deepClone'
import { Subject } from './Subject'

const STORAGE_KEY = 'aufbau_editor_verknuepfungen_v1'
const SAVE_DEBOUNCE_MS = 500

// Leere Liste, wenn nichts (oder Kaputtes) gespeichert ist — anders als bei
// den Relationen gibt es hier keinen Startbestand, also auch keinen
// Unterschied zwischen „noch nie gespeichert" und „alles geloescht".
function loadFromStorage(): SourceLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { links?: unknown }
    return sanitizeSourceLinks(parsed.links)
  } catch {
    return []
  }
}

export class SourceLinkStore extends Subject<SourceLinkStore> {
  private _links: SourceLink[]
  private _version = 0
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false

  constructor() {
    super()
    this._links = loadFromStorage()
    this._hydrated = true
  }

  get list(): readonly SourceLink[] { return this._links }
  get version(): number { return this._version }

  get(id: string): SourceLink | undefined {
    return this._links.find((l) => l.id === id)
  }

  override notify(data: SourceLinkStore): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  // Neue Verknuepfung mit frischem, stabilem Technikwert.
  add(data: Omit<SourceLink, 'id'>): SourceLink {
    const link: SourceLink = { ...deepClone(data), id: crypto.randomUUID() }
    this._links = [...this._links, link]
    this.notify(this)
    return link
  }

  // Bearbeiten ersetzt alles AUSSER der id. Unbekannte id = kein Effekt.
  update(id: string, data: Omit<SourceLink, 'id'>): void {
    const at = this._links.findIndex((l) => l.id === id)
    if (at < 0) return
    const next = [...this._links]
    next[at] = { ...deepClone(data), id }
    this._links = next
    this.notify(this)
  }

  remove(id: string): void {
    const next = this._links.filter((l) => l.id !== id)
    if (next.length === this._links.length) return
    this._links = next
    this.notify(this)
  }

  // Alle Verknuepfungen, die eine bestimmte Quelle betreffen — fuer die
  // Warnung beim Loeschen einer Datenquelle („daran haengen 2
  // Verknuepfungen"). Loeschen bleibt Sache des Bedieners; der Editor
  // raeumt nichts ungefragt weg.
  fuerQuelle(sourceId: string): readonly SourceLink[] {
    if (sourceId === '') return []
    return this._links.filter((l) => l.fromSourceId === sourceId || l.toSourceId === sourceId)
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ links: this._links }))
      } catch (err) {
        console.warn('SourceLinkStore: localStorage-Speichern fehlgeschlagen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }
}

export const sourceLinkStore = new SourceLinkStore()
