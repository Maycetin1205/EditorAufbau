// loescheBaustein — DER eine Weg, einen Baustein zu entfernen.
//
// Editor.removeBlock bricht fuer die geschuetzte Musterkarte kommentarlos ab
// (Loeschschutz, templateRules): ohne sie kann das Board keine Datenkarten
// erzeugen, und es gibt bewusst keinen „+ Karte"-Weg zurueck. Das Kreuzchen am
// Baustein erklaerte das seit je; der Inspector-Knopf und die Entf-Taste riefen
// removeBlock direkt — dort drueckte der Bediener „Loeschen" und es passierte
// SICHTBAR nichts. Ein toter Knopf ohne Rueckmeldung, gegen Regel 4.
//
// Jetzt gehen alle drei Wege hier durch, und die Erklaerung steht EINMAL da.
// Wer die Meldung aendert, aendert sie fuer alle drei.
//
// U2 (2026-08-12): Loeschen fragt NIE nach. Bis dahin hatte das Kreuzchen eine
// eigene Rueckfrage („… mit 3 Elementen darin loeschen?"), Entf und der
// Inspector-Knopf nicht — derselbe Baustein verschwand je Weg anders. Der
// Parameter `frageNach` dafuer ist ersatzlos weg (Nutzer-Entscheidung U0-3);
// das Netz ist Strg+Z.

import { meldungen } from './meldungen'
import type { Editor } from './Editor'

const MUSTERKARTE_GESCHUETZT =
  'Hier liegt die Musterkarte — aus ihr entstehen die Datenkarten, sie kann '
  + 'nicht gelöscht werden. Ziehe sie erst in eine andere Spalte.'

export function loescheBaustein(editor: Editor, id: string): void {
  if (editor.isRemoveProtected(id)) {
    meldungen.melde(MUSTERKARTE_GESCHUETZT)
    return
  }
  editor.removeBlock(id)
}
