// DataSourceStore
// Die Datenquellen-Bibliothek: duenner Ableger des gemeinsamen Fundaments
// (VorlagenStore.ts — dort wohnen Laden, Bereinigen, Melden und das
// entprellte Speichern). Hier steht nur, was DIESE Bibliothek ausmacht.
//
// Datenquellen-Vorlagen sind BENUTZERDEFINIERT — Felder sind je
// SoftEngine-Installation individuell. Persistiert in localStorage NEBEN den
// Baeumen.
//
// Ein frischer Browser startet LEER (Nutzer-Entscheidung 2026-07-30). Bis
// dahin wurden zwei mitgelieferte Quellen eingespielt (Terminplaner
// IDBID0001, Kundenhaustiere IDBID0004) — die Wahrheit einer einzigen
// Installation, festgeschrieben im Code. Bestehende Bibliotheken sind davon
// unberuehrt: was im Speicher liegt, wird geladen.

import { pruefeDatenquellen, type DataSource } from '../core/data/dataSources'
import { BEREICH_QUELLEN } from '../core/data/ladeProblem'
import { VorlagenStore, type VorlagenBauplan } from './VorlagenStore'

const BAUPLAN: VorlagenBauplan<DataSource> = {
  schluessel: 'aufbau_editor_datenquellen_v1',
  huelle: 'sources',
  klarnameLesen: 'Datenquellen',
  klarnameSchreiben: 'Datenquellen',
  bereich: BEREICH_QUELLEN,
  pruefe: pruefeDatenquellen,
  // Kein Startbestand — restlos entfernt am 2026-07-30, nicht wieder einbauen.
}

export class DataSourceStore extends VorlagenStore<DataSource> {
  constructor() {
    super(BAUPLAN)
  }
}

export const dataSourceStore = new DataSourceStore()
