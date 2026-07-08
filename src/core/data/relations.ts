// relations
// Kap. 5.3b (Vorgriff auf 5.5): GET/PUT-Relations sind BENUTZERDEFINIERTE
// VORLAGEN — Daten, kein Code (CLAUDE.md 5.3b (d): NR '174' NICHT
// festverdrahten; es gibt >1000 Relations, je Installation individuell).
// Eine Vorlage beschreibt Verb, NR und die Parameter-Syntax mit
// PLATZHALTERN, die zur Laufzeit gefüllt werden. Der Standard-PUT (NR 174)
// ist die MITGELIEFERTE Vorlage, die das Kanban standardmäßig benutzt.
// Kap. 5.5 baut darüber nur noch Bearbeiten-UI + Persistenz.
//
// VERBINDLICHE QUELLE der Standard-Vorlage: behandlung-umbau,
// index.basis.source.html (Block "SE-ADAPTER 4/4", sePut/seSend, Z. 1645/
// 1663) + SE-INVENTAR §5: basisHTML_SND_MSG('PUT_RELATION', { NR: '174',
// PARAMS: [pos, len, 'L', pindex, relId, wert] }).
// ⚠ relId = Relations-ID OHNE 'IDB'-Präfix ('ID0001', nicht 'IDBID0001') —
// die SEvariablen derselben Maske sagen IDBID0001, der PUT nicht.
// Typ-Entscheidung: alle Parameter reisen als STRINGS — so liefert sie die
// Laufzeit (Feldcodes, getField, statusValue sind Strings), es gibt keine
// belegte Zahl-Umwandlung in der Quelle. Falls SoftEngine Zahlen erwartet,
// ist das eine Korrektur NUR an der Vorlage unten (Daten, kein Code).
//
// Regel Technikwert ≠ Anzeigename: `id`, `verb`, `nr` und die Platzhalter
// sind Technikwerte; der Bediener sieht ausschließlich `name`.

export type RelationVerb = 'GET_RELATION' | 'PUT_RELATION' | 'PUTADD_RELATION'

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

// Werte, die ein Konsument zur Laufzeit liefert. Schlüssel = Platzhalter
// (im Param-String als {NAME}); nicht gelieferte Platzhalter bleiben leer.
export interface RelationContext {
  // Position/Länge des Ziel-Felds (aus dem Feldcode 'pos_len' gesplittet).
  FELD_POS?: string
  FELD_LEN?: string
  // Satznummer der Zeile (Feld `indexField` der Datenquelle).
  PINDEX?: string
  // Relations-ID der Tabelle OHNE 'IDB'-Präfix (relIdFromIdbId).
  RELID?: string
  // Der zu schreibende / auslösende Wert.
  VALUE?: string
}

export const RELATION_TEMPLATES: readonly RelationTemplate[] = [
  {
    id: 'standard-put',
    name: 'Standard-Schreiben (PUT)',
    verb: 'PUT_RELATION',
    nr: '174',
    params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
  },
]

export function getRelationTemplate(id: string): RelationTemplate | undefined {
  return RELATION_TEMPLATES.find((t) => t.id === id)
}

// 'IDBID0001' -> 'ID0001' (Beweis siehe Kopfkommentar). Andere Formen
// bleiben unverändert — die Ableitung erfindet nichts.
export function relIdFromIdbId(idbId: string): string {
  return idbId.replace(/^IDB/, '')
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
  template: RelationTemplate,
  context: RelationContext,
): string[] {
  return template.params.map((p) =>
    p.replace(/\{([A-Z_]+)\}/g, (_, key: string) =>
      String(context[key as keyof RelationContext] ?? ''),
    ),
  )
}
