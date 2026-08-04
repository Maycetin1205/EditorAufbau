// Editor-Angaben des Knopfs — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

import { MousePointerClick } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { ButtonBlock } from './ButtonBlock'

ergaenzeEditorAngaben(ButtonBlock.blockType, {
  symbol: MousePointerClick,
})
