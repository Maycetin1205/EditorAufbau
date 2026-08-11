// benutzteQuellen — „was benutzt diese Maske aus der Datenquellen-Bibliothek?"
//
// Zwei Antworten auf dieselbe Frage, beide aus DEMSELBEN Baum wie das Markup
// (Export-Grundsatz a):
//   collectDataSources     -> WELCHE Quellen (SEFILELOOP + FF_DATA_SOURCES)
//   benutzteFelderJeQuelle -> welche FELDER davon (die FELDER-Bestellung, S5.1)
//
// Herausgeloest aus exportMask (2026-08-11), weil die Datei mit 498 von 500
// Zeilen keinen Platz mehr fuer die zweite Antwort hatte (check:regeln, Deckel).
// Der Schnitt ist der natuerliche: drueben entstehen Markup und Reihenfolge,
// hier wird der Baum nach BENUTZUNG befragt.
//
// Kennt KEINEN Bausteintyp (Regel 2): welche Wege eine Quelle in die Maske
// nehmen kann, sagen ausschliesslich Registry-Eintraege (acceptsDataSource,
// customProperties kind 'quelle', blockEvents).

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import {
  bindingProp,
  eintragsFelderLesen,
  eintragsFelderVon,
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
import type { DataSource } from '../core/data/dataSources'
import {
  quelleBrauchbar,
  vollstaendigePaare,
  WEITERE_QUELLEN_PROP,
  weitereQuellenAus,
  type QuelleInReichweite,
} from '../core/data/sourceLinks'
import { quellenInReichweite } from '../state/quellenOps'

// Sammelt die im Baum angehängten Datenquellen (source-Prop von Blöcken mit
// acceptsDataSource) in Baum-Reihenfolge, dedupliziert — deterministisch.
// Unbekannte Vorlagen-ids werden hier als Fallback übersprungen; im echten
// Export-Fluss fängt die Preflight (preflight.ts, S1a) eine gelöschte Quelle
// jedoch VORHER ab und blockiert den Export (Toolbar).
// `sources` = die Vorlagen-Bibliothek.
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
    // Nur die Quelle, die der Baustein in seinem aktuellen Zustand WIRKLICH
    // traegt (traegtEigeneQuelle — dieselbe Antwort wie Inspector und
    // Preflight): die alte eigene Bindung eines Nachschlage-Feldes luede sonst
    // eine ganze Tabelle in die Maske, die kein Baustein liest. SoftEngine
    // schoebe sie bei jedem Refresh umsonst.
    if (traegtEigeneQuelle(node)) {
      add(node.props.source)
      // Auch die WEITEREN Quellen des Bausteins (2026-07-28). Ohne sie stünde
      // die zweite Tabelle in KEINER SEFILELOOP — SoftEngine schickte ihre
      // Daten nie, die Laufzeit fände keine Partnerzeile, und die Stelle
      // bliebe in der fertigen Maske still leer. Reihenfolge: erst die erste
      // Quelle des Bausteins, dann seine weiteren (deterministisch).
      for (const q of weitereQuellenAus(node.props[WEITERE_QUELLEN_PROP])) {
        if (quelleBrauchbar(q)) add(q.quelleId)
      }
    }
    // Und Quellen, die als PROPERTY am Baustein haengen (kind 'quelle', z. B.
    // die Nachschlage-Liste des Formularfelds) — registry-getrieben, kein
    // Bausteintyp hier. Dieselbe Begruendung wie oben: ohne diesen Schritt
    // stuende sie in KEINER SEFILELOOP und das Fenster bliebe leer.
    // NUR Props, die zum aktuellen Zustand gehoeren (propertySichtbar —
    // derselbe Auswerter wie im Inspector und im Preflight): der
    // Nachschlage-Rest eines laengst auf „Text" zurueckgestellten Feldes
    // luede sonst eine ganze Tabelle in die Maske, die kein Baustein liest.
    for (const prop of getBlockDefinition(node.type)?.customProperties ?? []) {
      if (prop.kind === 'quelle' && propertySichtbar(prop.visibleWhen, node.props)) {
        add(node.props[prop.attributeName])
      }
    }
    // Und die Quellen, die nur in einer AKTIONSKETTE gelesen werden (Parameter
    // „Feld einer Datenquelle"). Der Waehler in der Steuerung bietet die ganze
    // Bibliothek an — eine so benutzte Quelle haengt an KEINEM Baustein und
    // fehlte bis 2026-08-06 in SEFILELOOP und FF_DATA_SOURCES: SoftEngine
    // schickte ihre Daten nie, die Laufzeit fand die id nicht, und der
    // Parameter ging als LEERER String hinaus — ein PUT schrieb damit Leere,
    // ein GET suchte nach nichts. Still, in der fertigen Maske (Regel 4).
    for (const id of quellenIdsInKettenVon(node)) add(id)
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}

// ---------- Welche FELDER einer Quelle liest die Maske? (S5.1) ----------
//
// Wofuer: eine IDB-Quelle bestellte bisher `FELDER:'*'` — alle Felder aller
// Zeilen. SoftEngine macht fuer JEDEN gelieferten Wert einen Bild-Nachschlag
// (GET_RELATION 1911; Nutzer-Log 2026-08-11: 5 953 Aufrufe in 9,2 s beim
// Oeffnen). Die SE-Seite koennen wir nicht aendern, die MENGE liefert unsere
// Bestellung.
//
// WARUM DIESE LISTE VOLLSTAENDIG IST — und das ist keine Behauptung, sondern
// eine Folge der Bauart: die laufende Maske hat KEIN Feld-Woerterbuch.
// FF_DATA_SOURCES traegt bewusst nur id/name/tableId/indexField (s. exportMask),
// alles andere reist als ATTRIBUT. Die Laufzeit kann also ausschliesslich
// Feldcodes lesen, die der Export selbst hineingeschrieben hat. Diese Funktion
// zaehlt genau diese Schreibstellen ab:
//   1. Bindungen fester Stellen        -> Attribut `<prop>field` (bindableSpots)
//   2. Eintraege einer bindbaren Liste -> Attribut `spalten` (listenBindung),
//      samt den Zusatzfeldern der gewaehlten Darstellung („Bild + Name")
//   3. Feld-Properties                 -> eigenes Attribut (kind 'field')
//   4. Verknuepfungs-Schluessel        -> Attribut `weiterequellen` (BEIDE Seiten)
//   5. Auswahl-Folge-Schluessel        -> Attribut `folgtauswahl` (BEIDE Seiten)
//   6. Ketten-Parameter                -> Attribut `data-ff-aktionen`
//   7. die Datensatz-Nummer der Quelle -> FF_DATA_SOURCES.indexField; sie kommt
//      nicht aus dem Baum und wird deshalb erst in `felderFor` vorangestellt.
// Alle sieben sind Registry- bzw. Modell-Eintraege, keiner ist ein Bausteintyp
// (Regel 2): ein neuer Baustein bringt keine achte Stelle mit, ein neuer
// SCHRITT-Parametertyp oder eine neue Registry-Faehigkeit dagegen schon — die
// gehoert dann hierher.
//
// NICHT gezaehlt: `step_result.ergebnisFeld`. Dieses Feld wird aus der ANTWORT
// eines GET-Schritts gelesen (extractRelationFeld), nicht aus einer
// SEFILELOOP-Zeile — es in eine Bestellung aufzunehmen waere sinnlos.
//
// Im Zweifel ein Feld MEHR: der Baum wird ganz durchlaufen, auch die
// Musterkarten-Geschwister, die der Export gar nicht schreibt. Ein Feld zu viel
// kostet Datenmenge, ein Feld zu wenig laesst eine Stelle in der fertigen Maske
// still leer (Regel 4).
export function benutzteFelderJeQuelle(
  tree: BlockTree,
  sources: readonly DataSource[],
): Map<string, ReadonlySet<string>> {
  const felder = new Map<string, Set<string>>()
  // Reihenfolge = Einfuegereihenfolge des Set (deterministisch, weil der
  // Baumlauf deterministisch ist). Eine unbekannte Quellen-id landet hier
  // ebenfalls im Kasten; sie fragt nur nie jemand ab (felderFor wird allein
  // fuer die Quellen der SEFILELOOP gerufen).
  const merke = (quelleId: string, code: unknown): void => {
    if (quelleId === '' || typeof code !== 'string' || code.trim() === '') return
    const vorhanden = felder.get(quelleId)
    if (vorhanden) vorhanden.add(code.trim())
    else felder.set(quelleId, new Set([code.trim()]))
  }

  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    const def = getBlockDefinition(node.type)
    // Die Quellen in Reichweite: DIESELBE Aufloesung, die die Laufzeit benutzt
    // (macheFeldLeser am TRAEGER — die Karte holt ihre Felder von ihrem Kanban)
    // und die der Preflight prueft. Erst bei Bedarf gebaut, damit nicht jeder
    // Trenner und jeder Knopf die Baumsuche nach oben ausloest.
    let reichweite: QuelleInReichweite[] | undefined
    const inReichweite = (): QuelleInReichweite[] => (
      reichweite ??= quellenInReichweite(tree, node.id, sources)
    )
    // Eine BINDUNG, also der qualifizierbare Wert 'code' oder 'quelleId::code'
    // (zerlegeBindung = die EINE Zerlege-Stelle). Ohne Vorsilbe gilt die erste
    // Quelle in Reichweite — genau wie in fremdeQuellen/gebundeneStelle.
    const merkeBindung = (wert: unknown): void => {
      if (typeof wert !== 'string' || wert === '') return
      const { quelleId, code } = zerlegeBindung(wert)
      const ziel = quelleId === ''
        ? inReichweite()[0]
        : inReichweite().find((q) => q.source.id === quelleId)
      if (ziel) merke(ziel.source.id, code)
    }

    // 1. Feste bindbare Stellen — nur die HIER gerade bindbaren
    // (bindbareStellenVon): eine stille Bindung laesst der Export weg, also
    // liest sie in der Maske auch niemand.
    for (const spot of bindbareStellenVon(node)) {
      merkeBindung(node.props[bindingProp(spot.prop)])
    }
    // 2. Bindbare Liste (Tabellen-Spalten) samt den Zusatzfeldern der GERADE
    // gewaehlten Darstellung. Dieselbe Lesart wie Preflight und Laufzeit
    // (listeLesen/eintragsFelderVon) — eine liegen gebliebene Bindung einer
    // anderen Darstellung liest niemand, sie reist nicht einmal mit
    // (listeFuerExport).
    if (def?.listenBindung) {
      const b = def.listenBindung
      for (const eintrag of listeLesen(node.props[b.prop], b)) {
        merkeBindung(eintrag[b.feldKey])
        if (!b.eintragsWahl) continue
        const gebunden = eintragsFelderLesen(b.eintragsWahl, eintrag)
        for (const zf of eintragsFelderVon(b.eintragsWahl, eintrag)) {
          merkeBindung(gebunden[zf.key])
        }
      }
    }
    // 3. Feld-Properties (kind 'field': „Einsortieren nach", „Tag filtern
    // nach", „Angezeigt wird" …). Sie speichern einen NACKTEN Feldcode, nie
    // eine qualifizierte Bindung (PropControl schreibt `f.code`), und die
    // Laufzeit liest sie ohne zerlegeBindung. Ihre Quelle ist entweder die
    // Nachbar-Prop (quelleProp: die Nachschlage-Quelle) oder die Quelle in
    // Reichweite. Zustandsabhaengig wie ueberall (propertySichtbar): ein
    // verstecktes Feld liest die Laufzeit nicht — das Nachschlage-Feld vom Typ
    // Text steigt in hydrateField vorher aus.
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
    // 4. Verknuepfung mit einer WEITEREN Quelle: BEIDE Seiten jedes
    // vollstaendigen Schluesselpaares werden zur Laufzeit gelesen
    // (fremdeQuellen: fromField in der ersten Quelle, toField in der weiteren).
    // Fehlt eine Seite in der Bestellung, findet die Maske keine Partnerzeile
    // und die Fremdspalte bleibt still leer.
    if (traegtEigeneQuelle(node)) {
      const erste = typeof node.props.source === 'string' ? node.props.source : ''
      for (const q of weitereQuellenAus(node.props[WEITERE_QUELLEN_PROP])) {
        if (!quelleBrauchbar(q)) continue
        for (const paar of vollstaendigePaare(q)) {
          merke(erste, paar.fromField)
          merke(q.quelleId, paar.toField)
        }
      }
    }
    // 5. Auswahl folgen: ebenfalls beide Seiten (shared/auswahl,
    // zeilenNachAuswahl) — fromField in der Auswahl-Quelle des GEBERS, toField
    // in der eigenen. WELCHE Quelle das je Baustein ist, sagt
    // auswahlQuelleIdVon: beim Nachschlage-Feld die Nachschlage-Quelle, sonst
    // die eigene.
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
    // 6. Ketten-Parameter: „Feld einer Datenquelle" nennt seine Quelle selbst,
    // „Feld der gewaehlten Zeile" holt sie ueber den Geber-Baustein (dessen
    // angeklickte Zeile stammt aus DESSEN Auswahl-Quelle).
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
