// segmentIcons — Options-Wert eines Segment-Controls -> Symbol.
//
// Reine Editor-seitige Zuordnungstabelle (Muster blockIcons/optionColors;
// Regel 2: Daten-Tabelle statt Sondercode). Die Symbole bleiben in der
// Editor-UI und kommen NIE ins Runtime-Buendel — die Eigenschaft in der Baustein-Datei
// ist nur ein 'segment' mit Klarnamen-Optionen. Traegt ein Options-Wert hier
// ein Icon, zeigt das Segment das Icon (Klarname als Tooltip/aria-label),
// sonst den Klarnamen als Text.

import { createElement, type ReactElement } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  type Zeichen,
  type ZeichenProps,
} from '@/ui/zeichen'

const ICONS: Record<string, Zeichen> = {
  links: AlignLeft,
  mitte: AlignCenter,
  rechts: AlignRight,
}

export function segmentIcon(value: string, props?: ZeichenProps): ReactElement | undefined {
  const icon = ICONS[value]
  return icon ? createElement(icon, props) : undefined
}
