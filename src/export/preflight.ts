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
import { bindingProp, listeLesen, zerlegeBindung } from '../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { actionValueTargets, auswahlGeberImBaum } from '../core/blocks/treeQuery'
import { ergebnisSchritteVor } from '../core/data/aktionen'
import { stepProblem } from '../core/data/schrittPruefung'
import { AUSWAHL_FOLGE_PROP, auswahlFolgenAus, folgeBrauchbar } from '../core/data/auswahlFolge'
import type { DataSource } from '../core/data/dataSources'
import type { RelationTemplate } from '../core/data/relations'
import { quellenInReichweite, quellenTraeger } from '../state/quellenOps'
import type { CheckResult } from './validator'

// S1a: Ein Block mit acceptsDataSource, dessen source-Prop auf eine nicht (mehr)
// vorhandene Vorlage zeigt, wuerde stumm ohne Datenanbindung exportieren. Das
// meldet die Preflight als Fehler. Leerer String = bewusst keine Quelle (ok).
// Gibt nur die GEFUNDENEN Probleme zurueck (je ein CheckResult, ok:false);
// ein sauberer Baum liefert eine leere Liste.
//
// Welche Quellen ein Baustein erreicht, beantwortet quellenOps — DIESELBE
// Funktion, die auch der Editor benutzt. Bis 2026-07-28 stand die Baumsuche
// hier als Abschrift mit dem Kommentar „DIESELBE Regel wie
// Editor.dataSourceFor“: eine Doppelung mit Ankuendigung. Meldete der
// Preflight etwas anderes, als der Editor anbietet, waere das schlimmer als
// keine Meldung.

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
  // Vorhandene Auswahl-Geber — dieselbe Baum-Abfrage, die auch die Steuerung
  // zum Anbieten benutzt. Ein Ketten-Parameter „Feld der gewaehlten Zeile" auf
  // einen geloeschten Geber loeste in der Maske still zu '' auf: der PUT
  // schriebe dann auf einen leeren Satz-Index (Regel 4, darum blocken).
  const auswahlGeberIds = auswahlGeberImBaum(tree).map((n) => n.id)
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
    // S1b: Eine GEBUNDENE Stelle zeigt auf ein Feld, das es an der genannten
    // Stelle nicht (mehr) gibt. Bis 2026-07-27 fiel das nirgends auf: die
    // Maske exportierte sauber, lud in SoftEngine sauber und blieb an dieser
    // Stelle einfach leer. Genau die Art stillen Scheiterns, die Regel 4
    // verbietet. Auch der Editor kann fuer einen unbekannten Code keinen
    // Klarnamen mehr zeigen — das WYSIWYG-Versprechen ist also schon vor dem
    // Export gebrochen, darum blocken statt warnen.
    //
    // Geprueft werden BEIDE Bindungsarten: feste Stellen (bindableSpots) und
    // Listen-Eintraege (listenBindung, z. B. Tabellenspalten). Die Listen
    // fehlten hier bis 2026-07-28 — ausgerechnet der Fall des Nutzers (eine
    // Spalte aus einer weiteren Quelle) waere damit ungeprueft geblieben.
    const pruefeBindung = (wert: unknown, stelle: string): void => {
      if (typeof wert !== 'string' || wert === '') return
      const bausteinName = def?.displayName ?? node.type
      const erreichbar = quellenInReichweite(tree, node.id, sources)
      // Wichtig: gefragt ist die Quelle des TRAEGERS, nicht die des Bausteins
      // selbst. Eine Karte im Kanban hat gar keine source-Prop — laese man
      // hier ihre eigene, meldete der Preflight bei einem Kanban mit
      // geloeschter Quelle zusaetzlich „Bindung ohne Datenquelle" fuer jede
      // Karte darin, obwohl die Ursache eine einzige ist (S1a meldet sie).
      if (erreichbar.length === 0) {
        // Gar keine Quelle in Reichweite — ausser die gewaehlte ist bloss
        // unauffindbar, das meldet S1a schon (nicht doppelt melden).
        const traeger = quellenTraeger(tree, node.id)
        if (typeof traeger?.props.source === 'string' && traeger.props.source !== '') return
        results.push({
          name: 'Bindung ohne Datenquelle',
          ok: false,
          detail: `Baustein "${bausteinName}", Stelle "${stelle}" ist an ein Feld gebunden, aber weder der Baustein noch ein Baustein darueber hat eine Datenquelle gewaehlt — die Stelle bliebe in der Maske leer.`,
        })
        return
      }
      const { quelleId, code } = zerlegeBindung(wert)
      const ziel = quelleId === ''
        ? erreichbar[0]
        : erreichbar.find((q) => q.source.id === quelleId)
      if (!ziel) {
        // Die genannte Quelle ist von hier aus nicht zu haben. Zwei sehr
        // verschiedene Ursachen, darum zwei Meldungen — „unbekannt" heilt man
        // in der Steuerung, „nicht verbunden" am Baustein.
        const inBibliothek = sources.find((s) => s.id === quelleId)
        results.push(inBibliothek
          ? {
              name: 'Verbindung fehlt',
              ok: false,
              detail: `Baustein "${bausteinName}", Stelle "${stelle}" holt ihren Wert aus "${inBibliothek.name}" — diese Datenquelle haengt aber nicht (mehr) vollstaendig an dem Baustein. Unter Daten die Datenquelle wieder hinzufuegen und die Felder angeben, an denen die zusammengehoerige Zeile erkannt wird.`,
            }
          : {
              name: 'Datenquelle unbekannt',
              ok: false,
              detail: `Baustein "${bausteinName}", Stelle "${stelle}" holt ihren Wert aus einer geloeschten oder unbekannten Datenquelle — die Stelle bliebe in der Maske leer.`,
            })
        return
      }
      if (!ziel.source.fields.some((f) => f.code === code)) {
        results.push({
          name: 'Gebundenes Feld fehlt',
          ok: false,
          detail: `Baustein "${bausteinName}", Stelle "${stelle}": das gebundene Feld gibt es in der Datenquelle "${ziel.source.name}" nicht (mehr) — die Stelle bliebe in der Maske leer. Feld neu waehlen oder das Feld in der Datenquelle wieder anlegen. (Feldcode ${code})`,
        })
      }
    }
    for (const spot of def?.bindableSpots ?? []) {
      pruefeBindung(node.props[bindingProp(spot.prop)], spot.label)
    }
    if (def?.listenBindung) {
      const b = def.listenBindung
      listeLesen(node.props[b.prop], b).forEach((eintrag, i) => {
        const titel = String(eintrag[b.titelKey] ?? '') || `Nr. ${i + 1}`
        pruefeBindung(eintrag[b.feldKey], titel)
      })
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
    // S-A (2026-08-05): eine Auswahl-Folge, deren Geber geloescht wurde oder
    // kein Auswahl-Geber (mehr) ist, filterte in der Maske stumm NIE — die
    // zweite Tabelle zeigte einfach immer alles, und niemand wuesste warum.
    // Ebenso eine Folge ohne ein einziges vollstaendiges Feldpaar: die
    // Laufzeit ignoriert sie (bewusst, halbe Schluessel treffen sonst
    // Falsches) — dann muss es der Export im Klartext sagen (Regel 4).
    if (def?.kannAuswahlFolgen) {
      for (const folge of auswahlFolgenAus(node.props[AUSWAHL_FOLGE_PROP])) {
        if (folge.geberId === '') continue // bewusst (noch) kein Geber gewaehlt
        const geber = tree[folge.geberId]
        const geberDef = geber ? getBlockDefinition(geber.type) : undefined
        if (!geber || geberDef?.auswahlGeber !== true) {
          results.push({
            name: 'Auswahl-Geber fehlt',
            ok: false,
            detail: `Baustein "${def.displayName ?? node.type}" folgt der Auswahl eines geloeschten oder dafuer ungeeigneten Bausteins — unter "Auswahl folgen" neu waehlen oder die Verbindung entfernen.`,
          })
        } else if (!folgeBrauchbar(folge)) {
          results.push({
            name: 'Auswahl-Folge unvollstaendig',
            ok: false,
            detail: `Baustein "${def.displayName ?? node.type}" folgt "${geberDef.displayName ?? geber.type}", aber es fehlt ein vollstaendiges Feldpaar (beide Seiten gefuellt) — die Maske wuerde nie filtern.`,
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
          ergebnisSchritteVor(steps, step.id, relations).map((g) => g.id), actionValues,
          auswahlGeberIds)
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
    .filter((n): n is BlockNode => n !== undefined && getBlockDefinition(n.type)?.pageBlock === true)
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
