import { ZeichenText } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TextBlock } from './TextBlock'

ergaenzeEditorAngaben(TextBlock.blockType, {
  symbol: ZeichenText,
})
