// Editor-Angaben des Datumsfelds — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

import { CalendarDays } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { DatumBlock } from './DatumBlock'

ergaenzeEditorAngaben(DatumBlock.blockType, {
  symbol: CalendarDays,
})
