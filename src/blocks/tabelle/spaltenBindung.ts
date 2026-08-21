import type { ListenBindung } from '../../core/blocks/BlockDefinition'
import { STATUS_BEDEUTUNGEN } from '../shared/statusVariant'
import { coerceSpalten, STANDARD_TITEL, SUCH_FELDER_KEY, SUCHT_IN_KEY } from './spalten'
import {
  ART_BILD,
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

  // Unter „Feld" stehen nur die Felder der Tabellen-Quelle: eine Spalte ist
  // ein Feld der Zeile, die entsteht. Was aus einer Hilfstabelle zu sehen sein
  // soll, waehlt „Zeigt beim Suchen" (Nutzer-Ansage 2026-08-20).
  nurEigeneQuelle: true,

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

  // Was beim Suchen zu sehen ist — je Spalte gewaehlt, nicht abgeleitet.
  eintragsFelderWahl: {
    key: SUCH_FELDER_KEY,
    label: 'Zeigt beim Suchen',
    quelleAusKey: SUCHT_IN_KEY,
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

/* Zeigt diese Tabelle Tierbilder? Nur die Spaltenart „Bild + Name" tut das.
   Die zehn Bilder sind 29,7 KB DATEN: bis 2026-08-21 lagen sie im
   Laufzeit-Buendel und damit in jeder Maske, auch in einer mit acht
   Textspalten. Der Export fragt diese Faehigkeit ueber die Registry
   (BlockDefinition.brauchtTierbilder) und gibt die Bilder nur dann mit. */
export function spaltenBrauchenTierbilder(props: Record<string, unknown>): boolean {
  return coerceSpalten(props[SPALTEN_BINDUNG.prop]).some((s) => s.art === ART_BILD)
}
