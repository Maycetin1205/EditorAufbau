// preflight
// Semantische Export-Vorpruefung. Anders als validator.ts
// (prueft nur die Dateiform: Marker/LF/ASCII/Grundgeruest) sieht die Preflight
// den BAUM + die Vorlagen-Bibliothek und blockiert den Export bei kaputten
// Referenzen, statt sie still zu ueberspringen. Grund (Nordstern): der Export
// muss vollstaendig + korrekt sein — eine Maske mit geloeschter Datenquelle
// laedt in SoftEngine stumm keine Daten (tote Maske), das darf nicht passieren.
//
// Rein (kein DOM), damit in Node testbar. Nutzt CheckResult aus validator.ts,
// damit die Toolbar beide Pruefungen identisch behandelt (failedChecks + alert).

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { bindingProp } from '../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { actionValueTargets } from '../core/blocks/treeQuery'
import { ergebnisSchritteVor, stepProblem } from '../core/data/aktionen'
import type { DataSource } from '../core/data/dataSources'
import type { RelationTemplate } from '../core/data/relations'
import type { CheckResult } from './validator'

// S1a: Ein Block mit acceptsDataSource, dessen source-Prop auf eine nicht (mehr)
// vorhandene Vorlage zeigt, wuerde stumm ohne Datenanbindung exportieren. Das
// meldet die Preflight als Fehler. Leerer String = bewusst keine Quelle (ok).
// Gibt nur die GEFUNDENEN Probleme zurueck (je ein CheckResult, ok:false);
// ein sauberer Baum liefert eine leere Liste.
// Quelle in Reichweite eines Blocks — DIESELBE Regel wie Editor.dataSourceFor:
// der NAECHSTE Vorfahr (inkl. des Blocks selbst) mit acceptsDataSource
// bestimmt sie; weiter oben wird nicht gesucht. Hier ohne Store gebaut, damit
// die Preflight rein und in Node testbar bleibt.
// `gesetzt` unterscheidet „gar keine Quelle gewaehlt" von „Quelle gewaehlt,
// aber nicht auffindbar" — den zweiten Fall meldet bereits S1a.
function quelleInReichweite(
  tree: BlockTree,
  id: string,
  sources: readonly DataSource[],
): { gesetzt: boolean; quelle: DataSource | undefined } {
  let cur: BlockNode | undefined = tree[id]
  while (cur) {
    if (getBlockDefinition(cur.type)?.acceptsDataSource) {
      const sid = typeof cur.props.source === 'string' ? cur.props.source : ''
      return { gesetzt: sid !== '', quelle: sources.find((s) => s.id === sid) }
    }
    cur = cur.parentId ? tree[cur.parentId] : undefined
  }
  return { gesetzt: false, quelle: undefined }
}

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
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    const def = getBlockDefinition(node.type)
    if (def?.acceptsDataSource) {
      const id = node.props.source
      if (typeof id === 'string' && id !== '' && !sources.some((s) => s.id === id)) {
        results.push({
          name: 'Datenquelle fehlt',
          ok: false,
          detail: `Baustein "${def.displayName ?? def.type}" verweist auf eine geloeschte oder unbekannte Datenquelle.`,
        })
      }
    }
    // S1b: Eine GEBUNDENE Stelle zeigt auf einen Feldcode, den ihre Quelle
    // nicht (mehr) kennt — z. B. weil das Feld in der Steuerung geloescht
    // oder umbenannt wurde. Bis 2026-07-27 fiel das nirgends auf: die Maske
    // exportierte sauber, lud in SoftEngine sauber und blieb an dieser Stelle
    // einfach leer. Genau die Art stillen Scheiterns, die Regel 4 verbietet.
    // Auch der Editor kann fuer einen unbekannten Code keinen Klarnamen mehr
    // zeigen — das WYSIWYG-Versprechen ist also schon vor dem Export gebrochen,
    // darum blocken statt warnen (fuer IDB- wie Stamm-Quellen gleich).
    for (const spot of def?.bindableSpots ?? []) {
      const code = node.props[bindingProp(spot.prop)]
      if (typeof code !== 'string' || code === '') continue
      const { gesetzt, quelle } = quelleInReichweite(tree, node.id, sources)
      if (!gesetzt) {
        results.push({
          name: 'Bindung ohne Datenquelle',
          ok: false,
          detail: `Baustein "${def?.displayName ?? node.type}", Stelle "${spot.label}" ist an ein Feld gebunden, aber weder der Baustein noch ein Baustein darueber hat eine Datenquelle gewaehlt — die Stelle bliebe in der Maske leer.`,
        })
        continue
      }
      // Quelle gewaehlt, aber unauffindbar: meldet S1a schon (nicht doppelt).
      if (!quelle) continue
      if (!quelle.fields.some((f) => f.code === code)) {
        results.push({
          name: 'Gebundenes Feld fehlt',
          ok: false,
          detail: `Baustein "${def?.displayName ?? node.type}", Stelle "${spot.label}": das gebundene Feld gibt es in der Datenquelle "${quelle.name}" nicht (mehr) — die Stelle bliebe in der Maske leer. Feld neu waehlen oder das Feld in der Datenquelle wieder anlegen. (Feldcode ${code})`,
        })
      }
    }
    // B2: exklusive Geschwister-Kennzeichen (exclusiveAmongSiblings in der
    // PropertyDescription, z. B. die Auffangspalte). Der Store verhindert
    // ein doppeltes 'ja' beim Bedienen — ein geladener Altbestand oder
    // manipulierter Speicher nicht. Die Laufzeit naehme still die erste;
    // genau solche stillen Mehrdeutigkeiten blockiert der Export mit
    // Klartext. Registry-getrieben, kein `if type===`.
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
            detail: `Im Baustein "${def?.displayName ?? node.type}" tragen ${count} Bausteine "${childDef?.displayName ?? childType}" das Kennzeichen "${prop.name}" — hoechstens einer darf es tragen.`,
          })
        }
      }
    }
    // Z2: Aktionsketten mit nicht exportfaehigen Schritten (z. B. "Werkzeug
    // starten" ohne Werkzeug-Nummer) taeten in der Maske stumm nichts —
    // tote Aktion, darum blockieren. Das Typ-Wissen liegt im Modell
    // (stepProblem); hier nur Baustein + Ereignis als Klarnamen dazu.
    for (const [eventKey, steps] of Object.entries(node.events ?? {})) {
      const eventName = def?.blockEvents?.find((e) => e.key === eventKey)?.name ?? eventKey
      for (const step of steps) {
        const problem = stepProblem(step, relations, sources, popupIds,
          ergebnisSchritteVor(steps, step.id, relations).map((g) => g.id), actionValues)
        if (problem) {
          results.push({
            name: 'Aktion unvollstaendig',
            ok: false,
            detail: `Baustein "${def?.displayName ?? node.type}", Ereignis "${eventName}": ${problem}`,
          })
        }
      }
    }
    node.childIds.forEach((childId) => visit(tree[childId]))
  }
  // P-B: Popup-Seiten des Baums (pageBlock) — Schritte zeigen auf ihre id,
  // die Laufzeit adressiert sie über den Klarnamen. Darum: doppelte Namen
  // blockieren (der Öffnen-Schritt träfe sonst still das falsche Fenster).
  const popupSeiten = (tree[ROOT_ID]?.childIds ?? [])
    .map((id) => tree[id])
    .filter((n): n is BlockNode => Boolean(n) && getBlockDefinition(n!.type)?.pageBlock === true)
  const popupIds = popupSeiten.map((n) => n.id)
  const nameZaehler = new Map<string, number>()
  for (const seite of popupSeiten) {
    const name = typeof seite.props.name === 'string' ? seite.props.name : ''
    nameZaehler.set(name, (nameZaehler.get(name) ?? 0) + 1)
  }
  for (const [name, count] of nameZaehler) {
    if (count > 1) {
      results.push({
        name: 'Popup-Name doppelt',
        ok: false,
        detail: `${count} Popup-Seiten heißen "${name}" — Namen müssen eindeutig sein (Doppelklick auf den Fenstertitel benennt um).`,
      })
    }
  }
  visit(tree[ROOT_ID])
  return results
}
