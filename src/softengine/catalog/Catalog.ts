// Catalog
// Singleton-Klasse mit konsolidierten Datenquellen + Relations.
// Erbt von Subject (Observer-Pattern).
// Persistiert auf localStorage debounced bei jeder Aenderung.

import { Subject } from '../../state/Subject'
import type { ParsedIdb } from './parseIdbXml'
import { generateRelationSyntax, parseRelationSyntax } from './relationSyntax'
import type {
  CatalogState,
  DataSourceEntry,
  RelationDefinition,
  SourceType,
} from './types'
import { getAliasPrefix, getDefaultSourceId, getFeldVorschlaege } from './vorschlaege'

const STORAGE_KEY = 'aufbau_catalog_v3'
const SAVE_DEBOUNCE_MS = 800

function nextId(prefix: string, existing: { id?: string }[]): string {
  const used = new Set(existing.map((e) => e.id))
  let n = 1
  while (used.has(`${prefix}_${n}`)) n++
  return `${prefix}_${n}`
}

function nextAlias(prefix: string, existing: { alias?: string; name?: string }[]): string {
  const used = new Set(existing.map((e) => e.alias ?? e.name))
  let n = 1
  while (used.has(`${prefix}${n}`)) n++
  return `${prefix}${n}`
}

function loadFromStorage(): CatalogState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CatalogState>
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      relations: Array.isArray(parsed.relations) ? parsed.relations : [],
    }
  } catch {
    return null
  }
}

export class Catalog extends Subject<Catalog> {
  private _entries: DataSourceEntry[] = []
  private _relations: RelationDefinition[] = []
  private _version = 0
  private _saveTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    super()
    const persisted = loadFromStorage()
    if (persisted) {
      this._entries = persisted.entries
      this._relations = persisted.relations
    }
  }

  get entries(): readonly DataSourceEntry[] { return this._entries }
  get relations(): readonly RelationDefinition[] { return this._relations }
  get version(): number { return this._version }

  getEntry(id: string): DataSourceEntry | undefined {
    return this._entries.find((e) => e.id === id)
  }

  getRelation(id: string): RelationDefinition | undefined {
    return this._relations.find((r) => r.id === id)
  }

  override notify(data: Catalog): void {
    this._version++
    super.notify(data)
    this.scheduleSave()
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        const state: CatalogState = {
          entries: this._entries,
          relations: this._relations,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.warn('Catalog: localStorage-Speichern fehlgeschlagen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }

  // ---------- Datenquellen ----------

  addEntry(type: SourceType): DataSourceEntry {
    const entry: DataSourceEntry = {
      id: nextId('ds', this._entries),
      type,
      alias: nextAlias(getAliasPrefix(type), this._entries),
      sourceId: getDefaultSourceId(type),
      key: '',
      freiselekt: '',
      freiselektAktiv: false,
      fields: getFeldVorschlaege(type),
    }
    this._entries = [...this._entries, entry]
    this.notify(this)
    return entry
  }

  updateEntry(id: string, updates: Partial<DataSourceEntry>): void {
    this._entries = this._entries.map((e) => (e.id === id ? { ...e, ...updates } : e))
    this.notify(this)
  }

  // Typ-Wechsel: Quell-ID + Alias-Praefix + Vorschlags-Felder werden gebumpt,
  // bestehende User-Felder bleiben erhalten (nur ergaenzt falls noch leer).
  changeEntryType(id: string, newType: SourceType): void {
    this._entries = this._entries.map((e) => {
      if (e.id !== id) return e
      const next: DataSourceEntry = {
        ...e,
        type: newType,
        sourceId: getDefaultSourceId(newType),
      }
      if (next.fields.length === 0) next.fields = getFeldVorschlaege(newType)
      return next
    })
    this.notify(this)
  }

  deleteEntry(id: string): void {
    this._entries = this._entries.filter((e) => e.id !== id)
    this.notify(this)
  }

  importParsedIdbs(parsed: ParsedIdb[]): DataSourceEntry[] {
    const added: DataSourceEntry[] = []
    for (const p of parsed) {
      const entry: DataSourceEntry = {
        id: nextId('ds', [...this._entries, ...added]),
        type: 'idb',
        alias: p.alias,
        sourceId: p.idbId,
        key: p.key,
        freiselekt: '',
        freiselektAktiv: false,
        fields: p.fields,
      }
      added.push(entry)
    }
    this._entries = [...this._entries, ...added]
    this.notify(this)
    return added
  }

  // ---------- Relations ----------

  addRelation(initial: Partial<RelationDefinition> = {}): RelationDefinition {
    const base: RelationDefinition = {
      id: nextId('rel', this._relations),
      name: '',
      kind: 'GET',
      relNo: '',
      idbAlias: '',
      idbId: '',
      sourceNo: '',
      targetNo: '',
      direction: 'L',
      indexSource: 'variable',
      indexValue: '',
      fieldSource: 'variable',
      fieldValue: '',
      syntaxBased: false,
      syntaxParams: [],
      allowExtraParams: false,
      description: '',
    }
    const entry: RelationDefinition = { ...base, ...initial, id: base.id }
    if (!entry.name) entry.name = `${entry.kind}_${entry.relNo || 'NEU'}`
    entry.syntax = entry.syntaxBased && initial.syntax ? initial.syntax : generateRelationSyntax(entry)
    this._relations = [...this._relations, entry]
    this.notify(this)
    return entry
  }

  updateRelation(id: string, updates: Partial<RelationDefinition>): void {
    this._relations = this._relations.map((e) => {
      if (e.id !== id) return e
      const merged = { ...e, ...updates }
      merged.syntax = generateRelationSyntax(merged)
      return merged
    })
    this.notify(this)
  }

  deleteRelation(id: string): void {
    this._relations = this._relations.filter((e) => e.id !== id)
    this.notify(this)
  }

  importRelationFromSyntax(input: string): RelationDefinition | null {
    const parsed = parseRelationSyntax(input)
    if (!parsed) return null
    return this.addRelation({ ...parsed, name: `${parsed.kind}_${parsed.relNo || 'NEU'}` })
  }
}

export const catalog = new Catalog()
