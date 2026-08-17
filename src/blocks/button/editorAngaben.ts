import { ZeichenSchaltflaeche } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { ButtonBlock } from './ButtonBlock'

ergaenzeEditorAngaben(ButtonBlock.blockType, {
  symbol: ZeichenSchaltflaeche,
})
