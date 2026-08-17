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
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['datum1', 'knopf', 'board', 'feld', 'tab', 'tr1', 'bild1', 'txt', 'txt2', 'p1', 'a1', 'nav'] },

    datum1: {
      id: 'datum1', type: 'datum',
      props: { rasterX: 0, rasterY: 0, rasterW: 9, rasterH: 3 },
      parentId: 'root', childIds: [],
    },
    knopf: {
      id: 'knopf', type: 'button',
      props: { label: 'Nachfaß öffnen — ätsch', rasterX: 9, rasterY: 0, rasterW: 4, rasterH: 3 },
      parentId: 'root', childIds: [],
      events: {
        onClick: [
          { id: 's1', type: 'POPUP_OPEN', resultKey: '', popupId: 'p1' },
          { id: 's2', type: 'START_TOOL', resultKey: '', toolNr: '42', toolParams: ['{PINDEX}', 'fest ä'] },
        ],
      },
    },
    board: {
      id: 'board', type: 'kanban',
      props: { source: 'q-termine', statusField: '20_10', height: 'fill', rasterX: 0, rasterY: 3, rasterW: 24, rasterH: 20 },
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

    sp2: {
      id: 'sp2', type: 'kanban-spalte',
      props: { heading: 'Erledigt', zimmerField: '50_10' },
      parentId: 'board', childIds: ['zi1', 'zi2'],
    },
    zi1: { id: 'zi1', type: 'kanban-zimmer', props: { heading: 'Zimmer 1' }, parentId: 'sp2', childIds: ['zkarte'] },
    zkarte: { id: 'zkarte', type: 'card', props: { heading: 'Im Zimmer' }, parentId: 'zi1', childIds: [] },
    zi2: { id: 'zi2', type: 'kanban-zimmer', props: { heading: 'Zimmer 2' }, parentId: 'sp2', childIds: [] },
    sp3: { id: 'sp3', type: 'kanban-spalte', props: { heading: 'Auffang', auffang: 'ja' }, parentId: 'board', childIds: [] },
    feld: {
      id: 'feld', type: 'formfeld',

      props: { label: 'Tiername', source: 'q-adressen', valueField: '10_30', rasterX: 6, rasterY: 23, rasterW: 12, rasterH: 3 },
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

    tab: {
      id: 'tab', type: 'tabelle',
      props: {
        source: 'q-termine', suche: 'nein', tagField: '50_10',
        spalten: [
          { titel: 'Wer', feld: '40_20' },
          { titel: 'Wann', feld: '10_5' },
          { titel: 'Tier — Ärztin', feld: '30_10' },
        ],
        rasterX: 0, rasterY: 26, rasterW: 24, rasterH: 8,
      },
      parentId: 'root', childIds: [],
    },
    tr1: {
      id: 'tr1', type: 'trenner',
      props: { rasterX: 0, rasterY: 34, rasterW: 24, rasterH: 1 },
      parentId: 'root', childIds: [],
    },

    bild1: {
      id: 'bild1', type: 'bild',
      props: {
        quelle: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        rasterX: 18, rasterY: 35, rasterW: 6, rasterH: 6,
      },
      parentId: 'root', childIds: [],
    },
    txt: {
      id: 'txt', type: 'text',

      props: { text: 'Übersicht — Sprechstunde à la carte', rasterX: 0, rasterY: 35, rasterW: 12, rasterH: 2 },
      parentId: 'root', childIds: [],
    },

    txt2: {
      id: 'txt2', type: 'text',
      props: {
        text: 'Kundenname', source: 'q-adressen', textField: '10_30',
        farbe: 'gedaempft', rasterX: 12, rasterY: 35, rasterW: 12, rasterH: 2,
      },
      parentId: 'root', childIds: [],
    },

    p1: {
      id: 'p1', type: 'popup', props: { name: 'Neue Behandlung für Bello', breite: 480, hoehe: 320 },
      parentId: 'root', childIds: ['pdatum'],
    },
    pdatum: {
      id: 'pdatum', type: 'datum',
      props: { rasterX: 0, rasterY: 0, rasterW: 9, rasterH: 2 },
      parentId: 'p1', childIds: [],
    },

    a1: {
      id: 'a1', type: 'ansicht', props: { name: 'Terminkalender' },
      parentId: 'root', childIds: ['atext'],
    },
    atext: {
      id: 'atext', type: 'text',
      props: { text: 'Wochenübersicht', rasterX: 2, rasterY: 1, rasterW: 10, rasterH: 2 },
      parentId: 'a1', childIds: [],
    },

    nav: {
      id: 'nav', type: 'navi',
      props: { rasterX: 0, rasterY: 38, rasterW: 5, rasterH: 6 },
      parentId: 'root', childIds: ['nav1', 'nav2'],
    },
    nav1: {
      id: 'nav1', type: 'navi-eintrag',
      props: { seite: 'root', seitename: 'Hauptseite', ton: 'koralle' },
      parentId: 'nav', childIds: [],
    },
    nav2: {
      id: 'nav2', type: 'navi-eintrag',
      props: { seite: 'a1', seitename: 'Terminkalender', ton: 'himmel' },
      parentId: 'nav', childIds: [],
    },
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

        { code: '50_10', label: 'Datum' },
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
