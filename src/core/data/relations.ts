// relations
// Kap. 5.5 (Fundament seit 5.3b): GET/PUT-Relations sind BENUTZERDEFINIERTE
// VORLAGEN — Daten, kein Code (5.3b (d): NR '174' NICHT
// festverdrahten; es gibt >1000 Relations, je Installation individuell).
// Eine Vorlage beschreibt Verb, NR und die Parameter-Syntax mit
// PLATZHALTERN, die zur Laufzeit gefüllt werden. Der Standard-PUT (NR 174)
// ist die MITGELIEFERTE Vorlage (Seed des RelationStore — die gelebte
// Wahrheit liegt seit 5.5 im Store, wie bei den Datenquellen).
//
// VERBINDLICHE QUELLE der Standard-Vorlage: behandlung-umbau,
// index.basis.source.html (Block "SE-ADAPTER 4/4", sePut/seSend, Z. 1645/
// 1663) + SE-INVENTAR §5: basisHTML_SND_MSG('PUT_RELATION', { NR: '174',
// PARAMS: [pos, len, 'L', pindex, relId, wert] }).
// ⚠ relId = Relations-ID OHNE 'IDB'-Präfix ('ID0001', nicht 'IDBID0001') —
// die SEvariablen derselben Maske sagen IDBID0001, der PUT nicht.
// Typ-Entscheidung: alle Parameter reisen als STRINGS — verifiziert
// 2026-07-08 gegen sePut (alle sechs Strings, exakt wie die Vorlage).
//
// Regel Technikwert ≠ Anzeigename: `id`, `verb`, `nr` und die Platzhalter
// sind Technikwerte; der Bediener sieht ausschließlich `name`.

export type RelationVerb = 'GET_RELATION' | 'PUT_RELATION' | 'PUTADD_RELATION'

export const RELATION_VERBS: readonly RelationVerb[] = [
  'GET_RELATION', 'PUT_RELATION', 'PUTADD_RELATION',
]

// Automatisch befüllbare Standard-Platzhalter (5.5) — die eine Quelle für
// Hilfe-Text und den heute vorhandenen Laufzeit-Kontext. Relations-Syntax darf
// zusätzlich beliebige eigene Platzhalter wie {GJ} oder {BELART} enthalten;
// deren Wertquelle wird erst beim Aktionsschritt zugeordnet.
//  FELD_POS/FELD_LEN  Position/Länge des Ziel-Felds (Feldcode gesplittet)
//  PINDEX             Nummer des betroffenen Datensatzes
//  SELKEY             Nummer des gewählten Datensatzes (füllt erst Kap. 8 —
//                     bis dahin liefert kein Konsument einen Wert, Auflösung ergibt '')
//  DROP_PINDEX        Nummer der gezogenen Karte (Kanban-Drop)
//  RELID              Relations-ID der Tabelle OHNE 'IDB'-Präfix
//  VALUE              der zu schreibende / auslösende Wert
//  NOW_DATE           heutiges Datum (füllt der Konsument, z. B. seRuntime)
export const RELATION_PLACEHOLDERS = [
  'FELD_POS', 'FELD_LEN', 'PINDEX', 'SELKEY', 'DROP_PINDEX',
  'RELID', 'VALUE', 'NOW_DATE',
] as const

export type RelationPlaceholder = (typeof RELATION_PLACEHOLDERS)[number]

// Werte, die ein Konsument zur Laufzeit liefert. Neben den Standardnamen sind
// benutzerdefinierte Platzhalter erlaubt. Nicht gelieferte Namen werden leer.
export type RelationContext = Readonly<Record<string, string | undefined>>

export interface RelationTemplate {
  // Stabiler Technikwert — Konsumenten (Kanban-Schreibweg, später Kap. 8)
  // referenzieren die Vorlage darüber.
  id: string
  // Anzeigename für den Bediener.
  name: string
  verb: RelationVerb
  // Relations-Nummer der Installation (freie Eingabe, >1000 möglich).
  nr: string
  // Parameter-Syntax: feste Werte und Platzhalter (siehe RelationContext).
  params: readonly string[]
  // Ein abschließendes !... in der eingegebenen Syntax: der spätere
  // Aktionsschritt darf weitere Parameter anhängen. Der Marker selbst wird
  // niemals an SoftEngine gesendet.
  allowExtraParams?: boolean
}

export type ParsedRelationSyntax = Pick<
  RelationTemplate,
  'verb' | 'nr' | 'params' | 'allowExtraParams'
>

// Mitgelieferter Startbestand (Kap. 5.5: nur noch der SEED des
// RelationStore — danach gehören die Vorlagen dem Bediener). Seit
// 2026-07-15 benutzt sie KEIN Baustein mehr automatisch: sie ist eine
// normale, löschbare Bibliotheks-Vorlage für Aktionsketten.
export const BUILTIN_RELATION_TEMPLATES: readonly RelationTemplate[] = [
  {
    id: 'standard-put',
    name: 'Standard-Schreiben (PUT)',
    verb: 'PUT_RELATION',
    nr: '174',
    params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
  },
]

// 'IDBID0001' -> 'ID0001' (Beweis siehe Kopfkommentar). Andere Formen
// bleiben unverändert — die Ableitung erfindet nichts.
export function relIdFromIdbId(idbId: string): string {
  return idbId.replace(/^IDB/, '')
}

// Deutsches Datum für den Platzhalter {NOW_DATE} ('08.07.2026' — dieselbe
// Form wie die Datums-Felder der Referenzmaske). Pur: der Aufrufer stellt
// das Datum (Laufzeit das echte, Tests ein festes). Hierher gezogen aus
// seRuntime (Z2): das Vokabular {NOW_DATE} gehört diesem Modul, und mit
// seAktionen gibt es den zweiten Konsumenten.
export function formatNowDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

// Feldcode 'pos_len' zerlegen ('253_30' -> pos '253', len '30').
// Kein pos_len-Code -> null (direkte Property-Namen haben keine Position).
export function splitFieldCode(code: string): { pos: string; len: string } | null {
  const m = /^(\d+)_(\d+)$/.exec(code)
  return m ? { pos: m[1], len: m[2] } : null
}

// SoftEngine-Syntax -> neutrale Vorlage. Nur die äußere Hülle hat Bedeutung:
// Verb, NR und die mit ! getrennte Parameter-Reihenfolge. Parameterpositionen
// werden NIE fachlich geraten. Leere Positionen und führende Nullen bleiben
// erhalten. Der letzte ] schließt die Relation, damit Werte wie DATUM[10
// korrekt als Parameter gelesen werden.
export function parseRelationSyntax(input: string): ParsedRelationSyntax | null {
  const raw = input.trim()
  const head = /^(GET_RELATION|PUTADD_RELATION|PUT_RELATION)\[/i.exec(raw)
  if (!head || !raw.endsWith(']') || /[\r\n]/.test(raw)) return null

  const body = raw.slice(head[0].length, -1)
  const parts = body.split('!')
  const nr = parts.shift() ?? ''
  if (!/^\d+$/.test(nr)) return null

  let allowExtraParams = false
  if (parts.at(-1) === '...') {
    allowExtraParams = true
    parts.pop()
  }

  // Doppelte Klammern kamen im Alt-Editor vor. Als reine, vollständige
  // Platzhalter-Position werden sie sicher auf die kanonische Form gebracht;
  // sonst bleibt der Parameter exakt erhalten.
  const params = parts.map((param) => {
    const doubled = /^\{\{([A-Za-z0-9_]+)\}\}$/.exec(param)
    return doubled ? `{${doubled[1]}}` : param
  })

  return {
    verb: head[1].toUpperCase() as RelationVerb,
    nr,
    params,
    allowExtraParams,
  }
}

// Strukturierte Vorlage -> kanonische SoftEngine-Syntax. Damit existiert nur
// eine gespeicherte Wahrheit; die Syntaxzeile ist stets daraus abgeleitet.
export function formatRelationSyntax(
  relation: Pick<RelationTemplate, 'verb' | 'nr' | 'params' | 'allowExtraParams'>,
): string {
  const parts = [relation.nr, ...relation.params]
  if (relation.allowExtraParams) parts.push('...')
  return `${relation.verb}[${parts.join('!')}]`
}

// Die Bedienoberfläche kennt nur die zwei fachlichen Gruppen Lesen und
// Schreiben. PUTADD bleibt intern ein eigenes SoftEngine-Verb, gehört bei
// Suche und Auswahl aber zur Gruppe Schreiben.
export type RelationGroup = 'lesen' | 'schreiben'

export function relationGroup(relation: Pick<RelationTemplate, 'verb'>): RelationGroup {
  return relation.verb === 'GET_RELATION' ? 'lesen' : 'schreiben'
}

// Gemeinsame Suche für Relationsbibliothek und späteren Aktions-Picker.
// Gesucht wird in Anzeigename, exakter NR und der vollständigen Syntax.
export function relationMatchesSearch(
  relation: Pick<RelationTemplate, 'name' | 'verb' | 'nr' | 'params' | 'allowExtraParams'>,
  query: string,
): boolean {
  const needle = query.trim().toLocaleLowerCase('de')
  if (needle === '') return true
  return [relation.name, relation.nr, formatRelationSyntax(relation)]
    .some((value) => value.toLocaleLowerCase('de').includes(needle))
}

// Dynamische Namen einer Vorlage in stabiler Syntax-Reihenfolge. Feste
// Parameter bleiben Teil der Vorlage; nur diese Platzhalter bekommen im
// Aktionsschritt eine Wertquelle. Mehrfach verwendete Namen werden einmal
// zugeordnet und beim Aufloesen an jeder Stelle gleich eingesetzt.
export function relationPlaceholderNames(
  relation: Pick<RelationTemplate, 'params'>,
): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const param of relation.params) {
    for (const match of param.matchAll(/\{([A-Za-z0-9_]+)\}/g)) {
      const name = match[1]
      if (seen.has(name)) continue
      seen.add(name)
      names.push(name)
    }
  }
  return names
}

// Platzhalter einer Vorlage füllen: {NAME} -> Kontextwert (fehlend -> '').
// Feste Werte (z. B. 'L') laufen unverändert durch. Deterministisch.
export function resolveParams(
  template: Pick<RelationTemplate, 'params'>,
  context: RelationContext,
): string[] {
  return template.params.map((p) =>
    p.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key: string) =>
      String(context[key] ?? ''),
    ),
  )
}

// Unbekannte {PLATZHALTER} eines Param-Strings für Kontexte mit bewusst engem
// Vokabular (heute: START_TOOL). Relations-Vorlagen selbst dürfen freie Namen
// verwenden; deren Zuordnung folgt mit dem Relations-Aktionsschritt.
export function unknownPlaceholders(
  param: string,
  known: readonly string[] = RELATION_PLACEHOLDERS,
): string[] {
  const acc: string[] = []
  for (const m of param.matchAll(/\{([A-Z_]+)\}/g)) {
    if (!known.includes(m[1])) acc.push(m[1])
  }
  return acc
}

// Baut aus rohen (evtl. kaputten) localStorage-Daten eine saubere
// Vorlagen-Liste (Muster: sanitizeDataSources — strukturell prüfen,
// Unbrauchbares verwerfen, nie raten). Eine Vorlage mit kaputten params
// fliegt KOMPLETT raus: ein fehlender Parameter würde die Aufruf-Stelligkeit
// verschieben und falsch schreiben. Inhaltliche Regeln (NR nur Ziffern,
// bekannte Platzhalter) erzwingt das Eingabe-Formular, nicht der Lader.
export function sanitizeRelationTemplates(raw: unknown): RelationTemplate[] {
  if (!Array.isArray(raw)) return []
  const acc: RelationTemplate[] = []
  const seen = new Set<string>()
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || e.id === '' || seen.has(e.id)) continue
    if (typeof e.name !== 'string' || e.name.trim() === '') continue
    if (typeof e.verb !== 'string' || !RELATION_VERBS.includes(e.verb as RelationVerb)) continue
    if (typeof e.nr !== 'string' || e.nr.trim() === '') continue
    if (!Array.isArray(e.params) || e.params.some((p) => typeof p !== 'string')) continue
    seen.add(e.id)
    acc.push({
      id: e.id,
      name: e.name,
      verb: e.verb as RelationVerb,
      nr: e.nr,
      params: [...(e.params as string[])],
      allowExtraParams: e.allowExtraParams === true,
    })
  }
  return acc
}
