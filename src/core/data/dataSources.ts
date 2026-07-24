// dataSources
// Datenquellen sind eigenständige, benannte VORLAGEN
// einmal definiert, in jeder Maske wiederverwendbar. Aus ihnen wird
// die SEvariablen-JSON des Exports erzeugt (SEFILELOOP) — nie von Hand.
//
// VERBINDLICHE QUELLE (korrigiert 2026-07-07): die FELD-Map der echten,
// live getesteten Behandlung-Maske — Repo `behandlung-umbau`,
// `behandlung/index.basis.source.html` (Block "SE-ADAPTER", `var FELD`) +
// `behandlung/SE-INVENTAR.md` §6/§11: "Die FELDER-Strings (pos_len) sind
// echte SE-Datenkontrakte". Die früheren Codes/IDB-IDs stammten aus den
// Dashboard-Prototypen dieses Repos und waren teilweise FALSCH
// (Terminplaner ist IDBID0001, nicht 0005; Kundenhaustiere IDBID0004,
// nicht 0009). TODO_-Platzhalter der Vorlagen werden nie übernommen.
//
// Regel Technikwert ≠ Anzeigename: `id`, `idbId`, `code` und `indexField`
// sind Technikwerte und erscheinen NIE sichtbar in der Maske; der Bediener
// sieht ausschließlich `name` und `label` (maschinell erzwungen in
// dataSources.test.ts).

// Quellen-ARTEN (Nutzer-Klarstellung 2026-07-07): nicht nur
// IDB-Tabellen — auch Adressstamm, Artikelstamm, Belege (später MEMTAB/
// ERPAPICALL). Die Art bestimmt die SEvariablen-Form: IDB → SEFILELOOP mit
// FELDER '*', Stammtabellen → feste Tabellen-ID (ADR/ART/BEL) + explizite
// pos_len-Liste. Beleg: behandlung-umbau empfang/index.basis.SEvariablen.json
// ({ ID: 'ADR', FELDER: '2_8,…' } / { ID: 'BEL', FELDER: '1_1,…' } /
// { ID: 'IDBID0001', FELDER: '*' }; ART analog in behandlung/).
export type DataSourceKind = 'idb' | 'adressstamm' | 'artikelstamm' | 'beleg'

export const DATA_SOURCE_KINDS: readonly DataSourceKind[] = [
  'idb', 'adressstamm', 'artikelstamm', 'beleg',
]

// Feste SoftEngine-Tabellen-IDs der Stammtabellen (Technikwerte, Beleg s.o.).
const STAMM_TABLE_IDS: Record<Exclude<DataSourceKind, 'idb'>, string> = {
  adressstamm: 'ADR',
  artikelstamm: 'ART',
  beleg: 'BEL',
}

export interface DataSourceField {
  // Technikwert: direkter Property-Name im Datensatz ODER 'pos_len'
  // (Position_Länge im SATZ, z. B. '193_30').
  code: string
  // Klarname für den Bediener (z. B. 'Vorname'). Er ist zugleich die
  // Vorschau des Editors: eine gebundene Stelle zeigt den Klarnamen —
  // erfundene Beispielwerte gibt es NICHT (Nutzer-Entscheidung 2026-07-10,
  // ersetzt das sample-Feld aus).
  label: string
}

export interface DataSource {
  // Stabiler Technikwert — Blöcke referenzieren ihn in ihrer source-Prop.
  id: string
  // Anzeigename der Vorlage; wird im Export zum SEFILELOOP-ALIAS.
  name: string
  // Art der Quelle (bestimmt Tabellen-ID + FELDER-Form, s. o.).
  kind: DataSourceKind
  // SoftEngine-Tabellen-ID, z. B. 'IDBID0001' — NUR bei kind 'idb'
  // (Stammtabellen haben feste IDs, siehe tableIdFor).
  idbId?: string
  // Feldcode der Datensatz-Nummer (pindex) — braucht der Schreibweg:
  // PUT_RELATION adressiert den Satz über diese Nummer. Kein Anzeige-Feld.
  indexField?: string
  // Feld-Wörterbuch der Tabelle, in SATZ-Reihenfolge (deterministisch).
  fields: readonly DataSourceField[]
}

// SoftEngine-Tabellen-ID einer Quelle: bei IDB die eingegebene IDB-ID,
// bei Stammtabellen die feste ID der Art.
export function tableIdFor(source: DataSource): string {
  return source.kind === 'idb' ? (source.idbId ?? '') : STAMM_TABLE_IDS[source.kind]
}

// FELDER-Eintrag der SEFILELOOP: IDB-Tabellen dürfen '*', Stammtabellen
// brauchen die explizite pos_len-Liste (Reihenfolge = Feld-Wörterbuch).
export function felderFor(source: DataSource): string {
  return source.kind === 'idb' ? '*' : source.fields.map((f) => f.code).join(',')
}

// Mitgelieferter Startbestand (bleibt als Vorlage; ab jetzt nur
// noch der SEED des DataSourceStore — die gelebte Wahrheit liegt im Store).
export const BUILTIN_DATA_SOURCES: readonly DataSource[] = [
  {
    id: 'terminplaner',
    name: 'Terminplaner',
    kind: 'idb',
    idbId: 'IDBID0001',
    indexField: '0_10',
    fields: [
      { code: '10_8', label: 'Adressnummer' },
      { code: '18_30', label: 'Tierart' },
      { code: '48_30', label: 'Rasse' },
      { code: '78_30', label: 'Tiername' },
      { code: '108_10', label: 'Geburtsdatum' },
      { code: '118_60', label: 'Behandlung' },
      { code: '178_5', label: 'Uhrzeit' },
      { code: '183_10', label: 'Datum' },
      { code: '193_30', label: 'Vorname' },
      { code: '223_30', label: 'Nachname' },
      { code: '253_30', label: 'Zimmer' },
      { code: '319_12', label: 'Priorität' },
      { code: '331_12', label: 'Belegnummer' },
    ],
  },
  {
    id: 'kundenhaustiere',
    name: 'Kundenhaustiere',
    kind: 'idb',
    idbId: 'IDBID0004',
    fields: [
      { code: '10_8', label: 'Adressnummer' },
      { code: '18_30', label: 'Tiername' },
      { code: '48_30', label: 'Tierart' },
      { code: '78_30', label: 'Rasse' },
      { code: '108_10', label: 'Geburtsdatum' },
      { code: '118_10', label: 'Termindatum' },
      { code: '128_350', label: 'Notiz' },
      { code: '524_60', label: 'Behandlung' },
    ],
  },
]

// ---------- Pure Helfer für das Eingabe-Formular ----------
// Regel Technikwert ≠ Anzeigename: der Bediener gibt Klarname + Position +
// Länge bzw. die IDB-ID im SoftEngine-Format ('ID0004') ein — die
// Technikwerte ('pos_len', 'IDBIDnnnn') entstehen daraus unsichtbar.
// Ungültige Eingaben ergeben '' (das Formular zeigt dann einen Fehler,
// es wird nie geraten).

// Position + Länge -> Feldcode: ('193', '30') -> '193_30'. Position darf 0
// sein (Datensatz-Nummer '0_10'), Länge muss mindestens 1 sein.
export function fieldCode(pos: string, len: string): string {
  const p = pos.trim()
  const l = len.trim()
  if (!/^\d+$/.test(p) || !/^\d+$/.test(l) || Number(l) < 1) return ''
  return `${p}_${l}`
}

// IDB-ID-Eingabe -> Technikwert: 'ID0004' (auch 'IDBID0004' oder klein
// geschrieben, Ziffern werden auf 4 Stellen aufgefüllt) -> 'IDBID0004'.
export function idbIdFromInput(raw: string): string {
  const m = /^(?:IDB)?ID(\d{1,4})$/i.exec(raw.trim())
  return m ? `IDBID${m[1].padStart(4, '0')}` : ''
}

// Rückweg fürs Bearbeiten/Anzeigen: 'IDBID0004' -> 'ID0004'; sonst ''.
export function idbIdAnzeige(idbId: string | undefined): string {
  const m = /^IDB(ID\d{4})$/.exec(idbId ?? '')
  return m ? m[1] : ''
}

// Baut aus rohen (evtl. kaputten) localStorage-Daten eine saubere
// Vorlagen-Liste (Muster: sanitizeTree in Editor.ts — strukturell prüfen,
// Unbrauchbares verwerfen, nie raten). Inhaltliche Regeln (Klarname kein
// Feldcode usw.) erzwingt das Eingabe-Formular, nicht der Lader — gespeicherte
// Nutzerdaten werden hier nicht umgeschrieben.
export function sanitizeDataSources(raw: unknown): DataSource[] {
  if (!Array.isArray(raw)) return []
  const acc: DataSource[] = []
  const seen = new Set<string>()
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || e.id === '' || seen.has(e.id)) continue
    if (typeof e.name !== 'string' || e.name.trim() === '') continue
    if (typeof e.kind !== 'string' || !DATA_SOURCE_KINDS.includes(e.kind as DataSourceKind)) continue
    const fields: DataSourceField[] = []
    for (const f of Array.isArray(e.fields) ? e.fields : []) {
      if (!f || typeof f !== 'object') continue
      const ff = f as Record<string, unknown>
      if (typeof ff.code !== 'string' || ff.code === '') continue
      if (typeof ff.label !== 'string' || ff.label === '') continue
      // Nur code + label — ein `sample` aus Altbeständen (bis 2026-07-10)
      // wird bewusst verworfen: Beispielwerte gibt es nicht mehr.
      fields.push({ code: ff.code, label: ff.label })
    }
    seen.add(e.id)
    acc.push({
      id: e.id,
      name: e.name,
      kind: e.kind as DataSourceKind,
      ...(typeof e.idbId === 'string' && e.idbId !== '' ? { idbId: e.idbId } : {}),
      ...(typeof e.indexField === 'string' && e.indexField !== '' ? { indexField: e.indexField } : {}),
      fields,
    })
  }
  return acc
}
