import { ZeichenTabelle } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TabelleBlock } from './TabelleBlock'

ergaenzeEditorAngaben(TabelleBlock.blockType, {
  symbol: ZeichenTabelle,
})
