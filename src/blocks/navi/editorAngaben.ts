import { ZeichenNavi } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { NaviBlock } from './NaviBlock'
import { NaviEintragBlock } from './NaviEintragBlock'

ergaenzeEditorAngaben(NaviBlock.blockType, {
  symbol: ZeichenNavi,

  hinweis: 'Keine Einstellungen — „+ Eintrag" legt einen Eintrag an, eingestellt wird er selbst.',
})

ergaenzeEditorAngaben(NaviEintragBlock.blockType, {
  symbol: ZeichenNavi,
})
