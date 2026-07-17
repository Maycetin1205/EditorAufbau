// referenzMaske — die feste Referenzmaske des Export-Referenzabzugs
// (5. Wächter, Nutzer-Go 2026-07-17). Eine repräsentative Maske aus den
// ECHTEN Bausteinen, die möglichst viele Export-Wege gleichzeitig
// beschreitet: Kanban mit Musterkarte/Bindungen/Auffangspalte + Demo-Karte
// (fällt raus), Formularfeld mit eigener Quelle, Datum, Zeile, Popup-Seite,
// Aktionsketten (RELATION/START_TOOL/POPUP_OPEN), zwei Quellen-Arten
// (IDB + Adreßstamm), Relations-Vorlage, Umlaute in Titel/Texten/Namen.
// Reine Daten — der Wächter (export/referenzabzug.test.ts) exportiert sie
// und vergleicht Byte für Byte gegen die festgeschriebene Referenz.

import type { BlockTree } from '../core/blocks/BlockData'
import type { DataSource } from '../core/data/dataSources'
import type { RelationTemplate } from '../core/data/relations'

export interface ReferenzMaske {
  titel: string
  tree: BlockTree
  sources: DataSource[]
  relations: RelationTemplate[]
}

export function referenzMaske(): ReferenzMaske {
  const tree: BlockTree = {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['z1', 'board', 'feld', 'p1'] },
    z1: { id: 'z1', type: 'zeile', props: { width: 'fill' }, parentId: 'root', childIds: ['datum1', 'knopf'] },
    datum1: { id: 'datum1', type: 'datum', props: { zeigt: 'datum' }, parentId: 'z1', childIds: [] },
    knopf: {
      id: 'knopf', type: 'button', props: { label: 'Nachfaß öffnen — ätsch' }, parentId: 'z1', childIds: [],
      events: {
        onClick: [
          { id: 's1', type: 'POPUP_OPEN', resultKey: '', popupId: 'p1' },
          { id: 's2', type: 'START_TOOL', resultKey: '', toolNr: '42', toolParams: ['{PINDEX}', 'fest ä'] },
        ],
      },
    },
    board: {
      id: 'board', type: 'kanban', props: { source: 'q-termine', statusField: '20_10', height: 'fill' },
      parentId: 'root', childIds: ['sp1', 'sp2', 'sp3'],
      events: {
        onCardDrop: [{
          id: 's3', type: 'RELATION', resultKey: '', relationId: 'rel-put',
          params: [
            { source: 'context', value: 'PINDEX' },
            { source: 'fixed', value: '' },
            { source: 'data_field', value: '30_10', dataSourceId: 'q-termine' },
          ],
          extraParams: [{ source: 'context', value: 'VALUE' }],
        }],
      },
    },
    sp1: { id: 'sp1', type: 'kanban-spalte', props: { heading: 'Offen' }, parentId: 'board', childIds: ['muster', 'demo'] },
    muster: {
      id: 'muster', type: 'card',
      props: {
        heading: 'Rückruf', headingField: '40_20', timeField: '10_5',
        avatarField: '30_10', chipText: 'Prüfen', text: 'Zeile mit Ümlaut',
      },
      parentId: 'sp1', childIds: [],
    },
    demo: { id: 'demo', type: 'card', props: { heading: 'Demo — fällt raus' }, parentId: 'sp1', childIds: [] },
    sp2: { id: 'sp2', type: 'kanban-spalte', props: { heading: 'Erledigt' }, parentId: 'board', childIds: [] },
    sp3: { id: 'sp3', type: 'kanban-spalte', props: { heading: 'Auffang', auffang: 'ja' }, parentId: 'board', childIds: [] },
    feld: {
      id: 'feld', type: 'formfeld', props: { label: 'Tiername', source: 'q-adressen', valueField: '10_30' },
      parentId: 'root', childIds: [],
      events: {
        onChange: [{
          id: 's4', type: 'RELATION', resultKey: '', relationId: 'rel-put',
          params: [
            { source: 'context', value: 'PINDEX' },
            { source: 'fixed', value: '0042' },
            { source: 'context', value: 'VALUE' },
          ],
          extraParams: [],
        }],
      },
    },
    p1: {
      id: 'p1', type: 'popup', props: { name: 'Neue Behandlung für Bello', breite: 480, hoehe: 320 },
      parentId: 'root', childIds: ['pz1'],
    },
    pz1: { id: 'pz1', type: 'zeile', props: {}, parentId: 'p1', childIds: ['pdatum'] },
    pdatum: { id: 'pdatum', type: 'datum', props: { zeigt: 'beides' }, parentId: 'pz1', childIds: [] },
  }

  const sources: DataSource[] = [
    {
      id: 'q-termine', name: 'Terminplaner', kind: 'idb',
      idbId: 'IDBID0004', indexField: '0_10',
      fields: [
        { code: '40_20', label: 'Titel' },
        { code: '10_5', label: 'Zeit' },
        { code: '30_10', label: 'Tier' },
        { code: '20_10', label: 'Status' },
      ],
    },
    {
      id: 'q-adressen', name: 'Adreßstamm', kind: 'adressstamm',
      fields: [{ code: '10_30', label: 'Name' }],
    },
  ]

  const relations: RelationTemplate[] = [
    {
      id: 'rel-put', name: 'Schreiben — Standard', verb: 'PUT_RELATION', nr: '0174',
      params: ['{PINDEX}', '', '{VALUE}'], allowExtraParams: true,
    },
  ]

  return { titel: 'Übersicht — Empfang & Söhne', tree, sources, relations }
}
