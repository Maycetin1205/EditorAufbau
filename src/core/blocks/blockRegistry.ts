// blockRegistry
// Zentrale Map: Typ-Name (z.B. 'button') -> Block-Klassen-Konstruktor.
// Jede Block-Datei registriert sich selbst am Ende ihrer Datei (Plugin-Pattern).
// Editor-Sidebar und Factory lesen aus dieser Registry, ohne die Block-Dateien direkt zu kennen.

import type { BasicBlock } from './BasicBlock'

// Konstruktor-Signatur, die jede Block-Klasse erfuellen muss:
// optional id, optional width, optional height. Konsistent mit BasicBlock + Subklassen.
export type BlockConstructor = new (id?: string, width?: number, height?: number) => BasicBlock

const registry = new Map<string, BlockConstructor>()

export function registerBlockType(type: string, ctor: BlockConstructor): void {
  if (registry.has(type)) {
    console.warn(`Block-Typ "${type}" wird ueberschrieben.`)
  }
  registry.set(type, ctor)
}

export function getBlockConstructor(type: string): BlockConstructor | undefined {
  return registry.get(type)
}

export function getRegisteredBlockTypes(): string[] {
  return Array.from(registry.keys())
}
