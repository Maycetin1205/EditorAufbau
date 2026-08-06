// spaltenBindung — der Registry-Eintrag, ueber den der Editor eine SPALTE
// bearbeitet: an welches Feld sie gebunden ist, wie sie dargestellt wird und
// (bei Status) was ihre Datenwerte bedeuten.
//
// Aus TabelleBlock herausgeloest (2026-08-06), weil die Baustein-Datei mit den
// Zusatzfeldern der Bild-Art ueber den 500-Zeilen-Deckel wuchs (check:regeln).
// Der Schnitt ist der natuerliche und derselbe wie bei den Nachbarn: hier die
// BESCHREIBUNG der Spalten-Bedienung, drueben der Baustein.
//
// Alles hier sind reine Registry-DATEN. Gezeichnet wird das Fenster vom
// generischen Feld-Picker (editor/canvas/FieldPicker + FeldBindung), der weder
// „Tabelle" noch „Spalte" kennt (Regel 2).

import type { ListenBindung } from '../../core/blocks/BlockDefinition'
import { STATUS_BEDEUTUNGEN } from '../shared/statusVariant'
import { STANDARD_TITEL } from './spalten'
import {
  ART_STATUS,
  ART_TEXT,
  FELDER_KEY,
  SPALTEN_ART_OPTIONEN,
} from './spaltenArten'

// Jede SPALTE ist eine bindbare Stelle (Regel 2): der Editor oeffnet den
// Feld-Picker generisch ueber diesen Eintrag — er kennt die Tabelle nicht.
export const SPALTEN_BINDUNG: ListenBindung = {
  prop: 'spalten',
  titelKey: 'titel',
  feldKey: 'feld',
  standardTitel: STANDARD_TITEL,
  // Die DARSTELLUNG einer Spalte (2026-08-06) wird am selben Ort eingestellt
  // wie ihr Feld: ein Klick auf den Spaltenkopf, ein Fenster, zwei Handgriffe
  // (Regel 7 — Bedienung am Ding, kein Inspector-Feld). Die Optionen kommen aus
  // derselben Liste, aus der ./tabelleKoerper zeichnet — angebotene und
  // gezeichnete Arten koennen damit nicht auseinanderlaufen.
  //
  // `felderKey` gehoert dazu, seit eine Darstellung MEHR als ein Feld braucht
  // („Bild + Name"): unter diesem Schluessel legt der Picker die zusaetzlichen
  // Bindungen der gewaehlten Option im Eintrag ab. WELCHE das sind, bringt die
  // Option selbst mit (SPALTEN_ART_OPTIONEN).
  eintragsWahl: {
    key: 'art',
    label: 'Darstellung',
    optionen: SPALTEN_ART_OPTIONEN,
    standard: ART_TEXT,
    felderKey: FELDER_KEY,
  },
  // Die Status-Zuordnung (2026-08-06), am selben Ort wie Darstellung und Feld —
  // und NUR an einer Status-Spalte (nurBeiWahl). Sie ist freiwillig: ohne sie
  // zeigt die Marke den Datenwert grau. Waehlbar sind BEDEUTUNGEN, nie Farben;
  // die Farbe haengt fest an der Bedeutung (../shared/statusVariant, dieselbe
  // Liste wie im Inspector der Kanban-Spalte).
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
