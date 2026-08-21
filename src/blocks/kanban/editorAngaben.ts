import { ZeichenKanban, ZeichenKanbanSpalte } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { KanbanBlock } from './KanbanBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'
import { KanbanZimmerBlock } from './KanbanZimmerBlock'

ergaenzeEditorAngaben(KanbanBlock.blockType, {
  symbol: ZeichenKanban,
})

ergaenzeEditorAngaben(KanbanSpalteBlock.blockType, {
  symbol: ZeichenKanbanSpalte,
  nameProps: ['heading'],
})

// Das Zimmer hatte bisher gar keine Editor-Angaben. Sein Klarname kam nur
// zufaellig durch, weil der alte Auswendig-Merker 'heading' kannte.
ergaenzeEditorAngaben(KanbanZimmerBlock.blockType, {
  nameProps: ['heading'],
})
