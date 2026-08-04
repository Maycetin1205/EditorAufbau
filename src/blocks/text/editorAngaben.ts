// Editor-Angaben des Textes — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

import { Text } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TextBlock } from './TextBlock'

ergaenzeEditorAngaben(TextBlock.blockType, {
  symbol: Text,
})
