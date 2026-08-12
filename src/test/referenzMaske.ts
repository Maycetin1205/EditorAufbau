// referenzMaske — die feste Referenzmaske des Export-Referenzabzugs
// (5. Wächter, Nutzer-Go 2026-07-17). Eine repräsentative Maske aus den
// ECHTEN Bausteinen, die möglichst viele Export-Wege gleichzeitig
// beschreitet: Kanban mit Musterkarte/Bindungen/Auffangspalte + Demo-Karte
// (fällt raus), Formularfeld mit eigener Quelle, Datum, Zeile, Popup-Seite,
// Ansicht-Seite (zweite Fläche), Aktionsketten (RELATION/START_TOOL/
// POPUP_OPEN), zwei Quellen-Arten
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
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['z1', 'board', 'feld', 'tab', 'tr1', 'txt', 'txt2', 'p1', 'a1', 'nav'] },
    z1: { id: 'z1', type: 'zeile', props: { width: 'fill', rasterX: 0, rasterY: 0, rasterW: 24, rasterH: 3 }, parentId: 'root', childIds: ['datum1', 'knopf'] },
    // Ohne Eigenschaften: DatumBlock.defaultProps ist leer. Bis 2026-07-28
    // stand hier ein `zeigt: 'datum'` aus einer alten Fassung — der Export
    // warf es still weg, weil er nur bekannte Props schreibt. Genau deshalb
    // faellt so etwas nie auf; die Testmaske soll den echten Stand zeigen.
    datum1: { id: 'datum1', type: 'datum', props: {}, parentId: 'z1', childIds: [] },
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
    sp2: { id: 'sp2', type: 'kanban-spalte', props: { heading: 'Erledigt' }, parentId: 'board', childIds: [] },
    sp3: { id: 'sp3', type: 'kanban-spalte', props: { heading: 'Auffang', auffang: 'ja' }, parentId: 'board', childIds: [] },
    feld: {
      id: 'feld', type: 'formfeld',
      // Bewusst eingerückt + halbe Breite: der Byte-Wächter sichert damit auch
      // x != 0 / w != volle Breite ab (nicht nur den Trivialfall untereinander).
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
    // Tabelle, Text und Trenner fehlten bis 2026-07-28 in dieser Maske — der
    // Byte-Waechter sah sie also nie (Befund B2). Ausgerechnet die Tabelle:
    // ihr Spalten-Export war am 2026-07-24 still kaputt (umbenannte Titel
    // fielen auf die Standardtitel zurueck) und niemandem fiel es auf.
    // Darum steht hier GENAU dieser Fall: UMBENANNTE Titel + gebundene
    // Feldcodes + Tagesfilter. `check:regeln` haelt die Luecke jetzt zu.
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
    txt: {
      id: 'txt', type: 'text',
      // Umlaut + Sonderzeichen: nimmt den Escaping-Weg des Serializers mit.
      props: { text: 'Übersicht — Sprechstunde à la carte', rasterX: 0, rasterY: 35, rasterW: 12, rasterH: 2 },
      parentId: 'root', childIds: [],
    },
    // Der GEBUNDENE Text (2026-08-06): der Byte-Waechter sah bis hierher nur
    // den getippten Text in Standardfarbe — also genau die zwei Wege NICHT,
    // die der Text 2026-08-04 neu bekam (Bindung an ein Feld der Datenquelle,
    // Farbe aus den Masken-Tokens). Faellt eines der beiden Attribute im
    // Export weg, zeigt die Maske etwas anderes als der Editor (Regel 1) —
    // und seit Standardwerte nicht mehr mitreisen, entscheidet sich genau
    // hier, dass ein NICHT-Standard sehr wohl mitreist.
    // Quelle/Feld sind die der Maske schon bekannten (Adressstamm, Name);
    // die SEFILELOOP aendert sich dadurch nicht.
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
      parentId: 'root', childIds: ['pz1'],
    },
    pz1: { id: 'pz1', type: 'zeile', props: {}, parentId: 'p1', childIds: ['pdatum'] },
    pdatum: { id: 'pdatum', type: 'datum', props: {}, parentId: 'pz1', childIds: [] },
    // Die zweite FLÄCHE (N1, 2026-08-12): sie faellt im Abzug durch drei
    // Dinge auf, die je fuer sich still kaputtgehen koennten — `hidden` (ohne
    // das startet die Maske mit zwei Flaechen uebereinander), KEIN eigener
    // Zellen-Style/fuellt am Ansicht-Element selbst (es hat keinen Kasten),
    // und der durchgereichte ZELLEN-Style an ihrem Kind. Genau dieses letzte
    // Byte entscheidet, ob ein Baustein in der Maske dort sitzt, wo er im
    // Editor lag (Regel 1).
    a1: {
      id: 'a1', type: 'ansicht', props: { name: 'Terminkalender' },
      parentId: 'root', childIds: ['atext'],
    },
    atext: {
      id: 'atext', type: 'text',
      props: { text: 'Wochenübersicht', rasterX: 2, rasterY: 1, rasterW: 10, rasterH: 2 },
      parentId: 'a1', childIds: [],
    },
    // Die Navi (N2) mit zwei Eintraegen — Hauptseite und Ansicht. Der Abzug
    // haelt damit fest, dass der KLARNAME mitreist (der Adressweg der
    // Laufzeit) und die Seiten-id NICHT: sie zeigt auf einen Knoten des
    // Editor-Baums, den die Maske nicht kennt.
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
        // Datumsfeld fuer den Tagesfilter der Tabelle. Aendert die
        // SEvariablen NICHT: eine IDB-Quelle exportiert FELDER:'*'.
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
