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

export function getAllBlockDefinitions(): BlockDefinition[] {
  return Array.from(registry.values())
}

// Erlaubte-Kind-Typen-Regel (Kap. 4K.4) an EINER Stelle: Store, Drag-Vorschau
// und Palette fragen alle hier. Unbekannte Elterntypen (z. B. die implizite
// Wurzel) beschränken nichts; Nicht-Container nehmen nie Kinder auf.
// S3 ergänzt die Gegenrichtung: deklariert das KIND erlaubte Eltern-Typen
// (Karte -> nur Kanban-Spalte), zählt auch die Wurzel nicht als Ziel —
// eine Karte lässt sich nicht mehr aus dem Kanban herausziehen.
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
