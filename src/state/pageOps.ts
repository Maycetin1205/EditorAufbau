// pageOps — Seiten-Regeln der Maske (Hauptseite + Popup-Seiten).
// Verhaltensgleich herausgezogen aus Editor.ts:
// kein Zustand, kein DOM — alle Funktionen bekommen alles hereingereicht.
// Registry-getrieben über das pageBlock-Kennzeichen, kein `if type===`.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'

export interface SeitenEintrag {
  id: string
  name: string
  istHauptseite: boolean
  // true = FLÄCHE (Hauptseite oder Ansicht): die Seite ist die Maskenfläche
  // selbst, ihre Bausteine liegen im Raster. false = FENSTER (Popup).
  istFlaeche: boolean
}

// Ein Seiten-Baustein (Popup, Ansicht) ist eine eigene Seite, kein Inhalt
// seiner Elternseite — die EINE Stelle, die das entscheidet.
export function istSeitenBaustein(node: BlockNode): boolean {
  return getBlockDefinition(node.type)?.pageBlock === true
}

// Und WELCHE Art Seite: Fläche (Ansicht) oder Fenster (Popup) —
// Registry-Kennzeichen, kein `if type===` (Bedeutung: BlockDefinition).
export function istFlaechenSeite(node: BlockNode): boolean {
  return getBlockDefinition(node.type)?.flaechenSeite === true
}

// Die FENSTER-Seiten unter den Seiten einer Maske: nur sie kann ein
// Ketten-Schritt öffnen und schließen. Ohne diese Frage stünden Ansichten in
// den Popup-Wählern, und der Schritt träfe zur Laufzeit nichts.
export function istFensterSeite(eintrag: SeitenEintrag): boolean {
  return !eintrag.istHauptseite && !eintrag.istFlaeche
}

// Ein noch freier Klarname für eine neue Seite: „Ansicht", „Ansicht 2", …
// Die Zählung beginnt bei 2, weil der unbenutzte Grundname selbst der erste
// ist. Namen sind der Adressweg der Laufzeit (Popup-Schritte) — doppelte
// träfen still das falsche Fenster.
export function freierSeitenName(vergeben: readonly string[], basis: string): string {
  const belegt = new Set(vergeben)
  let name = basis
  for (let n = 2; belegt.has(name); n++) name = `${basis} ${n}`
  return name
}

// Wurzel der AKTIVEN Seite. Verschwindet die Seite (Undo, Löschen),
// fällt alles auf die Hauptseite zurück.
export function aktiveSeitenWurzel(tree: BlockTree, activePageId: string): string {
  return tree[activePageId] ? activePageId : ROOT_ID
}

// Auf WELCHER Seite liegt dieser Baustein? Der naechste Seiten-Baustein
// aufwaerts — er selbst zaehlt mit, denn ein Popup gehoert zu seiner EIGENEN
// Seite (auf der Hauptseite ist es gar nicht zu sehen, kinderImFluss laesst
// es dort aus). Kein Seiten-Baustein aufwaerts: die Hauptseite.
export function seiteVon(tree: BlockTree, id: string): string {
  let cur: BlockNode | undefined = tree[id]
  while (cur) {
    if (istSeitenBaustein(cur)) return cur.id
    cur = cur.parentId ? tree[cur.parentId] : undefined
  }
  return ROOT_ID
}

// Seiten der Maske: Hauptseite + alle Seiten-Bausteine unter der Wurzel,
// in Baum-Reihenfolge. Der Ersatzname eines namenlosen Eintrags kommt aus der
// Registry (displayName), nicht als Literal von hier — sonst hiesse eine
// namenlose Ansicht „Popup".
export function seitenDerMaske(tree: BlockTree): SeitenEintrag[] {
  const seiten = (tree[ROOT_ID]?.childIds ?? [])
    .map((id) => tree[id])
    .filter((n): n is BlockNode => Boolean(n) && istSeitenBaustein(n))
    .map((n) => ({
      id: n.id,
      name: typeof n.props.name === 'string' && n.props.name !== ''
        ? n.props.name
        : getBlockDefinition(n.type)?.displayName ?? 'Seite',
      istHauptseite: false,
      istFlaeche: istFlaechenSeite(n),
    }))
  return [{ id: ROOT_ID, name: 'Hauptseite', istHauptseite: true, istFlaeche: true }, ...seiten]
}

// Kinder im FLUSS eines Containers: Seiten-Bausteine (Popups) erscheinen
// nie im Fluss ihres Elternteils — sie sind eigene Seiten (Reiter).
export function kinderImFluss(tree: BlockTree, parentId: string): BlockNode[] {
  const parent = tree[parentId]
  if (!parent) return []
  return parent.childIds
    .map((id) => tree[id])
    .filter((n): n is BlockNode => Boolean(n) && !istSeitenBaustein(n))
}
