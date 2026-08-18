import type { ListenBindung } from '../../core/blocks/BlockDefinition'
import { STATUS_BEDEUTUNGEN } from '../shared/statusVariant'
import {
  ERFASSUNG_KEY,
  ERFASSUNG_STELLE,
  ROLLE_FREI,
  ROLLE_KEY,
  ROLLEN_MIT_QUELLE,
  ROLLEN_OPTIONEN,
  ROLLEN_QUELLE_KEY,
  VORBELEGUNG_KEY,
} from './erfassungsRollen'
import { STANDARD_TITEL } from './spalten'
import {
  ART_STATUS,
  ART_TEXT,
  FELDER_KEY,
  SPALTEN_ART_OPTIONEN,
} from './spaltenArten'

export const SPALTEN_BINDUNG: ListenBindung = {
  prop: 'spalten',
  titelKey: 'titel',
  feldKey: 'feld',
  standardTitel: STANDARD_TITEL,

  eintragsWahl: {
    key: 'art',
    label: 'Darstellung',
    optionen: SPALTEN_ART_OPTIONEN,
    standard: ART_TEXT,
    felderKey: FELDER_KEY,
  },

  eintragsZuordnung: {
    key: 'zuordnung',
    label: 'Status-Zuordnung',
    nurBeiWahl: ART_STATUS,
    wertLabel: 'Datenwert',
    nameLabel: 'Klarname',
    bedeutungLabel: 'Bedeutung',
    bedeutungen: STATUS_BEDEUTUNGEN,
  },

  // Die zweite Bedienstelle derselben Spalte: am Kopf wird das Feld
  // gebunden, in der Erfassungszeile die Rolle gestellt.
  zweiteStelle: {
    stelle: ERFASSUNG_STELLE,
    eintragsWahl: {
      key: ROLLE_KEY,
      label: 'Rolle',
      optionen: ROLLEN_OPTIONEN,
      standard: ROLLE_FREI,
      felderKey: ERFASSUNG_KEY,
    },
    quelleKey: ROLLEN_QUELLE_KEY,
    nurBeiWahl: [
      { key: VORBELEGUNG_KEY, wahl: [ROLLE_FREI] },
      { key: ROLLEN_QUELLE_KEY, wahl: ROLLEN_MIT_QUELLE },
    ],
  },
}
