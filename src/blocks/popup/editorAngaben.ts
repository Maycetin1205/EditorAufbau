import { ZeichenPopup } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { DIALOG_MIN_BREITE, DIALOG_MIN_HOEHE } from '../shared/DialogRahmen'
import { PopupBlock } from './PopupBlock'

ergaenzeEditorAngaben(PopupBlock.blockType, {
  symbol: ZeichenPopup,

  hinweis: 'Keine Einstellungen — Titel per Doppelklick am Fensterkopf, Größe an den Anfassern.',

  // Die Mindestmasse sind die des Dialog-Rahmens, den das Popup komponiert —
  // vorher standen dieselben zwei Zahlen ein zweites Mal im Canvas.
  ziehbareGroesse: {
    breiteProp: 'breite',
    hoeheProp: 'hoehe',
    minBreite: DIALOG_MIN_BREITE,
    minHoehe: DIALOG_MIN_HOEHE,
    faktor: 2,
  },
})
