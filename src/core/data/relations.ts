// relations
// Kap. 5.5 (Fundament seit 5.3b): GET/PUT-Relations sind BENUTZERDEFINIERTE
// VORLAGEN — Daten, kein Code (CLAUDE.md 5.3b (d): NR '174' NICHT
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

// Das PLATZHALTER-Vokabular (CLAUDE.md 5.5) — die eine Quelle für
// Formular-Validierung, Hilfe-Text und Laufzeit-Kontext:
//  FELD_POS/FELD_LEN  Position/Länge des Ziel-Felds (Feldcode gesplittet)
//  PINDEX             Satznummer des betroffenen Satzes
//  SELKEY             Satznummer der Auswahl (füllt erst Kap. 8 — bis dahin
//                     liefert kein Konsument einen Wert, Auflösung ergibt '')
//  DROP_PINDEX        Satznummer der gezogenen Karte (Kanban-Drop)
//  RELID              Relations-ID der Tabelle OHNE 'IDB'-Präfix
//  VALUE              der zu schreibende / auslösende Wert
//  NOW_DATE           heutiges Datum (füllt der Konsument, z. B. seRuntime)
export const RELATION_PLACEHOLDERS = [
  'FELD_POS', 'FELD_LEN', 'PINDEX', 'SELKEY', 'DROP_PINDEX',
  'RELID', 'VALUE', 'NOW_DATE',
] as const

export type RelationPlaceholder = (typeof RELATION_PLACEHOLDERS)[number]

// Werte, die ein Konsument zur Laufzeit liefert. Schlüssel = Platzhalter
// (im Param-String als {NAME}); nicht gelieferte Platzhalter bleiben leer.
export type RelationContext = Partial<Record<RelationPlaceholder, string>>

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
}

// Mitgelieferter Startbestand (Kap. 5.5: nur noch der SEED des
// RelationStore — danach gehören die Vorlagen dem Bediener). Die id
// 'standard-put' ist der Default der Kanban-Prop `putRelation`.
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

// Platzhalter einer Vorlage füllen: {NAME} -> Kontextwert (fehlend -> '').
// Feste Werte (z. B. 'L') laufen unverändert durch. Deterministisch.
export function resolveParams(
  template: Pick<RelationTemplate, 'params'>,
  context: RelationContext,
): string[] {
  return template.params.map((p) =>
    p.replace(/\{([A-Z_]+)\}/g, (_, key: string) =>
      String(context[key as RelationPlaceholder] ?? ''),
    ),
  )
}

// Unbekannte {PLATZHALTER} eines Param-Strings (für die Formular-Validierung
// in 5.5b: Tippfehler wie {PINDX} würden sonst stumm zu '' aufgelöst).
// `known` erlaubt engere Vokabulare (Z2: Werkzeug-Parameter kennen nur eine
// Teilmenge, AKTIONS_PLATZHALTER) — Default bleibt das Relations-Vokabular.
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
    })
  }
  return acc
}
