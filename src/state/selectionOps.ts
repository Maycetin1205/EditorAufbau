// selectionOps — welcher Baustein nach einem Klick auf der Fläche gewählt ist.
// Kein Zustand, kein DOM — alles wird hereingereicht, zurück kommt nur das
// Ziel (null = nichts auswählen). Wer auswählt und wer meldet, bleibt Sache
// des Stores.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { istSeitenBaustein, seiteVon } from './pageOps'

// Die Auswahl darf NIE auf einem Baustein einer unsichtbaren Seite stehen —
// sonst zeigt und aendert der Inspector etwas, das nirgends zu sehen ist, und
// die Entf-Taste loescht es. setActivePage haelt die Regel selbst ein (es leert
// die Auswahl); die zwei Wege, die eine FREMDE Auswahl hereintragen, brauchen
// diesen Filter:
//   - Laden: selectedId wird persistiert, die offene Seite bewusst nicht (sie
//     startet immer als Hauptseite). Wer aus einer Popup-Sitzung heraus neu
//     laedt, hielt die Auswahl bis 2026-08-06 am unsichtbaren Baustein.
//   - Undo/Redo: ein Snapshot kennt Baum und Auswahl, aber keine Seite —
//     dieselbe Lage, wenn der Bediener zwischendurch die Seite wechselt.
export function auswahlAufSeite(
  tree: BlockTree,
  id: string | null,
  seitenWurzel: string,
): string | null {
  if (id === null || !tree[id]) return null
  return seiteVon(tree, id) === seitenWurzel ? id : null
}

// Auswahl AM DING (U8, Nutzer-Befund 2026-08-12 „drei Klicks bis zur Karte"):
// ein Klick wählt den Baustein, auf den geklickt wurde — `getroffenId` ist der
// TIEFSTE unter dem Zeiger (der innerste BlockHost fängt den Klick zuerst ab).
// Ein weiterer Klick auf den bereits Gewählten geht EINE Ebene nach AUSSEN
// (Karte → Spalte → Board) und bleibt an der obersten Ebene der Fläche stehen.
//
// Bis dahin (Regel 2026-07-23) lief es genau andersherum: der erste Klick nahm
// die oberste Hülle, jeder weitere stieg eine Ebene tiefer — auf eine Karte im
// Board waren das drei Klicks, und das widerspricht Regel 7 („Klick auf die
// Stelle").
//
// `aufStelle` = der Klick landete auf einer bedienbaren Stelle des Bausteins
// (data-ff-spot, s. useBindingPicker). Dann gibt es KEINEN Schritt nach außen:
// an einem gewählten Baustein ist dieser Klick bereits vergeben — er öffnet den
// Feld-Picker. Ohne die Ausnahme ließe sich keine gewählte Stelle mehr binden,
// und der erste Klick eines Doppelklicks zöge die Auswahl weg, bevor der
// Inline-Edit greift (BasicBlock.inlineEdit prüft `editable`).
//
// Registry-frei: wo die Fläche aufhört, sagt der Baum (Wurzel/Seiten-Baustein).
export function auswahlZiel(
  tree: BlockTree,
  getroffenId: string,
  selectedId: string | null,
  aufStelle: boolean,
): string | null {
  const node = tree[getroffenId]
  if (!node || getroffenId === ROOT_ID) return null
  if (aufStelle || selectedId !== getroffenId) return getroffenId
  // Schon gewählt → seine Hülle. Nicht über die oberste Ebene der Fläche
  // hinaus: die Seite selbst (Wurzel, Popup-Rumpf, Ansicht) ist kein Baustein,
  // den die Fläche auswählen könnte.
  const eltern: BlockNode | undefined = node.parentId ? tree[node.parentId] : undefined
  if (!eltern || eltern.id === ROOT_ID || istSeitenBaustein(eltern)) return getroffenId
  return eltern.id
}
