// RelationStore
// Relation-Vorlagen sind BENUTZERDEFINIERT — GET/PUT-Relations
// sind je SoftEngine-Installation individuell (>1000 möglich). Dieser Store
// ist die gelebte Wahrheit der Vorlagen-Bibliothek: persistiert in
// localStorage NEBEN den Bäumen und Datenquellen (Muster: DataSourceStore).
// Beim allerersten Start wird der mitgelieferte Startbestand
// (BUILTIN_RELATION_TEMPLATES = der Standard-PUT) eingespielt; danach gehören
// die Vorlagen dem Bediener (auch Löschen der mitgelieferten überlebt den
// Reload — es wird nie ungefragt neu eingespielt).
//
// Bewusst KEIN Undo/Redo: die Bibliothek ist kein Canvas-Gestenraum; vor
// destruktiven Aktionen fragt die UI nach (wie das Kreuzchen).

import {
  BUILTIN_RELATION_TEMPLATES,
  sanitizeRelationTemplates,
  type RelationTemplate,
} from '../core/data/relations'
import { deepClone } from '../lib/deepClone'
import { meldeSpeicherPanne, merkeSpeicherErfolg, sichereUnlesbaren } from './notfallkopie'
import { Subject } from './Subject'

const STORAGE_KEY = 'aufbau_editor_relationen_v1'
const SAVE_DEBOUNCE_MS = 500

// null = noch nie gespeichert (→ Seed); sonst die sanitierte Liste
// (auch wenn leer — der Bediener hat dann alles gelöscht).
//
// Beschädigt ≠ nie gespeichert: bis 2026-07-27 wurden die echten Vorlagen
// bei kaputtem JSON still durch die mitgelieferten ersetzt. Siehe
// `notfallkopie.ts` (dieselbe Behandlung wie beim Block-Baum).
function loadFromStorage(): RelationTemplate[] | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { relations?: unknown }
    if (!Array.isArray(parsed?.relations)) {
      sichereUnlesbaren(STORAGE_KEY, raw, 'Relations-Vorlagen')
      return null
    }
    return sanitizeRelationTemplates(parsed.relations)
  } catch {
    sichereUnlesbaren(STORAGE_KEY, raw, 'Relations-Vorlagen')
    return null
  }
}

export class RelationStore extends Subject<RelationStore> {
  private _relations: RelationTemplate[]
  private _version = 0
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false

  constructor() {
    super()
    this._relations = loadFromStorage() ?? deepClone(BUILTIN_RELATION_TEMPLATES) as RelationTemplate[]
    this._hydrated = true
  }

  get list(): readonly RelationTemplate[] { return this._relations }
  get version(): number { return this._version }

  get(id: string): RelationTemplate | undefined {
    return this._relations.find((r) => r.id === id)
  }

  override notify(data: RelationStore): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  // Neue Vorlage mit frischem, stabilem Technikwert (Konsumenten wie das
  // Kanban referenzieren die id — sie ändert sich nie wieder).
  add(data: Omit<RelationTemplate, 'id'>): RelationTemplate {
    const relation: RelationTemplate = { ...deepClone(data), id: crypto.randomUUID() }
    this._relations = [...this._relations, relation]
    this.notify(this)
    return relation
  }

  // Bearbeiten ersetzt alles AUSSER der id (Konsumenten behalten ihre
  // Vorlage). Unbekannte id = kein Effekt.
  update(id: string, data: Omit<RelationTemplate, 'id'>): void {
    const at = this._relations.findIndex((r) => r.id === id)
    if (at < 0) return
    const next = [...this._relations]
    next[at] = { ...deepClone(data), id }
    this._relations = next
    this.notify(this)
  }

  remove(id: string): void {
    const next = this._relations.filter((r) => r.id !== id)
    if (next.length === this._relations.length) return
    this._relations = next
    this.notify(this)
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ relations: this._relations }))
        merkeSpeicherErfolg(STORAGE_KEY)
      } catch (err) {
        meldeSpeicherPanne(STORAGE_KEY, 'Relationen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }
}

export const relationStore = new RelationStore()
