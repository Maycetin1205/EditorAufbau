// benutzteQuellen — „was benutzt diese Maske aus der Datenquellen-Bibliothek?"
//
// Herausgeloest aus exportMask (2026-08-11), weil die Datei mit 498 von 500
// Zeilen keinen Platz mehr fuer die naechste Antwort auf dieselbe Frage hatte
// (check:regeln, Deckel). Der Schnitt ist der natuerliche: drueben entstehen
// Markup und Reihenfolge, hier wird der Baum nach BENUTZUNG befragt.
//
// Dieser Umzug ist verhaltensneutral — Zeichen fuer Zeichen dieselbe Funktion,
// derselbe Export.
//
// Kennt KEINEN Bausteintyp (Regel 2): welche Wege eine Quelle in die Maske
// nehmen kann, sagen ausschliesslich Registry-Eintraege (acceptsDataSource,
// customProperties kind 'quelle', blockEvents).

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { propertySichtbar } from '../core/blocks/PropertyDescription'
import { quellenIdsInKettenVon, traegtEigeneQuelle } from '../core/blocks/treeQuery'
import type { DataSource } from '../core/data/dataSources'
import { quelleBrauchbar, WEITERE_QUELLEN_PROP, weitereQuellenAus } from '../core/data/sourceLinks'

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
