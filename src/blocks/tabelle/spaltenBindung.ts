import type { ListenBindung } from '../../core/blocks/BlockDefinition'
import { STATUS_BEDEUTUNGEN } from '../shared/statusVariant'
import { STANDARD_TITEL, SUCHT_IN_KEY } from './spalten'
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

  // Wo die Erfassungszelle dieser Spalte sucht. Die Optionen sind die
  // Verknuepfungen des Bausteins — der Editor setzt sie ein, nicht die
  // Registry (die kennt sie nicht).
  eintragsQuellenWahl: {
    key: SUCHT_IN_KEY,
    label: 'Sucht beim Erfassen in',
    leerName: 'frei',
    nurBeiErfassung: true,
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
}
