import type { BlockDefinition } from './BlockDefinition'

const registry = new Map<string, BlockDefinition>()

export function registerBlockType(def: BlockDefinition): void {
  if (registry.has(def.type)) {
    console.warn(`Block-Typ "${def.type}" wird ueberschrieben.`)
  }
  registry.set(def.type, def)
}

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return registry.get(type)
}

export function getAllBlockDefinitions(): BlockDefinition[] {
  return Array.from(registry.values())
}

export function canContain(parentType: string, childType: string): boolean {
  const child = registry.get(childType)
  if (child?.allowedParentTypes && !child.allowedParentTypes.includes(parentType)) {
    return false
  }
  const def = registry.get(parentType)
  if (!def) return true
  if (!def.acceptsChildren) return false
  if (!def.allowedChildTypes) return true
  return def.allowedChildTypes.includes(childType)
}
