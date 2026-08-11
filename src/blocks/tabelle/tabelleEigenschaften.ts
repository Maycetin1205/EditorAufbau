// tabelleEigenschaften — was der Inspector zur Tabelle anbietet.
//
// Aus TabelleBlock herausgeloest (2026-08-05), als der Zeilen-Waehler die
// Datei ueber den 500-Zeilen-Deckel schob (check:regeln). Reine Deklaration:
// die Registry liest sie, Inspector und Export lesen sie generisch (Regel 2).
//
// Was hier NICHT steht, ist ebenso Absicht: alles, was der Bauer am DING sehen
// und anfassen kann, gehoert an das Ding und nicht in den Inspector (Regel 7).

import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { leerTextProperty } from '../shared/leerZustand'

// Ja/Nein-Umschalter — dieselben zwei Optionen an jeder Stelle, damit nicht
// eine Sektion „Ja/Nein" und die naechste „An/Aus" sagt.
const JA_NEIN = [{ value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }]

export const TABELLE_EIGENSCHAFTEN: PropertyDescription[] = [
  {
    attributeName: 'suche',
    name: 'Suchzeile',
    description: 'Zeigt über der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.',
    kind: 'segment',
    options: JA_NEIN,
    requiresDataSource: true,
  },
  // WIE VIELE Zeilen eine Seite zeigt, ist KEINE Einstellung mehr — es passen
  // so viele hinein, wie hineinpassen (Nutzer-Entscheidung 2026-08-11, S2.1).
  // Die Vorgeschichte in drei Saetzen, damit sie nicht wiederkehrt: bis
  // 2026-07-27 stand „Zeilen pro Seite" zweimal (Inspector UND Fusszeile),
  // danach startete die Maske fest mit 10 Zeilen und trug den Waehler
  // bedingungslos; ab 2026-08-05 stellte der Bauer den Bauplan am Ding ein
  // (`proSeite`) und eine zweite Eigenschaft hier (`zeilenWaehler`) entschied,
  // ob der Bediener uebersteuern darf. Beide Props sind weg — eine feste Zahl
  // liess in einer hohen Tabelle Platz stehen und erzwang in einer flachen
  // Scrollen, und eine Tabelle scrollt nie innen.
  {
    attributeName: 'tagField',
    name: 'Tag filtern nach',
    description: 'Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Sätze des Tages, den der Tageswähler zeigt. Leer = alle Sätze.',
    kind: 'field',
  },
  // Der Leerzustand-Satz (shared/leerZustand — dieselbe Eigenschaft am Kanban).
  // Er gehoert in den Inspector und nicht ans Ding: im Editor ist die Tabelle
  // nie leer (dort stehen die Platzhalter-Striche), der Satz waere also am
  // Ding gar nicht zu sehen.
  leerTextProperty(),
]
