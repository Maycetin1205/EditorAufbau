// Editor-Angaben des Textes — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Ein Buchstabe heisst „Text". Das Symbol `Text` (bis 2026-08-07) zeichnete
// mehrere Absatzzeilen — das ist ein Textblock im Sinne von Fliesstext, waehrend
// dieser Baustein meistens eine einzelne Zeile oder Ueberschrift traegt.
import { Type } from '../../ui/zeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TextBlock } from './TextBlock'

ergaenzeEditorAngaben(TextBlock.blockType, {
  symbol: Type,
})
