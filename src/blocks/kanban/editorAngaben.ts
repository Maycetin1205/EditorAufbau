import { ZeichenKanban, ZeichenKanbanSpalte } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { KanbanBlock } from './KanbanBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

ergaenzeEditorAngaben(KanbanBlock.blockType, {
  symbol: ZeichenKanban,
})

ergaenzeEditorAngaben(KanbanSpalteBlock.blockType, {
  symbol: ZeichenKanbanSpalte,
})
