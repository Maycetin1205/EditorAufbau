// Editor-Angaben der Ansicht — Hinweiszeile im Inspector. Diese Datei laedt
// NUR der Editor, nie das Runtime-Buendel (Begruendung: editorAngaben in
// core/blocks).
//
// KEIN Symbol: die Ansicht steht nicht in der Bibliothek (showInPalette
// false) — sie entsteht ueber die Seiten-Leiste, wie die Popup-Seite. Der
// Hinweis dagegen wird gebraucht: unmittelbar nach dem Anlegen ist die neue
// Seite ausgewaehlt, und ihr Inspector-Panel waere sonst wortlos leer
// (dieselbe Luecke, die U6 beim Datum und beim Popup geschlossen hat).

import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { AnsichtBlock } from './AnsichtBlock'

ergaenzeEditorAngaben(AnsichtBlock.blockType, {
  hinweis: 'Keine Einstellungen — Name per Doppelklick am Seiten-Reiter, Bausteine auf der Fläche.',
})
