// Editor-Angaben des Formularfelds — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Ein Kasten mit Inhalt darin. Zusammen mit der Schaltflaeche (leerer Kasten)
// ergibt das ein Paar, das man auseinanderhalten kann: beides sind Kaesten auf
// der Maske, nur traegt das Feld etwas. FormInput (bis 2026-08-07) setzte
// stattdessen einen Schreibcursor an den Rand — bei 16px ein Strich, den man
// fuer einen Teil des Rahmens hielt.
import { RectangleEllipsis } from '../../ui/zeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { FormFeldBlock } from './FormFeldBlock'

ergaenzeEditorAngaben(FormFeldBlock.blockType, {
  symbol: RectangleEllipsis,
})
