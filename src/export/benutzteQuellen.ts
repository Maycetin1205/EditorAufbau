import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import {
  bindingProp,
  eintragsFelderLesen,
  eintragsFelderVon,
  eintragsFelderWahlWerte,
  eintragsQuellenWahlWert,
  listeLesen,
  zerlegeBindung,
} from '../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { propertySichtbar } from '../core/blocks/PropertyDescription'
import {
  auswahlQuelleIdVon,
  bindbareStellenVon,
  darfAuswahlFolgen,
  quellenIdsInKettenVon,
  traegtEigeneQuelle,
} from '../core/blocks/treeQuery'
import { AUSWAHL_FOLGE_PROP, auswahlFolgenAus, folgeBrauchbar } from '../core/data/auswahlFolge'
import { ladeRelationFor, type DataSource } from '../core/data/dataSources'
import {
  elternQuelleVon,
  quelleBrauchbar,
  vollstaendigePaare,
  WEITERE_QUELLEN_PROP,
  weitereQuellenAus,
  type QuelleInReichweite,
} from '../core/data/sourceLinks'
import { quellenInReichweite } from '../state/quellenOps'

export function collectDataSources(
  tree: BlockTree,
  sources: readonly DataSource[],
): DataSource[] {
  const seen = new Set<string>()
  const acc: DataSource[] = []
  const add = (id: unknown): void => {
    const src = typeof id === 'string' ? sources.find((s) => s.id === id) : undefined
    if (src && !seen.has(src.id)) {
      seen.add(src.id)
      acc.push(src)
    }
  }
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return

    if (traegtEigeneQuelle(node)) {
      add(node.props.source)

      for (const q of weitereQuellenAus(node.props[WEITERE_QUELLEN_PROP])) {
        if (quelleBrauchbar(q)) add(q.quelleId)
      }
    }

    const def = getBlockDefinition(node.type)
    for (const prop of def?.customProperties ?? []) {
      if (prop.kind === 'quelle' && propertySichtbar(prop.visibleWhen, node.props)) {
        add(node.props[prop.attributeName])
      }
    }

    // Die Hilfstabelle, in der eine Spalte beim Erfassen sucht. Sie haengt an
    // KEINER Verknuepfung (seit 2026-08-20) und stuende sonst in keiner
    // Bestellung: SoftEngine liefert sie nicht, die Liste bliebe leer.
    const listen = def?.listenBindung
    if (listen?.eintragsQuellenWahl) {
      const wahl = listen.eintragsQuellenWahl
      for (const eintrag of listeLesen(node.props[listen.prop], listen)) {
        add(eintragsQuellenWahlWert(wahl, eintrag))
      }
    }

    for (const id of quellenIdsInKettenVon(node)) add(id)
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}

export function benutzteFelderJeQuelle(
  tree: BlockTree,
  sources: readonly DataSource[],
): Map<string, ReadonlySet<string>> {
  const felder = new Map<string, Set<string>>()

  const merke = (quelleId: string, code: unknown): void => {
    if (quelleId === '' || typeof code !== 'string' || code.trim() === '') return
    const vorhanden = felder.get(quelleId)
    if (vorhanden) vorhanden.add(code.trim())
    else felder.set(quelleId, new Set([code.trim()]))
  }

  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    const def = getBlockDefinition(node.type)

    let reichweite: QuelleInReichweite[] | undefined
    const inReichweite = (): QuelleInReichweite[] => (
      reichweite ??= quellenInReichweite(tree, node.id, sources)
    )

    const merkeBindung = (wert: unknown): void => {
      if (typeof wert !== 'string' || wert === '') return
      const { quelleId, code } = zerlegeBindung(wert)
      const ziel = quelleId === ''
        ? inReichweite()[0]
        : inReichweite().find((q) => q.source.id === quelleId)
      if (ziel) merke(ziel.source.id, code)
    }

    for (const spot of bindbareStellenVon(node)) {
      merkeBindung(node.props[bindingProp(spot.prop)])
    }

    if (def?.listenBindung) {
      const b = def.listenBindung

      // Traegt die Bindung ein `quelleProp`, speichern ihre Eintraege den
      // NACKTEN Feldcode EINER benannten Quelle (Nachschlage-Fenster). Dann
      // waere es falsch, ihn wie eine Bindung ueber die Quellen in
      // Reichweite aufzuloesen — er gehoert zu genau dieser Quelle, sonst
      // bestellt der Export ihre Felder gar nicht und die Spalte bleibt in
      // SoftEngine leer.
      const eigeneQuelle = b.quelleProp === undefined
        ? undefined
        : String(node.props[b.quelleProp] ?? '')
      const merkeEintragsFeld = (wert: unknown): void => {
        if (eigeneQuelle === undefined) merkeBindung(wert)
        else merke(eigeneQuelle, wert)
      }

      for (const eintrag of listeLesen(node.props[b.prop], b)) {
        merkeEintragsFeld(eintrag[b.feldKey])

        // Die Felder, die der Nutzer je Eintrag zum ANZEIGEN BEIM SUCHEN
        // gewaehlt hat. Sie gehoeren NICHT der Quelle des Bausteins, sondern
        // der, die derselbe Eintrag nennt (bei der Tabelle: „Sucht beim
        // Erfassen in"). Ohne diese Zeilen bestellt der Export die Felder der
        // Hilfstabelle gar nicht — in SoftEngine ging dann das Such-Fenster
        // zwar auf, blieb aber leer (Nutzer-Befund 2026-08-20).
        if (b.eintragsFelderWahl) {
          const w = b.eintragsFelderWahl
          const suchQuelle = String(eintrag[w.quelleAusKey] ?? '')
          for (const gf of eintragsFelderWahlWerte(w, eintrag)) merke(suchQuelle, gf.feld)
        }

        if (!b.eintragsWahl) continue
        const gebunden = eintragsFelderLesen(b.eintragsWahl, eintrag)
        for (const zf of eintragsFelderVon(b.eintragsWahl, eintrag)) {
          merkeEintragsFeld(gebunden[zf.key])
        }
      }
    }

    for (const prop of def?.customProperties ?? []) {
      if (prop.kind !== 'field') continue
      if (!propertySichtbar(prop.visibleWhen, node.props)) continue
      merke(
        prop.quelleProp === undefined
          ? inReichweite()[0]?.source.id ?? ''
          : String(node.props[prop.quelleProp] ?? ''),
        node.props[prop.attributeName],
      )
    }

    if (traegtEigeneQuelle(node)) {
      const erste = typeof node.props.source === 'string' ? node.props.source : ''
      for (const q of weitereQuellenAus(node.props[WEITERE_QUELLEN_PROP])) {
        if (!quelleBrauchbar(q)) continue
        // Die `fromField` gehoeren der Quelle, an der die Verknuepfung HAENGT —
        // das ist nicht immer die eigene Quelle des Bausteins (vonQuelleId).
        const eltern = elternQuelleVon(q, erste)
        for (const paar of vollstaendigePaare(q)) {
          merke(eltern, paar.fromField)
          merke(q.quelleId, paar.toField)
        }
      }
    }

    if (darfAuswahlFolgen(node)) {
      const eigene = auswahlQuelleIdVon(node)
      for (const folge of auswahlFolgenAus(node.props[AUSWAHL_FOLGE_PROP])) {
        if (!folgeBrauchbar(folge)) continue
        const geber = auswahlQuelleIdVon(tree[folge.geberId])
        for (const paar of vollstaendigePaare(folge)) {
          merke(geber, paar.fromField)
          merke(eigene, paar.toField)
        }
      }
    }

    for (const event of def?.blockEvents ?? []) {
      for (const step of node.events?.[event.key] ?? []) {
        if (step.type !== 'RELATION') continue
        for (const binding of [...step.params, ...step.extraParams]) {
          if (binding.source === 'data_field') {
            merke(binding.dataSourceId ?? '', binding.value)
          } else if (binding.source === 'gewaehlte_zeile') {
            merke(auswahlQuelleIdVon(tree[binding.blockId ?? '']), binding.value)
          }
        }
      }
    }
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return felder
}

export function holSchluesselJeGeber(
  used: readonly DataSource[],
): Map<string, string[]> {
  const proGeber = new Map<string, string[]>()
  for (const source of used) {
    const lade = ladeRelationFor(source)
    if (!lade) continue
    const codes = proGeber.get(lade.geberQuelleId) ?? []
    for (const code of [lade.belegartFeld, lade.belegnummerFeld, lade.jahrFeld, lade.archivFeld]) {
      if (code !== '' && !codes.includes(code)) codes.push(code)
    }
    proGeber.set(lade.geberQuelleId, codes)
  }
  return proGeber
}
