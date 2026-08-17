import {
  BUILTIN_RELATION_TEMPLATES,
  pruefeRelationsVorlagen,
  type RelationTemplate,
} from '../core/data/relations'
import { VorlagenStore, type VorlagenBauplan } from './VorlagenStore'

const BAUPLAN: VorlagenBauplan<RelationTemplate> = {
  schluessel: 'aufbau_editor_relationen_v1',
  huelle: 'relations',
  klarnameLesen: 'Relations-Vorlagen',

  klarnameSchreiben: 'Relationen',
  pruefe: pruefeRelationsVorlagen,
  startbestand: BUILTIN_RELATION_TEMPLATES,
}

export class RelationStore extends VorlagenStore<RelationTemplate> {
  constructor() {
    super(BAUPLAN)
  }
}

export const relationStore = new RelationStore()
