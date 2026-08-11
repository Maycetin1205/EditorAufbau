// Editor-Angaben des Popups — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Rechteck mit Kopfleiste = ein Dialog, so wie das Popup auf der Maske liegt.
// AppWindow (bis 2026-08-07) trug in der Kopfleiste noch drei Fensterknoepfe —
// Zubehoer eines Betriebssystem-Fensters, das ein SoftEngine-Popup nicht hat.
import { PanelTop } from '../../ui/zeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { PopupBlock } from './PopupBlock'

ergaenzeEditorAngaben(PopupBlock.blockType, {
  symbol: PanelTop,
})
