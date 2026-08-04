// Editor-Angaben des Formularfelds — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

import { FormInput } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { FormFeldBlock } from './FormFeldBlock'

ergaenzeEditorAngaben(FormFeldBlock.blockType, {
  symbol: FormInput,
})
