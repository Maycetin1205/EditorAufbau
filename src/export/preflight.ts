import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { bausteinName } from '../core/blocks/bausteinName'
import {
  bindingProp,
  eintragsFelderLesen,
  eintragsFelderVon,
  eintragsWahlWert,
  eintragsZuordnungLesen,
  listeLesen,
  zerlegeBindung,
} from '../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { propertySichtbar } from '../core/blocks/PropertyDescription'
import { istFlaechenSeite, seitenDerMaske } from '../state/pageOps'
import {
  actionValueTargets,
  auswahlGeberImBaum,
  auswahlQuelleIdVon,
  bindbareStellenVon,
  darfAuswahlFolgen,
  istAuswahlGeber,
  traegtEigeneQuelle,
} from '../core/blocks/treeQuery'
import { ergebnisSchritteVor } from '../core/data/aktionen'
import { stepProblem } from '../core/data/schrittPruefung'
import { AUSWAHL_FOLGE_PROP, auswahlFolgenAus, folgeBrauchbar } from '../core/data/auswahlFolge'
import type { DataSource } from '../core/data/dataSources'
import type { RelationTemplate } from '../core/data/relations'
import { vollstaendigePaare } from '../core/data/sourceLinks'
import { quellenInReichweite, quellenTraeger } from '../state/quellenOps'
import type { CheckResult } from './validator'

export function preflightMask(
  tree: BlockTree,
  sources: readonly DataSource[],
  relations: readonly RelationTemplate[],
): CheckResult[] {
  const results: CheckResult[] = []
  const actionValues = actionValueTargets(tree).map(({ node, spot }) => ({
    blockId: node.id,
    prop: spot.prop,
  }))

  const auswahlGeberIds = auswahlGeberImBaum(tree).map((n) => n.id)
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    const def = getBlockDefinition(node.type)

    if (traegtEigeneQuelle(node)) {
      const id = node.props.source
      if (typeof id === 'string' && id !== '' && !sources.some((s) => s.id === id)) {
        results.push({
          name: 'Datenquelle fehlt',
          ok: false,
          detail: `Baustein "${bausteinName(node, sources)}" verweist auf eine gelöschte oder unbekannte Datenquelle.`,
        })
      }
    }

    const pruefeBindung = (wert: unknown, stelle: string): void => {
      if (typeof wert !== 'string' || wert === '') return
      const name = bausteinName(node, sources)
      const erreichbar = quellenInReichweite(tree, node.id, sources)

      if (erreichbar.length === 0) {
        const traeger = quellenTraeger(tree, node.id)
        if (typeof traeger?.props.source === 'string' && traeger.props.source !== '') return
        results.push({
          name: 'Bindung ohne Datenquelle',
          ok: false,
          detail: `Baustein "${name}", Stelle "${stelle}" ist an ein Feld gebunden, aber weder der Baustein noch ein Baustein darüber hat eine Datenquelle gewählt — die Stelle bliebe in der Maske leer.`,
        })
        return
      }
      const { quelleId, code } = zerlegeBindung(wert)
      const ziel = quelleId === ''
        ? erreichbar[0]
        : erreichbar.find((q) => q.source.id === quelleId)
      if (!ziel) {
        const inBibliothek = sources.find((s) => s.id === quelleId)
        results.push(inBibliothek
          ? {
              name: 'Verbindung fehlt',
              ok: false,
              detail: `Baustein "${name}", Stelle "${stelle}" holt ihren Wert aus "${inBibliothek.name}" — diese Datenquelle hängt aber nicht (mehr) vollständig an dem Baustein. Unter Daten die Datenquelle wieder hinzufügen und die Felder angeben, an denen die zusammengehörige Zeile erkannt wird.`,
            }
          : {
              name: 'Datenquelle unbekannt',
              ok: false,
              detail: `Baustein "${name}", Stelle "${stelle}" holt ihren Wert aus einer gelöschten oder unbekannten Datenquelle — die Stelle bliebe in der Maske leer.`,
            })
        return
      }
      if (!ziel.source.fields.some((f) => f.code === code)) {
        results.push({
          name: 'Gebundenes Feld fehlt',
          ok: false,
          detail: `Baustein "${name}", Stelle "${stelle}": das gebundene Feld gibt es in der Datenquelle "${ziel.source.name}" nicht (mehr) — die Stelle bliebe in der Maske leer. Feld neu wählen oder das Feld in der Datenquelle wieder anlegen. (Feldcode ${code})`,
        })
      }
    }

    for (const spot of bindbareStellenVon(node)) {
      pruefeBindung(node.props[bindingProp(spot.prop)], spot.label)
    }
    if (def?.listenBindung) {
      const b = def.listenBindung
      const wahl = b.eintragsWahl
      const zuo = b.eintragsZuordnung
      // Mit `quelleProp` gehoert die Liste zu EINER benannten Quelle; sie
      // wird oben beim Quellen-Prop geprueft, nicht als Bindung.
      const eigeneQuelle = b.quelleProp !== undefined
      listeLesen(node.props[b.prop], b).forEach((eintrag, i) => {
        const titel = String(eintrag[b.titelKey] ?? '') || `Nr. ${i + 1}`
        if (!eigeneQuelle) pruefeBindung(eintrag[b.feldKey], titel)

        if (wahl) {
          const gebunden = eintragsFelderLesen(wahl, eintrag)
          for (const zf of eintragsFelderVon(wahl, eintrag)) {
            pruefeBindung(gebunden[zf.key], `${titel} · ${zf.label}`)
          }
        }

        if (!wahl || !zuo) return
        if (eintragsWahlWert(wahl, eintrag) !== zuo.nurBeiWahl) return
        if (eintragsZuordnungLesen(zuo, eintrag).length > 0) return
        results.push({
          name: `${zuo.label} fehlt`,
          ok: false,
          warnung: true,
          detail: `Baustein "${bausteinName(node, sources)}", "${titel}" steht auf "${
            wahl.optionen.find((o) => o.wert === zuo.nurBeiWahl)?.name ?? zuo.nurBeiWahl
          }", hat aber keine ${zuo.label} — die Marke zeigt in der Maske den unveränderten Datenwert in Grau.`,
        })
      })
    }

    for (const prop of def?.customProperties ?? []) {
      if (prop.kind !== 'quelle') continue
      if (!propertySichtbar(prop.visibleWhen, node.props)) continue
      const quelleId = String(node.props[prop.attributeName] ?? '')
      if (quelleId === '') continue
      const quelle = sources.find((s) => s.id === quelleId)
      if (!quelle) {
        results.push({
          name: 'Datenquelle unbekannt',
          ok: false,
          detail: `Baustein "${bausteinName(node, sources)}", "${prop.name}" nennt eine gelöschte oder unbekannte Datenquelle — die Stelle bliebe in der Maske leer.`,
        })
        continue
      }

      // Zeigt eine LISTEN-Bindung auf diese Quelle (die Spalten des
      // Nachschlage-Fensters), gehoeren ihre Feldcodes ebenfalls hierher —
      // sie sind nackte Codes DIESER Quelle, keine Bindungen ueber die
      // Quellen in Reichweite. Ohne diesen Zweig meldete der Preflight sie
      // als „Bindung ohne Datenquelle", obwohl die Quelle danebensteht.
      const liste = def?.listenBindung
      if (liste && liste.quelleProp === prop.attributeName) {
        listeLesen(node.props[liste.prop], liste).forEach((eintrag, i) => {
          const code = String(eintrag[liste.feldKey] ?? '')
          // Leer ist erlaubt: eine Spalte ohne Feld bleibt im Fenster leer.
          if (code === '' || quelle.fields.some((f) => f.code === code)) return
          const titel = String(eintrag[liste.titelKey] ?? '') || `Nr. ${i + 1}`
          results.push({
            name: 'Gebundenes Feld fehlt',
            ok: false,
            detail: `Baustein "${bausteinName(node, sources)}", Spalte "${titel}": das Feld gibt es in der Datenquelle "${quelle.name}" nicht (mehr) — die Spalte bliebe im Nachschlage-Fenster leer. (Feldcode ${code})`,
          })
        })
      }

      for (const feldProp of def?.customProperties ?? []) {
        if (feldProp.kind !== 'field' || feldProp.quelleProp !== prop.attributeName) continue
        const code = String(node.props[feldProp.attributeName] ?? '')
        if (code === '') {
          results.push({
            name: 'Feld fehlt',
            ok: false,
            detail: `Baustein "${bausteinName(node, sources)}": "${prop.name}" ist auf "${quelle.name}" gestellt, aber "${feldProp.name}" ist leer — in der Maske ließe sich hier nichts wählen.`,
          })
        } else if (!quelle.fields.some((f) => f.code === code)) {
          results.push({
            name: 'Gebundenes Feld fehlt',
            ok: false,
            detail: `Baustein "${bausteinName(node, sources)}": "${feldProp.name}" gibt es in der Datenquelle "${quelle.name}" nicht (mehr) — Feld neu wählen oder in der Datenquelle wieder anlegen. (Feldcode ${code})`,
          })
        }
      }
    }

    const byType = new Map<string, BlockNode[]>()
    for (const childId of node.childIds) {
      const child = tree[childId]
      if (child) byType.set(child.type, [...(byType.get(child.type) ?? []), child])
    }
    for (const [childType, children] of byType) {
      const childDef = getBlockDefinition(childType)
      for (const prop of childDef?.customProperties ?? []) {
        if (!prop.exclusiveAmongSiblings) continue
        const count = children.filter((c) => c.props[prop.attributeName] === 'ja').length
        if (count > 1) {
          results.push({
            name: 'Kennzeichen mehrfach vergeben',
            ok: false,

            detail: `Im Baustein "${bausteinName(node, sources)}" tragen ${count} Bausteine "${childDef?.displayName ?? childType}" das Kennzeichen "${prop.name}" — höchstens einer darf es tragen.`,
          })
        }
      }
    }

    if (darfAuswahlFolgen(node)) {
      for (const folge of auswahlFolgenAus(node.props[AUSWAHL_FOLGE_PROP])) {
        if (folge.geberId === '') continue
        const geber = tree[folge.geberId]
        if (!geber || !istAuswahlGeber(geber)) {
          results.push({
            name: 'Auswahl-Geber fehlt',
            ok: false,
            detail: `Baustein "${bausteinName(node, sources)}" folgt der Auswahl eines Bausteins, der gelöscht wurde oder keine Auswahl (mehr) gibt — ein Baustein gibt sie nur, wenn er eine Datenquelle hat UND den Bediener einen Satz herausgreifen lässt. Unter "Auswahl folgen" neu wählen oder die Verbindung entfernen.`,
          })
        } else if (!folgeBrauchbar(folge)) {
          results.push({
            name: 'Auswahl-Folge unvollständig',
            ok: false,
            detail: `Baustein "${bausteinName(node, sources)}" folgt "${bausteinName(geber, sources)}", aber es fehlt ein vollständiges Feldpaar (beide Seiten gefüllt) — die Maske würde nie filtern.`,
          })
        } else {
          const zeilenQuelle = sources.find((s) => s.id === auswahlQuelleIdVon(node))

          if (!zeilenQuelle) continue
          for (const paar of vollstaendigePaare(folge)) {
            if (zeilenQuelle.fields.some((f) => f.code === paar.toField)) continue
            results.push({
              name: 'Auswahl-Folge Feld fehlt',
              ok: false,
              detail: `Baustein "${bausteinName(node, sources)}" folgt "${bausteinName(geber, sources)}": das Feld, an dem die zusammengehörige Zeile erkannt wird, gibt es in der Datenquelle "${zeilenQuelle.name}" nicht (mehr) — es würde nie eine Zeile passen. Unter "Auswahl folgen" das rechte Feld neu wählen. (Feldcode ${paar.toField})`,
            })
          }
        }
      }
    }

    for (const [eventKey, steps] of Object.entries(node.events ?? {})) {
      const eventName = def?.blockEvents?.find((e) => e.key === eventKey)?.name ?? eventKey
      for (const step of steps) {
        const problem = stepProblem(step, relations, sources, popupIds,
          ergebnisSchritteVor(steps, step.id, relations).map((g) => g.id), actionValues,
          auswahlGeberIds)
        if (problem) {
          results.push({
            name: 'Aktion unvollständig',
            ok: false,
            detail: `Baustein "${bausteinName(node, sources)}", Ereignis "${eventName}": ${problem}`,
          })
        }
      }
    }
    node.childIds.forEach((childId) => visit(tree[childId]))
  }

  const popupSeiten = (tree[ROOT_ID]?.childIds ?? [])
    .map((id) => tree[id])
    .filter((n): n is BlockNode =>
      n !== undefined && getBlockDefinition(n.type)?.pageBlock === true && !istFlaechenSeite(n))
  const popupIds = popupSeiten.map((n) => n.id)

  const schluessel = (s: string): string => s.trim().toLocaleLowerCase('de-DE')
  const nameZaehler = new Map<string, number>()
  for (const seite of seitenDerMaske(tree)) {
    nameZaehler.set(schluessel(seite.name), (nameZaehler.get(schluessel(seite.name)) ?? 0) + 1)
  }
  for (const [name, count] of nameZaehler) {
    if (count > 1) {
      results.push({
        name: 'Seitenname doppelt',
        ok: false,
        detail: `${count} Seiten heißen "${name}" — Namen müssen eindeutig sein, sonst trifft ein Knopf die falsche (Doppelklick auf den Reiter benennt um).`,
      })
    }
  }
  visit(tree[ROOT_ID])

  return results
}
