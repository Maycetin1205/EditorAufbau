import { ZeichenDatum } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { DatumBlock } from './DatumBlock'

ergaenzeEditorAngaben(DatumBlock.blockType, {
  symbol: ZeichenDatum,

  hinweis: 'Keine Einstellungen — der Tag wird am Baustein gewählt; wer ihm folgt, stellst du an Tabelle und Kanban ein.',
})
