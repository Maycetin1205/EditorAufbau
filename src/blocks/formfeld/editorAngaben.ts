import { ZeichenFormularfeld } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { FormFeldBlock } from './FormFeldBlock'

ergaenzeEditorAngaben(FormFeldBlock.blockType, {
  symbol: ZeichenFormularfeld,
})
