// Export-Tests des NACHSCHLAGE-Feldes („Kunde suchen, Nummer merken").
//
// Eigene Datei neben auswahlExport.test.ts, weil export.test.ts sonst wieder
// ueber den 500-Zeilen-Deckel waechst — dieselbe Testart, nur geteilt. Hier
// steht, was den Export ueberleben MUSS, sonst kann der Bediener in der Maske
// nichts nachschlagen, und zwar STILL: die Einstellungen als Attribute und
// die Nachschlage-Quelle in den SEvariablen.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Importe: registrieren die beteiligten Bausteine. Die TABELLE
// gehoert dazu, seit hier ein Folger vorkommt — ohne ihre Registrierung waere
// `type: 'tabelle'` dem Preflight unbekannt, und er pruefte an ihr GAR NICHTS.
// Genau so entsteht ein gruener Test, den das Produkt nie erreicht (Befund B1).
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'

const ADRESSEN = [{
  id: 'q-adr',
  name: 'Adressen',
  kind: 'adressstamm' as const,
  indexField: '110_10',
  fields: [
    { code: '10_30', label: 'Name' },
    { code: '110_10', label: 'Adressnummer' },
  ],
}]

// Zweite Quelle fuer den Folge-Fall: die Haustiere tragen die Adressnummer
// ihres Halters (2_8) — daran erkennt man, welche zu einem Kunden gehoeren.
const TIERE = [{
  id: 'q-tiere',
  name: 'Kundenhaustiere',
  kind: 'idb' as const,
  idbId: 'IDBID0018',
  indexField: '0_10',
  fields: [
    { code: '0_10', label: 'Satz-Nr.' },
    { code: '18_30', label: 'Tiername' },
    { code: '2_8', label: 'Adressnummer' },
  ],
}]

const BEIDE = [...ADRESSEN, ...TIERE]

// Ein vollstaendig eingestelltes Nachschlage-Feld.
const KUNDE_PROPS = {
  fieldType: 'nachschlagen', placeholder: 'Kunde', options: '',
  source: '', value: '', valueField: '', width: 240,
  nachschlagQuelle: 'q-adr', anzeigeFeld: '10_30', anzeigeTitel: 'Name',
  speicherFeld: '110_10', speicherTitel: 'Adressnummer',
}

const TEXT_PROPS = {
  fieldType: 'text', placeholder: 'Notiz', options: '',
  source: '', value: '', valueField: '', width: 240,
}

const baumMit = (props: Record<string, unknown>): BlockTree => ({
  root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde'] },
  kunde: { id: 'kunde', type: 'formfeld', props, parentId: 'root', childIds: [] },
})

describe('Nachschlage-Feld im Export', () => {
  it('Einstellungen als Attribute und die Quelle in den SEvariablen', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'notiz'] },
      kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
      notiz: { id: 'notiz', type: 'formfeld', props: TEXT_PROPS, parentId: 'root', childIds: [] },
    }
    const { html, sevariablen } = exportMask(tree, 'Maske', ADRESSEN)
    const kundeTag = /<ff-formfeld[^>]*placeholder="Kunde"[^>]*/.exec(html)?.[0] ?? ''
    // Ohne diese vier Attribute weiss das Fenster in der Maske nicht, WORAUS
    // es waehlen laesst und WAS es anzeigt bzw. merkt.
    expect(kundeTag).toContain('nachschlagquelle="q-adr"')
    expect(kundeTag).toContain('anzeigefeld="10_30"')
    expect(kundeTag).toContain('anzeigetitel="Name"')
    expect(kundeTag).toContain('speicherfeld="110_10"')
    // Und die Nachschlage-Quelle steht in den SEvariablen: sonst schickt
    // SoftEngine ihre Daten nie und das Fenster bleibt leer.
    expect(JSON.parse(sevariablen).SEFILELOOP).toHaveLength(1)
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })

  it('„Einzigen Treffer übernehmen" ueberlebt den Export', () => {
    // Nutzer-Entscheidung 2026-08-05. Faellt das Attribut weg, wartet die Maske
    // auf einen Lupen-Klick, den der Bauer dem Bediener ersparen wollte — und
    // niemand sieht, dass die Einstellung verloren ging (WYSIWYG-Bruch,
    // Regel 1). Nur der TAG wird geprueft, nicht das ganze Dokument: das
    // eingebettete Runtime-Buendel enthaelt denselben Namen als minifizierte
    // Zuweisung.
    const tag = (html: string): string => /<ff-formfeld[^>]*>/.exec(html)?.[0] ?? ''
    const an = tag(exportMask(baumMit({ ...KUNDE_PROPS, einzigerTreffer: 'ja' }), 'M', ADRESSEN).html)
    expect(an).toMatch(/\seinzigerTreffer="ja"/i)
    // Standard (nein) schreibt KEIN Attribut — sonst waere jede bestehende
    // Maske im Export anders, und der Byte-Waechter haette angeschlagen.
    const aus = tag(exportMask(baumMit(KUNDE_PROPS), 'M', ADRESSEN).html)
    expect(aus).not.toMatch(/einzigerTreffer=/i)
  })

  it('halb eingestellt blockiert den Export im Klartext', () => {
    // Quelle gewaehlt, aber „Gespeichert wird" fehlt: die Lupe koennte in der
    // Maske nur den Fehlerbalken zeigen.
    const tree = baumMit({ ...KUNDE_PROPS, speicherFeld: '', speicherTitel: '' })
    const problem = preflightMask(tree, ADRESSEN, [])
    expect(problem.some((r) => r.detail.includes('Gespeichert wird'))).toBe(true)
  })

  it('geloeschtes Feld der Nachschlage-Quelle blockiert ebenfalls', () => {
    const tree = baumMit({ ...KUNDE_PROPS, speicherFeld: '999_9' })
    expect(preflightMask(tree, ADRESSEN, []).some((r) => r.detail.includes('999_9'))).toBe(true)
  })

  it('gar nichts eingestellt blockiert NICHT — angefangen ist nicht halbfertig', () => {
    const tree = baumMit({
      ...KUNDE_PROPS, nachschlagQuelle: '', anzeigeFeld: '', anzeigeTitel: '',
      speicherFeld: '', speicherTitel: '',
    })
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })

  it('das Feld ist Auswahl-GEBER und traegt data-ff-id — ein Textfeld nicht', () => {
    // Hergeleitet, nicht angemeldet (2026-08-06): das Nachschlage-Feld laesst
    // den Bediener im Fenster einen Satz herausgreifen und hat dafuer eine
    // Quelle — also gibt es eine Auswahl ab, und Folger brauchen seine Kennung.
    // Vorher stand es trotz sichtbarer Satz-Wahl in keiner Geber-Liste.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'notiz'] },
      kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
      notiz: { id: 'notiz', type: 'formfeld', props: TEXT_PROPS, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree, 'Maske', ADRESSEN)
    expect(html).toMatch(/<ff-formfeld[^>]*\sdata-ff-id="kunde"/)
    expect(html).not.toMatch(/<ff-formfeld[^>]*\sdata-ff-id="notiz"/)
  })

  it('ohne eingestellte Nachschlage-Quelle kein data-ff-id — es gibt kein Fenster', () => {
    const { html } = exportMask(
      baumMit({ ...KUNDE_PROPS, nachschlagQuelle: '', anzeigeFeld: '', anzeigeTitel: '', speicherFeld: '', speicherTitel: '' }),
      'Maske', ADRESSEN,
    )
    // Am TAG geprueft: das eingebettete Laufzeit-Buendel enthaelt den
    // Attributnamen als Code-Text.
    expect(html).not.toMatch(/<ff-formfeld[^>]*\sdata-ff-id=/)
  })

  it('eine Tabelle darf dem Nachschlage-Feld FOLGEN (Preflight sagt ja)', () => {
    // Der Fall: Kunde nachschlagen, darunter seine Belege. Bis 2026-08-06 war
    // dieser Geber nicht waehlbar — die Verbindung liess sich gar nicht bauen.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'belege'] },
      kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
      belege: {
        id: 'belege', type: 'tabelle',
        props: {
          width: 'fill', source: 'q-adr', spalten: [{ titel: 'Name', feld: '10_30' }],
          // fromField = Feld der NACHSCHLAGE-Quelle (dort stammt der Satz her).
          folgtAuswahl: [{ geberId: 'kunde', keyPairs: [{ fromField: '110_10', toField: '110_10' }] }],
        },
        parentId: 'root', childIds: [],
      },
    }
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])

    // Und die Gegenprobe: Feldtyp zurueck auf Text -> kein Geber mehr, und der
    // Export blockt die dann stumme Folge im Klartext.
    tree.kunde.props = { ...KUNDE_PROPS, fieldType: 'text' }
    expect(preflightMask(tree, ADRESSEN, []).some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
  })

  // Der Fall des Nutzers (2026-08-06): Kunde-Feld (Geber) + Haustier-Feld, das
  // ihm folgt. Die Lupe am Haustier-Feld zeigt dann nur die Haustiere DIESES
  // Kunden. Das Feld RECHTS im Feldpaar gehoert der Quelle, deren Zeilen das
  // FENSTER zeigt (Kundenhaustiere) — nicht der eigenen Datenbindung des
  // Feldes, die es hier gar nicht hat.
  const kundeUndTier = (toField: string): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'tier'] },
    kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
    tier: {
      id: 'tier', type: 'formfeld',
      props: {
        fieldType: 'nachschlagen', placeholder: 'Haustier', options: '',
        source: '', value: '', valueField: '', width: 240,
        nachschlagQuelle: 'q-tiere', anzeigeFeld: '18_30', anzeigeTitel: 'Tiername',
        speicherFeld: '0_10', speicherTitel: 'Satz-Nr.',
        // fromField = Adressnummer in der Nachschlage-Quelle des GEBERS.
        folgtAuswahl: [{ geberId: 'kunde', keyPairs: [{ fromField: '110_10', toField }] }],
      },
      parentId: 'root', childIds: [],
    },
  })

  it('ein Nachschlage-Feld folgt einem anderen: die Folge reist mit', () => {
    const tree = kundeUndTier('2_8')
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tierTag = /<ff-formfeld[^>]*placeholder="Haustier"[^>]*/.exec(html)?.[0] ?? ''
    expect(tierTag).toContain('folgtauswahl=')
    // Beide Nachschlage-Quellen muessen in den SEvariablen stehen — sonst
    // schickt SoftEngine die Haustiere nie und das Fenster bleibt leer.
    expect(JSON.parse(sevariablen).SEFILELOOP).toHaveLength(2)
    expect(preflightMask(tree, BEIDE, [])).toEqual([])
  })

  it('Preflight prueft das Schluesselfeld gegen die NACHSCHLAGE-Quelle', () => {
    // 110_10 gibt es nur in den Adressen, nicht in den Haustieren. Nimmt man
    // dort das Feld der falschen Tabelle, passt in der Maske KEIN Satz: die
    // Lupe waere immer leer, und niemand sagte warum.
    const falsch = preflightMask(kundeUndTier('110_10'), BEIDE, [])
    expect(falsch.some((r) => r.name === 'Auswahl-Folge Feld fehlt')).toBe(true)
    expect(falsch.some((r) => r.detail.includes('Kundenhaustiere'))).toBe(true)
  })

  it('eine alte EIGENE Bindung bleibt daheim: ein Quellen-Waehler, ein SEFILELOOP', () => {
    // Der Bauer hatte das Feld an eine Datenquelle gebunden und stellt es dann
    // auf „Nachschlagen": seine eigene Bindung ist damit unsichtbar (der
    // Inspector zeigt nur noch „Quelle"). Sie darf dann auch nicht mitreisen —
    // sonst laedt die Maske eine ganze Tabelle, die kein Baustein liest, und
    // SoftEngine schiebt sie bei jedem Refresh umsonst.
    const tree = baumMit({ ...KUNDE_PROPS, source: 'q-tiere', valueField: '18_30' })
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tag = /<ff-formfeld[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('nachschlagquelle="q-adr"')
    expect(tag).not.toContain('source=')
    expect(tag).not.toContain('valuefield=')
    // NUR die Nachschlage-Quelle steht in den SEvariablen.
    expect(JSON.parse(sevariablen).SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS)).toEqual(['Adressen'])
    // Und blockieren darf die unsichtbare Bindung auch nicht.
    expect(preflightMask(tree, BEIDE, [])).toEqual([])
  })

  it('Gegenprobe Textfeld: dieselbe Bindung reist mit und laedt ihre Quelle', () => {
    const tree = baumMit({ ...TEXT_PROPS, source: 'q-tiere', valueField: '18_30' })
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tag = /<ff-formfeld[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('source="q-tiere"')
    expect(tag).toContain('valuefield="18_30"')
    expect(JSON.parse(sevariablen).SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS)).toEqual(['Kundenhaustiere'])
  })

  it('eine ins Leere zeigende alte Bindung blockiert am Nachschlage-Feld NICHT', () => {
    // Geloeschte Quelle bzw. geloeschtes Feld — beides waere am Textfeld ein
    // Blocker (S1a/S1b). Unsichtbar ist nicht halbfertig: der Bauer sieht die
    // Einstellung nirgends, also darf sie ihm den Export nicht verriegeln.
    const tree = baumMit({ ...KUNDE_PROPS, source: 'gibt-es-nicht', valueField: '999_9' })
    expect(preflightMask(tree, BEIDE, [])).toEqual([])
    // Gegenprobe: am Textfeld blockt genau dieselbe Einstellung.
    const text = baumMit({ ...TEXT_PROPS, source: 'gibt-es-nicht', valueField: '999_9' })
    expect(preflightMask(text, BEIDE, []).some((r) => r.name === 'Datenquelle fehlt')).toBe(true)
  })

  it('zurueckgestellter Feldtyp laesst die Nachschlage-Quelle daheim', () => {
    // Der Rest einer alten Einstellung darf keine ganze Tabelle in die Maske
    // laden, die kein Baustein liest — SoftEngine schoebe sie bei jedem
    // Refresh umsonst. Und blockieren darf er auch nicht: sichtbar ist die
    // Einstellung ja nicht mehr.
    const tree = baumMit({ ...KUNDE_PROPS, fieldType: 'text', speicherFeld: '999_9' })
    const { sevariablen } = exportMask(tree, 'Maske', ADRESSEN)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([])
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })
})
