// maskenRand — der Rand der Maskenflaeche als Registry-Faehigkeit (N2.1).
//
// Es gibt Bausteine, die NICHT in eine Rasterzelle gehoeren, sondern an den
// Rand der ganzen Maske: die Navi ist im Vorbild eine Leiste, die links,
// oben und unten am echten Fensterrand anliegt. Das Raster kann das nicht
// leisten — es haelt bewusst Abstand zum Rand (ROOT_FLOW.padding), und genau
// dieser Abstand war der Nutzer-Befund „nicht buendig".
//
// Statt das Raster fuer alle aufzuweichen oder Navi-Sondercode einzubauen
// (Regel 2), deklariert der Baustein die Faehigkeit `maskenRand`. Sie sagt
// zwei Dinge, die dasselbe bedeuten — der Baustein gehoert zum RAHMEN der
// Maske, nicht zu einer Seite:
//   1. er liegt am Rand der Flaeche statt in einer Zelle (randItemStyle),
//   2. er ist auf JEDER Flaechen-Seite zu sehen (Hauptseite wie Ansicht),
//      denn ein Rahmen wechselt nicht mit dem Inhalt.
//
// Die Masse kommen aus der echten empfang-Maske
// (docs/chef-maske/empfang/index.basis.source.html, `.vnav`: 72 px schmal,
// 224 px offen). Die schmale Breite ist auf 56 gekuerzt (Nutzer-Ansage
// 2026-08-12: „ein Klotz"): das Vorbild braucht seine 72 px fuer Marke und
// Bediener-Fuss, die es bei uns ausdruecklich nicht gibt — uebrig bleibt das
// Zeichen (20 px) mit dem Rhythmus des Vorbilds darum herum. Offen bleibt es
// bei 224.
// Sie stehen HIER und nicht im Baustein, weil beide Seiten sie brauchen — die
// Flaeche haelt die schmale Breite frei (randPlatzLinks), die Leiste selbst
// fuellt sie aus. Zwei Zahlen an zwei Stellen wuerden auseinanderlaufen
// (dieselbe Lehre wie DIALOG_RAND).

import { getBlockDefinition } from './blockRegistry'
import type { BlockNode, BlockTree } from './BlockData'

// Breite der Leiste: geschlossen (haelt die Flaeche frei) und aufgeklappt
// (legt sich UEBER die Flaeche, verschiebt nie Inhalt).
export const RAND = { breite: 56, breiteOffen: 224 } as const

// Traegt dieser Baustein die Faehigkeit? Registry-Frage, kein `if type===`.
export function istRandBaustein(node: BlockNode): boolean {
  return getBlockDefinition(node.type)?.maskenRand === true
}

// CSS des Rand-ITEMS — DIESELBE Quelle fuer Editor-Canvas und Export
// (Regel 1), das Gegenstueck zu rasterItemStyle fuer Bausteine am Rand.
//
// `position: absolute` OHNE gesetzten Bezugspunkt ist hier Absicht: der
// naechste positionierte Vorfahr ist in BEIDEN Welten genau die sichtbare
// Maskenflaeche — im Export gibt es gar keinen (also das Fenster selbst,
// `body` und `.ff-root` sind statisch), im Editor ist es das „Blatt", auf
// dem die Maske liegt. Dieselbe Bauart benutzt das Popup schon
// (PopupBlock: :host([offen]) { position: absolute; inset: 0 }).
// Folge, und die ist gewollt: die Leiste rollt NICHT mit dem Inhalt weg —
// die Rasterflaeche darunter scrollt, der Rahmen bleibt stehen.
//
// KEINE Breite: die bestimmt der Baustein selbst (sie haengt bei der Navi am
// Auf-/Zuklappen). Eine Breite von hier waere ein style-Attribut und wuerde
// jede Regel des Bausteins schlagen — im Editor blieb der Auswahlrahmen dann
// auf der schmalen Spur stehen und lief mitten durch die offene Leiste
// (Nutzer-Befund 2026-08-12).
export function randItemStyle(): Record<string, string | number> {
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    // Ueber der Flaeche, unter dem Popup (das steht auf 10).
    zIndex: 5,
  }
}

// Wieviel Platz die Maskenflaeche links freihalten muss, damit die Leiste
// keinen Baustein verdeckt — das Gegenstueck zum `.vnav-spacer` des
// Vorbilds. 0, solange die Maske keinen Rand-Baustein hat: eine Maske ohne
// Navi bleibt Byte fuer Byte, wie sie war.
export function randPlatzLinks(tree: BlockTree): number {
  for (const node of Object.values(tree)) {
    if (node && istRandBaustein(node)) return RAND.breite
  }
  return 0
}
