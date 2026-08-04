// Editor-Angaben der Tabelle — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

import { Table } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TabelleBlock } from './TabelleBlock'

ergaenzeEditorAngaben(TabelleBlock.blockType, {
  symbol: Table,
})
