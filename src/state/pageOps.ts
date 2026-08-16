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

// Ein Seitenname, der die Maske adressierbar haelt: getrimmt und nicht
// derselbe wie der einer ANDEREN Seite (verglichen ohne Gross-/Kleinschreibung,
// de-DE). Kollidiert der Wunsch, wird hochgezaehlt — der Bauer bekommt
// „Details 2" statt einer Ablehnung, die er sich nicht erklaeren kann.
//
// Warum das ueberhaupt zaehlt: In der laufenden Maske finden BEIDE Adresswege
// ihre Seite ueber den NAMEN — der Popup-Schritt (applyPopupStep) und der
// Navi-Eintrag (navi/seRuntime). Zwei gleiche Namen treffen darum dieselbe
// Seite; applyPopupStep schaltet sogar BEIDE Fenster zugleich. Die Hauptseite
// zaehlt mit, denn auch sie ist ein Ziel (ihr Name ist ihre Adresse).
export function eindeutigerSeitenName(
  seiten: readonly SeitenEintrag[],
  eigeneId: string,
  wunsch: string,
): string {
  const schluessel = (s: string): string => s.trim().toLocaleLowerCase('de-DE')
  const belegt = new Set(
    seiten.filter((s) => s.id !== eigeneId).map((s) => schluessel(s.name)),
  )
  const basis = wunsch.trim()
  let name = basis
  for (let n = 2; belegt.has(schluessel(name)); n++) name = `${basis} ${n}`
  return name
}

// Der Wert, mit dem eine Prop wirklich geschrieben wird. Fuer alles ausser dem
// NAMEN einer Seite ist das der Wunsch unveraendert; fuer ihn gilt der
// Adress-Vertrag oben (getrimmt, nie leer, nie doppelt). `null` heisst: gar
// nicht schreiben — ein leer getippter Seitenname laesst den alten stehen,
// statt die Seite unadressierbar zu machen.
// Steht hier und nicht im Store, weil es eine SEITEN-Regel ist; der Store ruft
// sie nur an der einen Stelle auf, durch die jeder Schreibweg kommt.
export function schreibWert(
  def: { pageBlock?: boolean } | undefined,
  seiten: readonly SeitenEintrag[],
  id: string,
  attr: string,
  wunsch: unknown,
): unknown {
  if (attr !== 'name' || def?.pageBlock !== true) return wunsch
  const name = eindeutigerSeitenName(seiten, id, typeof wunsch === 'string' ? wunsch : '')
  return name === '' ? null : name
}

// Zeigt woanders im Baum ein KLARNAME auf diese Seite, zieht er beim
// Umbenennen mit. Ein Navi-Eintrag haelt die Seiten-id (die Wahrheit) und
// daneben ihren Klarnamen (die Beschriftung); ohne dieses Nachziehen
// beschriftete er sich nach einem Umbenennen weiter mit dem alten Namen.
// Registry-getrieben ueber kind 'seite' + klarnameProp, kein `if type===`.
// Der EXPORT verlaesst sich NICHT darauf — er loest den Namen ohnehin aus der
// id auf (exportMask, seitenKlarname). Hier geht es allein um das, was der
// Bauer im Editor liest.
export function klarnamenNachziehen(tree: BlockTree, seitenId: string, name: string): BlockTree {
  let next = tree
  for (const knotenId of Object.keys(tree)) {
    for (const p of getBlockDefinition(next[knotenId].type)?.customProperties ?? []) {
      if (p.kind !== 'seite' || !p.klarnameProp) continue
      const aktuell = next[knotenId]
      if (aktuell.props[p.attributeName] !== seitenId) continue
      if (next === tree) next = { ...tree }
      next[knotenId] = { ...aktuell, props: { ...aktuell.props, [p.klarnameProp]: name } }
    }
  }
  return next
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
