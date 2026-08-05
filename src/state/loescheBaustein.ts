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

import type { Editor } from './Editor'

const MUSTERKARTE_GESCHUETZT =
  'Hier liegt die Musterkarte — aus ihr entstehen die Datenkarten, sie kann '
  + 'nicht gelöscht werden. Ziehe sie erst in eine andere Spalte.'

// `frageNach` ist die ZUSAETZLICHE Rueckfrage des Aufrufers (das Kreuzchen
// fragt, wenn der Baustein Inhalte traegt). Sie laeuft erst, wenn ueberhaupt
// geloescht werden darf — sonst fragte der Editor erst und erklaerte danach,
// dass es gar nicht geht.
export function loescheBaustein(
  editor: Editor,
  id: string,
  frageNach?: () => boolean,
): void {
  if (editor.isRemoveProtected(id)) {
    window.alert(MUSTERKARTE_GESCHUETZT)
    return
  }
  if (frageNach && !frageNach()) return
  editor.removeBlock(id)
}
