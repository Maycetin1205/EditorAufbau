// Editor-Angaben der Tabelle — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Table BLEIBT: ein Raster mit abgesetzter Kopfzeile ist genau das, was der
// Baustein auf der Maske zeichnet. Beim Symbol-Durchgang 2026-08-07 gepruefT
// und nicht getauscht — ein richtiges Symbol gegen ein neues zu tauschen waere
// Bewegung ohne Gewinn.
import { Table } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TabelleBlock } from './TabelleBlock'

ergaenzeEditorAngaben(TabelleBlock.blockType, {
  symbol: Table,
})
