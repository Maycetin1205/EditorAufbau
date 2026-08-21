import type { BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { TIER_BILDER } from '../core/data/tierBilder'

/* Die Tierbilder sind 29,7 KB Daten. Bis 2026-08-21 steckten sie im
   Laufzeit-Buendel und damit in JEDER Maske — auch in einer mit acht
   Textspalten und keinem Bild. Hier wird gefragt, statt angenommen: jeder
   Baustein im Baum sagt ueber seine Registry-Faehigkeit `brauchtTierbilder`,
   ob er sie mit DIESEN Props zeigt. Kein Bausteintyp wird dabei genannt
   (Regel 2) — wer die Bilder braucht, deklariert es selbst. */
export function brauchtTierbilder(tree: BlockTree): boolean {
  return Object.values(tree).some((node) => {
    const frage = getBlockDefinition(node.type)?.brauchtTierbilder
    return frage !== undefined && frage(node.props)
  })
}

export function tierbilderJs(tree: BlockTree): string {
  if (!brauchtTierbilder(tree)) return ''
  return 'window.FF_TIER_BILDER = ' + JSON.stringify(TIER_BILDER) + ';'
}
