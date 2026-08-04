// Editor-Angaben des Popups — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

import { AppWindow } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { PopupBlock } from './PopupBlock'

ergaenzeEditorAngaben(PopupBlock.blockType, {
  symbol: AppWindow,
})
