import type { BlockNode } from './BlockData'
import { bindingProp } from './BlockDefinition'
import { getBlockDefinition } from './blockRegistry'
import { bindbareStellenVon, QUELLE_PROP } from './treeQuery'
import { feldKlarname, type DataSource } from '../data/dataSources'

const TEXT_PROPS = ['label', 'heading', 'title', 'text', 'placeholder'] as const

const MAX_LAENGE = 28

export function eigenerText(
  props: Record<string, unknown>,
  defaults?: Record<string, unknown>,
): string {
  for (const key of TEXT_PROPS) {
    const value = props[key]
    if (typeof value !== 'string' || value.trim() === '') continue
    if (defaults && value === defaults[key]) continue
    const text = value.trim()
    return text.length > MAX_LAENGE ? `${text.slice(0, MAX_LAENGE - 1)}…` : text
  }
  return ''
}

function gebundenerAlias(node: BlockNode, quellen: readonly DataSource[]): string {
  const eigeneQuelle = String(node.props[QUELLE_PROP] ?? '')
  for (const stelle of bindbareStellenVon(node)) {
    const bindung = String(node.props[bindingProp(stelle.prop)] ?? '')
    if (bindung === '') continue
    const alias = feldKlarname(bindung, eigeneQuelle, quellen)
    if (alias !== '') return alias
  }
  return ''
}

export function bausteinName(node: BlockNode, quellen: readonly DataSource[]): string {
  const def = getBlockDefinition(node.type)
  const text = eigenerText(node.props, def?.defaultProps)
  if (text !== '') return text
  const alias = gebundenerAlias(node, quellen)
  if (alias !== '') return alias
  return def?.displayName ?? node.type
}
