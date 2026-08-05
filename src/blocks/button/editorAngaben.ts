// Editor-Angaben des Knopfs — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Das Symbol zeigt das DING, nicht was man damit tut: ein Knopf ist ein
// Rechteck. MousePointerClick (bis 2026-08-05) zeichnete einen Mauszeiger mit
// Klick-Strahlen — in einer Liste, in der jede Zeile anklickbar ist, stand
// dort das Symbol für „anklickbar" statt für „Knopf".
import { RectangleHorizontal } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { ButtonBlock } from './ButtonBlock'

ergaenzeEditorAngaben(ButtonBlock.blockType, {
  symbol: RectangleHorizontal,
})
