// blockRegistry
// Zentrale Map: Typ-Name -> BlockDefinition (Tag, Defaults, Inspector-Felder).
// Jede Block-View-Datei registriert sich selbst am Datei-Ende (Plugin-Pattern).
// Sidebar/Factory/Inspector lesen aus dieser Registry.

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

export function getRegisteredBlockTypes(): string[] {
  return Array.from(registry.keys())
}

export function getAllBlockDefinitions(): BlockDefinition[] {
  return Array.from(registry.values())
}
