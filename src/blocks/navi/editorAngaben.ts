// Editor-Angaben der Navi — Icon der Baustein-Bibliothek + Hinweiszeilen im
// Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

import { ZeichenNavi } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { NaviBlock } from './NaviBlock'
import { NaviEintragBlock } from './NaviEintragBlock'

ergaenzeEditorAngaben(NaviBlock.blockType, {
  symbol: ZeichenNavi,
  // Die Navi selbst fuehrt keine einzige Eigenschaft — alles Einstellbare
  // sitzt am Eintrag. Ohne diesen Satz waere ihr Panel wortlos leer (die
  // Luecke, die U6 an Datum und Popup geschlossen hat).
  hinweis: 'Keine Einstellungen — „+ Eintrag" legt einen Eintrag an, eingestellt wird er selbst.',
})

ergaenzeEditorAngaben(NaviEintragBlock.blockType, {
  symbol: ZeichenNavi,
})
