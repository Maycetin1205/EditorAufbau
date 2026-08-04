// Editor-Angaben der Trennlinie — Icon der Baustein-Bibliothek + Hinweiszeile
// im Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

import { Minus } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TrennerBlock } from './TrennerBlock'

ergaenzeEditorAngaben(TrennerBlock.blockType, {
  symbol: Minus,
  hinweis: 'Keine Einstellungen — die Linie füllt die Breite von selbst.',
})
