// Preflight-Tests
// Semantische Export-VORPRUEFUNG (preflightMask): sieht den Baum + die
// Bibliotheken und blockt kaputte Referenzen, BEVOR der Export entsteht.
// Die Byte-Seite (Serialisierung, Escaping, Validator) prueft export.test.ts;
// eigene Datei seit 2026-07-27 (500-Zeilen-Deckel: eine Datei, eine Aufgabe).
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Imports: registrieren die echten Bausteine der Faelle.
import '../blocks/popup/PopupBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { registerTestBlocks, TEST_EVENT_BLOCK } from '../test/testBlocks'

registerTestBlocks()

describe('preflightMask', () => {
  it('blockt Bindungen ohne Quelle und auf geloeschte Felder (S1b)', () => {
    // Echtes Formularfeld (acceptsDataSource + bindbare Stelle "Wert"):
    // ein Baum, ein Feld, die Bindungs-Props variieren je Fall.
    const feld = (props: Record<string, string>): BlockTree => ({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['feld'] },
      feld: {
        id: 'feld', type: 'formfeld', parentId: 'root', childIds: [],
        props: {
          fieldType: 'text', placeholder: 'Kunde', options: '',
          source: '', value: '', valueField: '', width: 240, ...props,
        },
      },
    })
    const sources = [{
      id: 'q1', name: 'Termine', kind: 'idb' as const,
      idbId: 'IDBID0001', indexField: '0_10', fields: [{ code: '2_8', label: 'Kunde' }],
    }]
    // Gebunden und die Quelle kennt das Feld → sauber, keine Meldung.
    expect(preflightMask(feld({ source: 'q1', valueField: '2_8' }), sources, [])).toEqual([])
    // Die Quelle kennt den Feldcode nicht (mehr) → blocken, sonst bliebe die
    // Stelle in SoftEngine still leer (der Anlass fuer S1b).
    expect(preflightMask(feld({ source: 'q1', valueField: '99_9' }), sources, [])
      .some((r) => r.name === 'Gebundenes Feld fehlt')).toBe(true)
    // Gebunden, aber nirgends eine Quelle gewaehlt → eigene Meldung.
    expect(preflightMask(feld({ valueField: '2_8' }), sources, [])
      .some((r) => r.name === 'Bindung ohne Datenquelle')).toBe(true)
    // Quelle gewaehlt, aber geloescht: DAS meldet schon S1a — S1b schweigt,
    // damit derselbe Fehler nicht doppelt vor dem Bediener steht.
    const kaputt = preflightMask(feld({ source: 'weg', valueField: '2_8' }), sources, [])
    expect(kaputt.some((r) => r.name === 'Datenquelle fehlt')).toBe(true)
    expect(kaputt.some((r) => r.name === 'Gebundenes Feld fehlt')).toBe(false)
  })

  it('nennt den Baustein mit seinem Klarnamen, nicht nur mit dem Typ (2026-08-06)', () => {
    // Zwei Formularfelder, beide kaputt gebunden. Stand vorher in beiden
    // Meldungen nur "Formularfeld", war nicht zu erkennen, WELCHES gemeint
    // ist — der Bediener konnte den Export nicht entblocken.
    const feld = (id: string, name: string) => ({
      id, type: 'formfeld', parentId: 'root', childIds: [],
      props: {
        fieldType: 'text', placeholder: name, options: '',
        source: '', value: '', valueField: '99_9', width: 240,
      },
    })
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'b'] },
      a: feld('a', 'Kunde'),
      b: feld('b', 'Haustier'),
    }
    const texte = preflightMask(tree, [], []).map((r) => r.detail)
    expect(texte.some((t) => t.includes('Formularfeld — Kunde'))).toBe(true)
    expect(texte.some((t) => t.includes('Formularfeld — Haustier'))).toBe(true)
  })

  it('Popup-Schritt reist mit dem Klarnamen; Preflight blockt gelöschte Ziele und Doppelnamen (P-B)', () => {
    const popup = (id: string, name: string) => ({
      id, type: 'popup',
      props: { name, breite: 400, hoehe: 300 },
      parentId: 'root', childIds: [],
    })
    const knopf = {
      id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
      events: {
        onClick: [{ id: 's1', type: 'POPUP_OPEN' as const, resultKey: '', popupId: 'p1' }],
      },
    }
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'p1'] },
      a: knopf,
      p1: popup('p1', 'Neue Behandlung'),
    }
    const { html } = exportMask(tree)
    // Im Ketten-Attribut steht der KLARNAME der Seite, nie die Editor-id.
    const attr = /data-ff-aktionen="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(attr).toContain('&quot;popup&quot;:&quot;Neue Behandlung&quot;')
    expect(attr).not.toContain('popupId')
    expect(attr).not.toContain('p1')
    expect(preflightMask(tree, [], [])).toEqual([])

    // Schritt zeigt auf eine gelöschte Popup-Seite → Preflight blockt.
    const ohneSeite: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: knopf,
    }
    expect(preflightMask(ohneSeite, [], []).some((r) =>
      r.detail.includes('gelöschte Popup-Seite'))).toBe(true)

    // Zwei Popups mit demselben Namen → Preflight blockt (Laufzeit-Identität).
    const doppelt: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['p1', 'p2'] },
      p1: popup('p1', 'Neue Behandlung'),
      p2: popup('p2', 'Neue Behandlung'),
    }
    expect(preflightMask(doppelt, [], []).some((r) => r.name === 'Popup-Name doppelt')).toBe(true)
  })

  // --- Bindungen an eine WEITERE Datenquelle (2026-07-28) -----------------
  //
  // Ab jetzt kann eine Stelle sagen, aus welcher Quelle ihr Feld kommt. Drei
  // neue Arten, wie das schiefgehen kann — alle drei blieben in SoftEngine
  // still leer, also blockt der Export mit Klartext (Regel 4).
  //
  // Geprueft wird an einer TABELLENSPALTE. Das ist Absicht: Listen-Bindungen
  // wurden bis heute gar nicht geprueft — ausgerechnet der Fall des Nutzers
  // waere ungeprueft geblieben.
  it('prueft Tabellenspalten und die Angabe der Quelle', () => {
    const tabelle = (spalten: { titel: string; feld: string }[], weitereQuellen: unknown[] = []): BlockTree => ({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'termine', weitereQuellen, spalten,
          tagField: '', suche: 'nein',
        },
      },
    })
    const verbindung = [{ quelleId: 'tiere', keyPairs: [{ fromField: '10_8', toField: '10_8' }] }]
    const sources = [
      {
        id: 'termine', name: 'Terminplaner', kind: 'idb' as const, idbId: 'IDBID0001',
        indexField: '0_10', fields: [{ code: '10_8', label: 'Adressnummer' }, { code: '78_30', label: 'Tiername' }],
      },
      {
        id: 'tiere', name: 'Kundenhaustiere', kind: 'idb' as const, idbId: 'IDBID0004',
        fields: [{ code: '10_8', label: 'Adressnummer' }, { code: '128_350', label: 'Notiz' }],
      },
    ]
    const namen = (t: BlockTree) => preflightMask(t, sources, []).map((r) => r.name)

    // Sauber: eigene Spalte + Fremdspalte mit vollstaendiger Verbindung.
    expect(namen(tabelle(
      [{ titel: 'Tiername', feld: '78_30' }, { titel: 'Notiz', feld: 'tiere::128_350' }],
      verbindung,
    ))).toEqual([])

    // Spalte der EIGENEN Quelle mit unbekanntem Feldcode — bis 2026-07-28
    // fiel das durch, weil Listen gar nicht geprueft wurden.
    expect(namen(tabelle([{ titel: 'Weg', feld: '99_9' }])))
      .toContain('Gebundenes Feld fehlt')

    // Fremdspalte, aber die Verbindung fehlt am Baustein: die Laufzeit faende
    // die Partnerzeile nicht.
    expect(namen(tabelle([{ titel: 'Notiz', feld: 'tiere::128_350' }])))
      .toContain('Verbindung fehlt')

    // Halbfertige Verbindung zaehlt wie keine.
    expect(namen(tabelle(
      [{ titel: 'Notiz', feld: 'tiere::128_350' }],
      [{ quelleId: 'tiere', keyPairs: [{ fromField: '10_8', toField: '' }] }],
    ))).toContain('Verbindung fehlt')

    // Genannte Quelle gibt es gar nicht (mehr) — andere Ursache, andere Meldung.
    expect(namen(tabelle([{ titel: 'X', feld: 'gibtsnicht::1_2' }])))
      .toContain('Datenquelle unbekannt')

    // Verbindung steht, aber das Feld gibt es in der Fremdquelle nicht.
    expect(namen(tabelle([{ titel: 'X', feld: 'tiere::99_9' }], verbindung)))
      .toContain('Gebundenes Feld fehlt')
  })

  it('meldet eine geloeschte Quelle EINMAL, nicht zusaetzlich je gebundener Stelle', () => {
    // Die Karte im Kanban hat keine eigene source-Prop — sie erbt die des
    // Boards. Ist dessen Quelle geloescht, ist die Ursache EINE; „Bindung
    // ohne Datenquelle" waere hier eine falsche Faehrte.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'weg', weitereQuellen: [], spalten: [{ titel: 'Tiername', feld: '78_30' }],
          tagField: '', suche: 'nein',
        },
      },
    }
    const namen = preflightMask(tree, [], []).map((r) => r.name)
    expect(namen).toEqual(['Datenquelle fehlt'])
  })
})
