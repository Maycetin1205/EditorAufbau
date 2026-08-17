// feldEigenschaften — was der Inspector zum Formularfeld anbietet.
//
// Aus FormFeldBlock herausgeloest (2026-08-05), als „Einzigen Treffer
// uebernehmen" die Datei ueber den 500-Zeilen-Deckel schob (check:regeln).
// Reine Deklaration: die Registry liest sie, Inspector und Export lesen sie
// generisch (Regel 2). Derselbe Schnitt wie tabelle/tabelleEigenschaften.ts.
//
// Die Klarnamen stehen hier, die Technikwerte (text/number/nachschlagen …)
// arbeiten unsichtbar darunter — Regel 3.

import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Alles, was NUR beim Nachschlagen gilt, haengt an derselben Bedingung. EINE
// Konstante dafuer: sonst zeigt beim naechsten Feldtyp die eine Sektion noch
// und die andere schon nicht mehr.
const NUR_NACHSCHLAGEN = { attributeName: 'fieldType', equals: 'nachschlagen' } as const

export const FELD_EIGENSCHAFTEN: PropertyDescription[] = [
  {
    attributeName: 'fieldType',
    name: 'Feldtyp',
    description: 'Welche Art Eingabe das Feld annimmt.',
    kind: 'select',
    options: [
      { value: 'text', label: 'Text' },
      { value: 'number', label: 'Zahl' },
      { value: 'textarea', label: 'Mehrzeilig' },
      { value: 'select', label: 'Auswahl' },
      { value: 'date', label: 'Datum' },
      // Uhrzeit liefert „15:00" — genau die Form, in der SoftEngine Zeiten
      // schreibt (Feld-Art 'Z', belegt im empfang-Log des Nutzers 2026-08-12).
      // Anders als beim Datum wird deshalb NICHTS umgerechnet.
      { value: 'time', label: 'Uhrzeit' },
      { value: 'checkbox', label: 'Ankreuzfeld' },
      { value: 'nachschlagen', label: 'Nachschlagen' },
    ],
  },
  {
    attributeName: 'options',
    name: 'Auswahl-Optionen',
    description: 'Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.',
    kind: 'text',
    visibleWhen: { attributeName: 'fieldType', equals: 'select' },
  },
  {
    attributeName: 'nachschlagQuelle',
    name: 'Quelle',
    description: 'Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.',
    kind: 'quelle',
    visibleWhen: NUR_NACHSCHLAGEN,
  },
  {
    attributeName: 'anzeigeFeld',
    name: 'Angezeigt wird',
    description: 'Feld der Nachschlage-Quelle, dessen Wert der Bediener sieht (z. B. der Name).',
    kind: 'field',
    quelleProp: 'nachschlagQuelle',
    klarnameProp: 'anzeigeTitel',
    visibleWhen: NUR_NACHSCHLAGEN,
  },
  {
    attributeName: 'speicherFeld',
    name: 'Gespeichert wird',
    description: 'Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer).',
    kind: 'field',
    quelleProp: 'nachschlagQuelle',
    klarnameProp: 'speicherTitel',
    visibleWhen: NUR_NACHSCHLAGEN,
  },
  // Nutzer-Entscheidung 2026-08-05. Der Fall: ein Kunde-Feld und ein
  // Haustier-Feld, das ihm folgt. Hat der Kunde genau EIN Haustier, ist die
  // Lupe eine Handbewegung ohne Wahl — es gibt nichts zu waehlen. Standard
  // bleibt NEIN: ein Feld, das sich von selbst fuellt, muss der Bauer wollen
  // (Regel 7 — der Editor erfindet nichts).
  {
    attributeName: 'einzigerTreffer',
    name: 'Einzigen Treffer übernehmen',
    description: 'Bleibt in der Maske genau EIN Satz übrig (weil das Feld der Auswahl eines anderen folgt), übernimmt es diesen von selbst — ohne dass der Bediener die Lupe drückt. Nur in ein leeres Feld; die Lupe bleibt daneben bedienbar.',
    kind: 'segment',
    options: [{ value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }],
    visibleWhen: NUR_NACHSCHLAGEN,
  },
  {
    attributeName: 'valueField',
    name: 'Feld',
    description: 'Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.',
    kind: 'field',
    // NICHT am Nachschlage-Feld: dort ENTSTEHT der Wert durch die Auswahl
    // im Fenster. Eine Datenbindung obendrauf ueberschriebe ihn bei jedem
    // SE-Push, waehrend das Feld weiter den Klarwert zeigte — Anzeige und
    // Ketten-Wert liefen still auseinander.
    visibleWhen: { attributeName: 'fieldType', notEquals: 'nachschlagen' },
  },
]
