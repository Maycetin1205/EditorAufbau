// preflight
// Semantische Export-Vorpruefung (Stabilisierung S1). Anders als validator.ts
// (prueft nur die Dateiform: Marker/LF/ASCII/Grundgeruest) sieht die Preflight
// den BAUM + die Vorlagen-Bibliothek und blockiert den Export bei kaputten
// Referenzen, statt sie still zu ueberspringen. Grund (Nordstern): der Export
// muss vollstaendig + korrekt sein — eine Maske mit geloeschter Datenquelle
// laedt in SoftEngine stumm keine Daten (tote Maske), das darf nicht passieren.
//
// Rein (kein DOM), damit in Node testbar. Nutzt CheckResult aus validator.ts,
// damit die Toolbar beide Pruefungen identisch behandelt (failedChecks + alert).

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { ergebnisSchritteVor, stepProblem } from '../core/data/aktionen'
import type { DataSource } from '../core/data/dataSources'
import type { RelationTemplate } from '../core/data/relations'
import type { CheckResult } from './validator'

// S1a: Ein Block mit acceptsDataSource, dessen source-Prop auf eine nicht (mehr)
// vorhandene Vorlage zeigt, wuerde stumm ohne Datenanbindung exportieren. Das
// meldet die Preflight als Fehler. Leerer String = bewusst keine Quelle (ok).
// Gibt nur die GEFUNDENEN Probleme zurueck (je ein CheckResult, ok:false);
// ein sauberer Baum liefert eine leere Liste.
export function preflightMask(
  tree: BlockTree,
  sources: readonly DataSource[],
  relations: readonly RelationTemplate[],
): CheckResult[] {
  const results: CheckResult[] = []
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
          ergebnisSchritteVor(steps, step.id, relations).map((g) => g.id))
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
