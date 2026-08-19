import type { BlockNode } from '../../core/blocks/BlockData'
import {
  listeLesen,
  listenStandardTitel,
  zerlegeBindung,
} from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { propertySichtbar } from '../../core/blocks/PropertyDescription'
import { QUELLE_PROP } from '../../core/blocks/treeQuery'
import {
  erfassungsZielVon,
  weitereQuellenAus,
  WEITERE_QUELLEN_PROP,
} from '../../core/data/sourceLinks'
import { useDataSources } from '../../state/useDataSources'

// Die Ableitung der Spalten in Klartext — je Spalte eine Zeile, damit niemand
// auswendig wissen muss, welche Zelle woher wählt (Nutzer-Befund 2026-08-19).
// Rein lesend: eingestellt wird am Spaltenkopf (das Feld) und an den
// Datenquellen (die Verknüpfung), nie hier. Generisch über die Listen-Bindung
// der Registry — kein Bausteintyp-Sondercode (Regel 2).
export function SpaltenKlartext({ block }: { block: BlockNode }) {
  const bibliothek = useDataSources().list
  const def = getBlockDefinition(block.type)
  const bindung = def?.listenBindung
  const quelleId = typeof block.props[QUELLE_PROP] === 'string'
    ? (block.props[QUELLE_PROP] as string)
    : ''
  // quelleProp-Listen (das Nachschlage-Fenster) sind keine Tabellen-Spalten.
  if (!bindung || bindung.quelleProp !== undefined || quelleId === '') return null
  const eintraege = listeLesen(block.props[bindung.prop], bindung)
  if (eintraege.length === 0) return null

  const verknuepfungen = weitereQuellenAus(block.props[WEITERE_QUELLEN_PROP])
  const erfasst = def?.kannErfassen !== undefined
    && propertySichtbar(def.kannErfassen.wenn, block.props)
  const nameVon = (id: string) =>
    bibliothek.find((s) => s.id === id)?.name ?? '(Quelle fehlt)'
  const ersteName = nameVon(quelleId)

  const klartext = (feld: string): string => {
    const ziel = erfassungsZielVon(feld, quelleId, verknuepfungen)
    if (ziel.art === 'frei') return erfasst ? 'nicht gebunden · frei tippen' : 'nicht gebunden'
    const direkt = zerlegeBindung(feld.trim()).quelleId
    if (direkt !== '' && direkt !== quelleId) {
      return erfasst
        ? `Anzeige aus „${nameVon(ziel.quelleId)}“ · wählt dort`
        : `Anzeige aus „${nameVon(ziel.quelleId)}“`
    }
    if (ziel.art === 'auswahl') {
      return erfasst
        ? `Feld aus „${ersteName}“ · wählt im „${nameVon(ziel.quelleId)}“`
        : `Feld aus „${ersteName}“`
    }
    return erfasst ? `Feld aus „${ersteName}“ · frei tippen` : `Feld aus „${ersteName}“`
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Spalten
      </span>
      {eintraege.map((eintrag, i) => {
        const titelRoh = eintrag[bindung.titelKey]
        const titel = typeof titelRoh === 'string' && titelRoh !== ''
          ? titelRoh
          : listenStandardTitel(bindung, i)
        const feldRoh = eintrag[bindung.feldKey]
        const feld = typeof feldRoh === 'string' ? feldRoh : ''
        return (
          <p key={i} className="text-xs leading-snug">
            <span className="font-medium">{titel}</span>
            <span className="text-muted-foreground"> — {klartext(feld)}</span>
          </p>
        )
      })}
    </div>
  )
}
