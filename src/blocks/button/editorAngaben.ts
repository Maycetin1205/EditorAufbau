// Editor-Angaben des Knopfs — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Das Symbol zeigt das DING, nicht was man damit tut: ein Knopf ist ein
// Rechteck. MousePointerClick (bis 2026-08-05) zeichnete einen Mauszeiger mit
// Klick-Strahlen — in einer Liste, in der jede Zeile anklickbar ist, stand
// dort das Symbol für „anklickbar" statt für „Knopf".
//
// Beim Symbol-Durchgang 2026-08-07 BLEIBT es dabei, und der leere Kasten ist
// jetzt Teil eines Paares: das Formularfeld traegt denselben Kasten MIT Inhalt
// (RectangleEllipsis). Beides sind Kaesten auf der Maske — der eine ist zum
// Druecken, der andere zum Ausfuellen.
import { RectangleHorizontal } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { ButtonBlock } from './ButtonBlock'

ergaenzeEditorAngaben(ButtonBlock.blockType, {
  symbol: RectangleHorizontal,
})
