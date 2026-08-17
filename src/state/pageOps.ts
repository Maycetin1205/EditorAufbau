import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'

export interface SeitenEintrag {
  id: string
  name: string
  istHauptseite: boolean

  istFlaeche: boolean
}

export function istSeitenBaustein(node: BlockNode): boolean {
  return getBlockDefinition(node.type)?.pageBlock === true
}

export function istFlaechenSeite(node: BlockNode): boolean {
  return getBlockDefinition(node.type)?.flaechenSeite === true
}

export function istFensterSeite(eintrag: SeitenEintrag): boolean {
  return !eintrag.istHauptseite && !eintrag.istFlaeche
}

export function freierSeitenName(vergeben: readonly string[], basis: string): string {
  const belegt = new Set(vergeben)
  let name = basis
  for (let n = 2; belegt.has(name); n++) name = `${basis} ${n}`
  return name
}

export function aktiveSeitenWurzel(tree: BlockTree, activePageId: string): string {
  return tree[activePageId] ? activePageId : ROOT_ID
}

export function seiteVon(tree: BlockTree, id: string): string {
  let cur: BlockNode | undefined = tree[id]
  while (cur) {
    if (istSeitenBaustein(cur)) return cur.id
    cur = cur.parentId ? tree[cur.parentId] : undefined
  }
  return ROOT_ID
}

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

export function kinderImFluss(tree: BlockTree, parentId: string): BlockNode[] {
  const parent = tree[parentId]
  if (!parent) return []
  return parent.childIds
    .map((id) => tree[id])
    .filter((n): n is BlockNode => Boolean(n) && !istSeitenBaustein(n))
}
