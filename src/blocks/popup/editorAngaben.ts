import { ZeichenPopup } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { PopupBlock } from './PopupBlock'

ergaenzeEditorAngaben(PopupBlock.blockType, {
  symbol: ZeichenPopup,

  hinweis: 'Keine Einstellungen — Titel per Doppelklick am Fensterkopf, Größe an den Anfassern.',
})
