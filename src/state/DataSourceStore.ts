import { pruefeDatenquellen, type DataSource } from '../core/data/dataSources'
import { VorlagenStore, type VorlagenBauplan } from './VorlagenStore'

const BAUPLAN: VorlagenBauplan<DataSource> = {
  schluessel: 'aufbau_editor_datenquellen_v1',
  huelle: 'sources',
  klarnameLesen: 'Datenquellen',
  klarnameSchreiben: 'Datenquellen',
  pruefe: pruefeDatenquellen,
  // Kein Startbestand — restlos entfernt am 2026-07-30, nicht wieder einbauen.
}

export class DataSourceStore extends VorlagenStore<DataSource> {
  constructor() {
    super(BAUPLAN)
  }
}

export const dataSourceStore = new DataSourceStore()
