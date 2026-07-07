// dataSources
// Kap. 5.1: Datenquellen sind eigenständige, benannte VORLAGEN (CLAUDE.md
// Kap. 5): einmal definiert, in jeder Maske wiederverwendbar. Aus ihnen wird
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

export interface DataSourceField {
  // Technikwert: direkter Property-Name im Datensatz ODER 'pos_len'
  // (Position_Länge im SATZ, z. B. '193_30').
  code: string
  // Klarname für den Bediener (z. B. 'Vorname').
  label: string
  // Beispielwert für die Vorschau im Editor (Kap. 5.2): eine gebundene
  // Stelle zeigt sofort diesen Wert.
  sample: string
}

export interface DataSource {
  // Stabiler Technikwert — Blöcke referenzieren ihn in ihrer source-Prop.
  id: string
  // Anzeigename der Vorlage; wird im Export zum SEFILELOOP-ALIAS.
  name: string
  // SoftEngine-Tabellen-ID (IDB), z. B. 'IDBID0001'.
  idbId: string
  // Feldcode der Satznummer (pindex) — braucht der Schreibweg (Kap. 5.3b):
  // PUT_RELATION adressiert den Satz über diese Nummer. Kein Anzeige-Feld.
  indexField?: string
  // Feld-Wörterbuch der Tabelle, in SATZ-Reihenfolge (deterministisch).
  fields: readonly DataSourceField[]
}

export const DATA_SOURCES: readonly DataSource[] = [
  {
    id: 'terminplaner',
    name: 'Terminplaner',
    idbId: 'IDBID0001',
    indexField: '0_10',
    fields: [
      { code: '10_8', label: 'Adressnummer', sample: 'K2' },
      { code: '18_30', label: 'Tierart', sample: 'Katze' },
      { code: '48_30', label: 'Rasse', sample: 'Hauskatze' },
      { code: '78_30', label: 'Tiername', sample: 'Minka' },
      { code: '108_10', label: 'Geburtsdatum', sample: '12.03.2021' },
      { code: '118_60', label: 'Behandlung', sample: 'Erbrechen seit heute Morgen' },
      { code: '178_5', label: 'Uhrzeit', sample: '10:30' },
      { code: '183_10', label: 'Datum', sample: '07.07.2026' },
      { code: '193_30', label: 'Vorname', sample: 'Lisa' },
      { code: '223_30', label: 'Nachname', sample: 'Wagner' },
      { code: '253_30', label: 'Zimmer', sample: 'Zimmer 2' },
      { code: '319_12', label: 'Priorität', sample: 'Notfall' },
      { code: '331_12', label: 'Belegnummer', sample: 'B-5012' },
    ],
  },
  {
    id: 'kundenhaustiere',
    name: 'Kundenhaustiere',
    idbId: 'IDBID0004',
    fields: [
      { code: '10_8', label: 'Adressnummer', sample: 'K2' },
      { code: '18_30', label: 'Tiername', sample: 'Minka' },
      { code: '48_30', label: 'Tierart', sample: 'Katze' },
      { code: '78_30', label: 'Rasse', sample: 'Hauskatze' },
      { code: '108_10', label: 'Geburtsdatum', sample: '12.03.2021' },
      { code: '118_10', label: 'Termindatum', sample: '07.07.2026' },
      { code: '128_350', label: 'Notiz', sample: 'Frisst schlecht seit gestern' },
      { code: '524_60', label: 'Behandlung', sample: 'Erbrechen seit heute Morgen' },
    ],
  },
]

export function getDataSource(id: string): DataSource | undefined {
  return DATA_SOURCES.find((s) => s.id === id)
}
