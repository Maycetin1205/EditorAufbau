// RelationStore
// Die Relations-Vorlagen-Bibliothek: duenner Ableger des gemeinsamen
// Fundaments (VorlagenStore.ts — dort wohnen Laden, Bereinigen, Melden und
// das entprellte Speichern). Hier steht nur, was DIESE Bibliothek ausmacht.
//
// Relation-Vorlagen sind BENUTZERDEFINIERT — GET/PUT-Relations sind je
// SoftEngine-Installation individuell (>1000 moeglich). Persistiert in
// localStorage NEBEN den Baeumen und Datenquellen.
//
// Beim allerersten Start wird der mitgelieferte Startbestand
// (BUILTIN_RELATION_TEMPLATES = der Standard-PUT) eingespielt; danach gehoeren
// die Vorlagen dem Bediener — auch das Loeschen der mitgelieferten ueberlebt
// den Reload, es wird nie ungefragt neu eingespielt.

import {
  BUILTIN_RELATION_TEMPLATES,
  sanitizeRelationTemplates,
  type RelationTemplate,
} from '../core/data/relations'
import { VorlagenStore, type VorlagenBauplan } from './VorlagenStore'

const BAUPLAN: VorlagenBauplan<RelationTemplate> = {
  schluessel: 'aufbau_editor_relationen_v1',
  huelle: 'relations',
  klarnameLesen: 'Relations-Vorlagen',
  // Bewusst abweichend vom Lese-Klarnamen — so steht der Text seit 2026-07-28
  // vor dem Bediener (siehe VorlagenBauplan.klarnameSchreiben).
  klarnameSchreiben: 'Relationen',
  bereinige: sanitizeRelationTemplates,
  startbestand: BUILTIN_RELATION_TEMPLATES,
}

export class RelationStore extends VorlagenStore<RelationTemplate> {
  constructor() {
    super(BAUPLAN)
  }
}

export const relationStore = new RelationStore()
