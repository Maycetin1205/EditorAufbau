// Editor-Angaben des Datumsfelds — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Der schlichte Kalender. CalendarDays (bis 2026-08-07) hatte sechs Tagespunkte
// im Blatt — bei 16px ein grauer Fleck, der nur unruhig wirkte.
import { Calendar } from '../../ui/zeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { DatumBlock } from './DatumBlock'

ergaenzeEditorAngaben(DatumBlock.blockType, {
  symbol: Calendar,
})
