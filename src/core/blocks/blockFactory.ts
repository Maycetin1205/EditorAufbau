// blockFactory
// Erzeugt Block-Instanzen anhand des Typ-Namens.
// Liest die passende Klasse aus blockRegistry und ruft new auf.
// Sidebar/Store nutzen diese Funktion statt direkter Klassen-Imports.

import type { BasicBlock } from './BasicBlock'
import { getBlockConstructor } from './blockRegistry'

export function createBlock(type: string, id?: string): BasicBlock {
  const Ctor = getBlockConstructor(type)
  if (!Ctor) {
    throw new Error(`Unbekannter Block-Typ: "${type}". Vorher mit registerBlockType registrieren.`)
  }
  return new Ctor(id)
}
