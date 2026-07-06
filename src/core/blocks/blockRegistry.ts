// blockRegistry
// Zentrale Map: Typ-Name -> BlockDefinition (Tag, Defaults, Inspector-Felder).
// Jede Block-View-Datei registriert sich selbst am Datei-Ende (Plugin-Pattern).
// Sidebar/Factory/Inspector lesen aus dieser Registry.

import type { BlockDefinition } from './BlockDefinition'
import { ROOT_TYPE } from './BlockData'

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

// DIE eine Regel-Quelle fuer "erlaubte Kind-Typen" (Kap. 4K.4).
// Store (addBlock/moveNode), Canvas-Drag und Palette fragen alle hier —
// kein `if type===` in der UI.
//  - Wurzel: erlaubt alles.
//  - kein Container: erlaubt nichts.
//  - Container ohne Liste (Bereich): erlaubt alles.
//  - Container mit Liste (Kanban-Spalte/Board): NUR diese Typen.
export function canContain(parentType: string, childType: string): boolean {
  if (parentType === ROOT_TYPE) return true
  const def = registry.get(parentType)
  if (!def || !def.acceptsChildren) return false
  return def.allowedChildTypes === null || def.allowedChildTypes.includes(childType)
}
