// Editor-Angaben des Kanbans und seiner Spalte — Icons der Baustein-
// Bibliothek. Beide in EINER Datei, weil beide Bausteine in diesem Ordner
// wohnen. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).
//
// Die Spalte erscheint nicht in der Bibliothek (showInPalette false — sie
// entsteht nur ueber das Board); ihr Icon steht trotzdem hier, damit sie
// ueberall dort ein Gesicht hat, wo der Editor Bausteine auflistet.

import { LayoutList, SquareKanban } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { KanbanBlock } from './KanbanBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

ergaenzeEditorAngaben(KanbanBlock.blockType, {
  symbol: SquareKanban,
})

ergaenzeEditorAngaben(KanbanSpalteBlock.blockType, {
  symbol: LayoutList,
})
