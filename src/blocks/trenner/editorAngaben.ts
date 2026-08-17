import { ZeichenTrenner } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TrennerBlock } from './TrennerBlock'

ergaenzeEditorAngaben(TrennerBlock.blockType, {
  symbol: ZeichenTrenner,
})
