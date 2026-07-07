// dataSources
// Kap. 5.1: Datenquellen sind eigenständige, benannte VORLAGEN (CLAUDE.md
// Kap. 5): einmal definiert, in jeder Maske wiederverwendbar. Aus ihnen wird
// die SEvariablen-JSON des Exports erzeugt (SEFILELOOP) — nie von Hand.
//
// Startbestand = die FELD-Maps der echten SoftEngine-Masken in diesem Repo
// (dashboard/praxis-kanban.html, dashboard/behandlungszimmer.html). Die
// EmpfangPraxis-Felder kommen dazu, sobald sie vorliegen. TODO_-Platzhalter
// der Vorlagen-Masken wurden bewusst NICHT übernommen (keine echten Codes).
//
// Regel Technikwert ≠ Anzeigename: `id`, `idbId` und `code` sind Technikwerte
// und erscheinen NIE sichtbar in der Maske; der Bediener sieht ausschließlich
// `name` und `label` (maschinell erzwungen in dataSources.test.ts).

export interface DataSourceField {
  // Technikwert: direkter Property-Name im Datensatz ODER 'pos_len'
  // (Position_Länge im SATZ, z. B. '199_30').
  code: string
  // Klarname für den Bediener (z. B. 'Vorname').
  label: string
}

export interface DataSource {
  // Stabiler Technikwert — Blöcke referenzieren ihn in ihrer source-Prop.
  id: string
  // Anzeigename der Vorlage; wird im Export zum SEFILELOOP-ALIAS.
  name: string
  // SoftEngine-Tabellen-ID (IDB), z. B. 'IDBID0005'.
  idbId: string
  // Feld-Wörterbuch der Tabelle, in SATZ-Reihenfolge (deterministisch).
  fields: readonly DataSourceField[]
}

export const DATA_SOURCES: readonly DataSource[] = [
  {
    id: 'terminplaner',
    name: 'Terminplaner',
    idbId: 'IDBID0005',
    fields: [
      { code: '10_8', label: 'Adressnummer' },
      { code: '18_30', label: 'Tierart' },
      { code: '48_30', label: 'Rasse' },
      { code: '78_30', label: 'Tiername' },
      { code: '108_10', label: 'Geburtsdatum' },
      { code: '118_30', label: 'Behandlung' },
      { code: '148_5', label: 'Uhrzeit' },
      { code: '153_10', label: 'Datum' },
      { code: '199_30', label: 'Vorname' },
      { code: '229_30', label: 'Nachname' },
      { code: '259_8', label: 'Zimmer' },
    ],
  },
  {
    id: 'kundenhaustiere',
    name: 'Kundenhaustiere',
    idbId: 'IDBID0009',
    fields: [
      { code: '10_8', label: 'Adressnummer' },
      { code: '18_30', label: 'Tiername' },
      { code: '48_30', label: 'Tierart' },
      { code: '78_30', label: 'Rasse' },
      { code: '108_10', label: 'Geburtsdatum' },
    ],
  },
]

export function getDataSource(id: string): DataSource | undefined {
  return DATA_SOURCES.find((s) => s.id === id)
}
