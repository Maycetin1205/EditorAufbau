// selectionOps — Aufklapp-Auswahl auf der Rasterfläche.
// Verhaltensgleich herausgezogen aus Editor.ts:
// kein Zustand, kein DOM — alles wird hereingereicht, zurück kommt nur das
// Ziel (null = nichts auswählen). Wer auswählt und wer meldet, bleibt Sache
// des Stores.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { istSeitenBaustein } from './pageOps'

// Nutzer-Regel 2026-07-23 („Kanban-Problem"): ein Klick wählt IMMER zuerst den
// obersten Baustein unter dem Zeiger (das Board — egal, wo hineingeklickt
// wurde); ein weiterer Klick in den bereits gewählten steigt EINE Ebene tiefer
// (Board → Spalte → Karte). Registry-frei: die Kette entsteht aus dem Baum bis
// zur nächsten Rasterfläche (Wurzel/Popup-Rumpf). `clickedId` ist der TIEFSTE
// Baustein unter dem Zeiger (der innerste BlockHost fängt den Klick zuerst ab).
export function drillDownZiel(
  tree: BlockTree,
  clickedId: string,
  selectedId: string | null,
): string | null {
  const node = tree[clickedId]
  if (!node || clickedId === ROOT_ID) return null
  const kette: string[] = []
  let cur: BlockNode | undefined = node
  while (cur && cur.id !== ROOT_ID) {
    kette.unshift(cur.id)
    const parent: BlockNode | undefined = cur.parentId ? tree[cur.parentId] : undefined
    // Oberste Ebene erreicht, sobald das Elternteil eine Rasterfläche ist.
    if (!parent || parent.id === ROOT_ID || istSeitenBaustein(parent)) break
    cur = parent
  }
  if (kette.length === 0) return null
  const i = selectedId ? kette.indexOf(selectedId) : -1
  // In der Kette → eine Ebene tiefer (am Grund bleiben); sonst → oberste Ebene.
  return i >= 0 ? kette[Math.min(i + 1, kette.length - 1)] : kette[0]
}
