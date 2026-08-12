// Editor-Angaben des Popups — Icon der Baustein-Bibliothek + Hinweiszeile im
// Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

// Rechteck mit Kopfleiste = ein Dialog, so wie das Popup auf der Maske liegt.
// AppWindow (bis 2026-08-07) trug in der Kopfleiste noch drei Fensterknoepfe —
// Zubehoer eines Betriebssystem-Fensters, das ein SoftEngine-Popup nicht hat.
// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) kommt das Bild aus
// ui/bausteinZeichen: dasselbe Motiv, aber in der Fellnase-Machart.
import { ZeichenPopup } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { PopupBlock } from './PopupBlock'

ergaenzeEditorAngaben(PopupBlock.blockType, {
  symbol: ZeichenPopup,
  // Das Panel waere sonst wortlos leer: das Popup fuehrt keine einzige
  // Inspector-Eigenschaft, weil beides am Ding bedient wird — Titel per
  // Doppelklick am Fensterkopf (PopupBlock.inlineEdit), Groesse an den zwei
  // Anfassern der Popup-Seite (canvas/PopupSeite, breite/hoehe).
  hinweis: 'Keine Einstellungen — Titel per Doppelklick am Fensterkopf, Größe an den Anfassern.',
})
