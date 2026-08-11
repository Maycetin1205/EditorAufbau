// Editor-Angaben des Kanbans und seiner Spalte — Icons der Baustein-
// Bibliothek. Beide in EINER Datei, weil beide Bausteine in diesem Ordner
// wohnen. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).
//
// Die Spalte erscheint nicht in der Bibliothek (showInPalette false — sie
// entsteht nur ueber das Board); ihr Icon steht trotzdem hier, damit sie
// ueberall dort ein Gesicht hat, wo der Editor Bausteine auflistet.

// SquareKanban BLEIBT: ein Rahmen mit Saeulen verschiedener Hoehe ist schon das
// Miniaturbild eines Boards — daran gibt es nichts zu verbessern.
// Die Spalte traegt seit 2026-08-07 gestapelte Kaesten (Rows3) statt LayoutList:
// eine Spalte stapelt KARTEN, LayoutList zeichnete dagegen Listenzeilen mit
// Punkten davor, also eher eine Aufzaehlung.
import { Rows3, SquareKanban } from '../../ui/zeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { KanbanBlock } from './KanbanBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

ergaenzeEditorAngaben(KanbanBlock.blockType, {
  symbol: SquareKanban,
})

ergaenzeEditorAngaben(KanbanSpalteBlock.blockType, {
  symbol: Rows3,
})
