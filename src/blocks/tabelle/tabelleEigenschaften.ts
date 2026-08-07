// tabelleEigenschaften — was der Inspector zur Tabelle anbietet.
//
// Aus TabelleBlock herausgeloest (2026-08-05), als der Zeilen-Waehler die
// Datei ueber den 500-Zeilen-Deckel schob (check:regeln). Reine Deklaration:
// die Registry liest sie, Inspector und Export lesen sie generisch (Regel 2).
//
// Was hier NICHT steht, ist ebenso Absicht — siehe der Block ueber
// `zeilenWaehler`: alles, was der Bauer am DING sehen und anfassen kann,
// gehoert an das Ding und nicht in den Inspector (Regel 7).

import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { leerTextProperty } from '../shared/leerZustand'

// Ja/Nein-Umschalter — dieselben zwei Optionen an jeder Stelle, damit nicht
// eine Sektion „Ja/Nein" und die naechste „An/Aus" sagt.
const JA_NEIN = [{ value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }]

export const TABELLE_EIGENSCHAFTEN: PropertyDescription[] = [
  {
    attributeName: 'suche',
    name: 'Suchzeile',
    description: 'Zeigt ueber der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.',
    kind: 'segment',
    options: JA_NEIN,
    requiresDataSource: true,
  },
  // WIE VIELE Zeilen eine Seite zeigt, steht bewusst NICHT hier im Inspector,
  // sondern unten an der Tabelle selbst (Regel 7 — Bedienung am Ding):
  // derselbe Waehler in der Fusszeile ist im Editor bedienbar und schreibt den
  // Bauplan (`proSeite`). Der Inspector regelt nur die FRAGE, die man am Ding
  // nicht sehen kann — ob der Bediener ihn spaeter auch umstellen darf.
  //
  // Vorgeschichte, damit die Wege nicht wieder auseinanderlaufen: bis
  // 2026-07-27 stand „Zeilen pro Seite" zweimal (Inspector UND Fusszeile),
  // danach gar nicht mehr — die Maske startete fest mit 10 Zeilen und der
  // Waehler stand bedingungslos in jeder exportierten Maske. Seit 2026-08-05
  // (Nutzer-Entscheidung) gilt die Aufteilung oben: der Bauer stellt ein, der
  // Bediener darf nur umstellen, wenn es ihm erlaubt wurde.
  {
    attributeName: 'zeilenWaehler',
    name: 'Zeilen-Wähler',
    description: 'Zeigt dem Bediener unten in der Maske den Wähler „Zeilen pro Seite" — er darf die Einstellung dann für seine Sitzung übersteuern. Nein: es gilt unveränderlich, was hier im Editor eingestellt ist.',
    kind: 'segment',
    options: JA_NEIN,
    requiresDataSource: true,
  },
  {
    attributeName: 'tagField',
    name: 'Tag filtern nach',
    description: 'Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Saetze des Tages, den der Tageswaehler zeigt. Leer = alle Saetze.',
    kind: 'field',
  },
  // Der Leerzustand-Satz (shared/leerZustand — dieselbe Eigenschaft am Kanban).
  // Er gehoert in den Inspector und nicht ans Ding: im Editor ist die Tabelle
  // nie leer (dort stehen die Platzhalter-Striche), der Satz waere also am
  // Ding gar nicht zu sehen.
  leerTextProperty(),
]
