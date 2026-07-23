// Export-Tests (Kap. 3 Mini-Export)
// Prüfen die Export-Grundsätze maschinell: Determinismus (gleicher Baum →
// identische Datei), SE-Regeln (Marker/ASCII/LF via Validator), Breite als
// Flex-Item-Style aus derselben flowLayout-Quelle, und dass das eingebettete
// Runtime-Bündel nach dem ASCII-Escaping noch gültiges JavaScript ist.
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Import: registriert den echten Popup-Baustein (Seiten-Test P-A).
import '../blocks/popup/PopupBlock'
// Side-Effect-Import: registriert die statischen Atome (Fahrplan 3).
import '../blocks/text/TextBlock'
import '../blocks/trenner/TrennerBlock'
import '../blocks/formfeld/FormFeldBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks, validateMaskHtml } from './validator'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import {
  registerTestBlocks,
  TEST_BLOCK,
  TEST_BOX,
  TEST_DATA_BOX,
  TEST_EVENT_BLOCK,
} from '../test/testBlocks'

registerTestBlocks()

function demoTree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'c1'] },
    t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Übersicht — Empfang', width: 'auto' }, parentId: 'root', childIds: [] },
    c1: { id: 'c1', type: TEST_BOX, props: { direction: 'row', width: 'fill' }, parentId: 'root', childIds: ['t2'] },
    t2: { id: 't2', type: TEST_BLOCK, props: { text: 'Spalte', width: 240 }, parentId: 'c1', childIds: [] },
  }
}

describe('exportMask', () => {
  it('ist deterministisch: gleicher Baum → identische Dateien', () => {
    const a = exportMask(demoTree())
    const b = exportMask(demoTree())
    expect(a.html).toBe(b.html)
    expect(a.sevariablen).toBe(b.sevariablen)
  })

  it('besteht die eingebaute SE-Prüfung', () => {
    const { html } = exportMask(demoTree())
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('laedt das offizielle SoftEngine-Interface vor der eigenen Runtime', () => {
    const { html } = exportMask(demoTree())
    const interfaceTag = '<script src="<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js"></script>'
    expect(html).toContain(interfaceTag)
    expect(html.indexOf(interfaceTag)).toBeLessThan(html.indexOf('<script>'))
  })

  it('serialisiert den Baum als verschachtelte Custom Elements', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('<ff-t-box direction="row"')
    expect(html).toMatch(/<ff-t-box[^>]*>\n\s+<ff-t-block/) // Kind IM Container
    expect(html).toContain('text="Spalte"')
  })

  it('Breite wirkt als Flex-Item-Style (dieselbe flowLayout-Quelle)', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('style="width:240px;flex-shrink:0"') // width fest
    expect(html).toContain('align-self:stretch')                 // fill in Spalte
  })

  it('exportiert eine Vollbildhülle und fill als verbleibende Höhe', () => {
    const tree = demoTree()
    tree.c1.props.height = 'fill'
    const { html } = exportMask(tree)
    expect(html).toContain('html, body { width: 100%; height: 100%;')
    expect(html).toContain('.ff-root { box-sizing: border-box; width: 100%; height: 100%; overflow: auto;')
    expect(html).toContain('flex-grow:1;flex-basis:0;min-height:0')
  })

  it('hält die ASCII-Regel: Umlaute werden zu Entities', () => {
    const { html } = exportMask(demoTree())
    expect(html).not.toMatch(/[Ü—]/)
    expect(html).toContain('&#xDC;bersicht') // Ü
  })

  it('SEvariablen-JSON ist das leere, gültige Gerüst', () => {
    const { sevariablen } = exportMask(demoTree())
    expect(JSON.parse(sevariablen)).toEqual({ SEFILELOOP: [], ERPAPICALL: [] })
  })

  it('nimmt Relationsvorlagen aus Aktionsschritten in FF_RELATIONS auf', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: {
        id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        events: {
          onClick: [{
            id: 's1', type: 'RELATION', resultKey: '', relationId: 'rel-a',
            params: [{ source: 'context', value: 'VALUE' }],
            extraParams: [],
          }],
        },
      },
    }
    const relations = [{
      id: 'rel-a', name: 'Schreiben', verb: 'PUT_RELATION', nr: '0174',
      params: ['{VALUE}'], allowExtraParams: false,
    }] as const
    const { html } = exportMask(tree, 'Maske', [], relations)
    expect(html).toContain('window.FF_RELATIONS = [{"id":"rel-a"')
    expect(html).toContain('&quot;type&quot;:&quot;RELATION&quot;')
    expect(preflightMask(tree, [], relations)).toEqual([])
  })

  it('verknuepft einen Relationsparameter mit dem aktuellen Wert eines Formularfelds', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['button', 'feld-tiername'] },
      button: {
        id: 'button', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        events: {
          onClick: [{
            id: 'put', type: 'RELATION', resultKey: '', relationId: 'rel-put',
            params: [{ source: 'block_value', blockId: 'feld-tiername', value: 'value' }],
            extraParams: [],
          }],
        },
      },
      'feld-tiername': {
        id: 'feld-tiername', type: 'formfeld', parentId: 'root', childIds: [],
        props: {
          fieldType: 'text', placeholder: 'Tiername', options: '',
          source: '', value: '', valueField: '', width: 240,
        },
      },
    }
    const relations = [{
      id: 'rel-put', name: 'Tiername schreiben', verb: 'PUT_RELATION', nr: '0174',
      params: ['QUELLDATEN'], allowExtraParams: false,
    }] as const
    const { html } = exportMask(tree, 'Maske', [], relations)
    expect(html).toContain('<ff-formfeld')
    expect(html).toContain('data-ff-block-id="feld-tiername"')
    expect(html).toContain('&quot;source&quot;:&quot;block_value&quot;')
    expect(html).toContain('&quot;blockId&quot;:&quot;feld-tiername&quot;')
    expect(preflightMask(tree, [], relations)).toEqual([])

    const ohneFeld: BlockTree = {
      root: { ...tree.root, childIds: ['button'] },
      button: tree.button,
    }
    expect(preflightMask(ohneFeld, [], relations).some((result) =>
      result.detail.includes('geloeschten Baustein'))).toBe(true)
  })

  it('exportiert Kanban und Formularfeld mit eigenen Quellen gemeinsam', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board', 'field'] },
      board: {
        id: 'board', type: TEST_DATA_BOX, props: { source: 'termine' },
        parentId: 'root', childIds: [],
      },
      field: {
        id: 'field', type: TEST_DATA_BOX, props: { source: 'adressen' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [
      {
        id: 'termine', name: 'Termine', kind: 'idb' as const,
        idbId: 'IDBID0001', indexField: '0_10', fields: [],
      },
      {
        id: 'adressen', name: 'Adressen', kind: 'adressstamm' as const,
        fields: [{ code: '2_8', label: 'Adressnummer' }],
      },
    ]

    const { html, sevariablen } = exportMask(tree, 'Maske', sources)
    expect(html).toContain('window.FF_DATA_SOURCES = [{"id":"termine"')
    expect(html).toContain('{"id":"adressen","name":"Adressen","tableId":"ADR"')
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Termine', ID: 'IDBID0001', FELDER: '*' },
      { INDEX_NR: 0, ALIAS: 'Adressen', ID: 'ADR', FELDER: '2_8' },
    ])
  })

  it('exportiert eine Popup-Seite GESCHLOSSEN im selben HTML, Inhalt reist mit (P-A)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'p1'] },
      t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Hauptseite' }, parentId: 'root', childIds: [] },
      p1: {
        id: 'p1', type: 'popup',
        props: { name: 'Neue Behandlung', breite: 400, hoehe: 300 },
        parentId: 'root', childIds: ['t2'],
      },
      t2: { id: 't2', type: TEST_BLOCK, props: { text: 'Im Popup' }, parentId: 'p1', childIds: [] },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-popup[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('name="Neue Behandlung"')
    expect(tag).toContain('breite="400"')
    expect(tag).toContain('hoehe="300"')
    // Geschlossen bis eine Kette öffnet (P-B): NIE mit offen-Attribut exportieren.
    expect(tag).not.toContain('offen')
    expect(html).toMatch(/<ff-popup[^>]*>\n\s+<ff-t-block[^>]*text="Im Popup"/)
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
})

describe('validateMaskHtml (Verteidigung)', () => {
  it('meldet fehlende Marker, CRLF und Nicht-ASCII', () => {
    const { html } = exportMask(demoTree())
    const kaputt = html.replace('<!--SOFTENGINE-VAR!JWHtmlStart-->', 'x')
    expect(failedChecks(validateMaskHtml(kaputt)).length).toBeGreaterThan(0)

    const crlf = html.replace(/\n/, '\r\n')
    expect(failedChecks(validateMaskHtml(crlf)).map((f) => f.name)).toContain('LF-only')

    const umlaut = html.replace('</body>', 'ä</body>')
    expect(failedChecks(validateMaskHtml(umlaut)).map((f) => f.name)).toContain('ASCII-only')
  })

  it('blockiert einen Export ohne SoftEngine-Interface', () => {
    const { html } = exportMask(demoTree())
    const ohneInterface = html.replace(
      '<script src="<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js"></script>\n',
      '',
    )
    expect(failedChecks(validateMaskHtml(ohneInterface)).map((f) => f.name))
      .toContain('SoftEngine-Interface vorhanden')
  })

  it('blockiert einen Export mit leerem Runtime-Buendel', () => {
    const { html } = exportMask(demoTree())
    const start = html.indexOf('(function(){')
    const end = html.lastIndexOf('\n</script>')
    expect(start).toBeGreaterThan(0)
    expect(end).toBeGreaterThan(start)
    const ohneRuntime = html.slice(0, start) + html.slice(end)
    expect(failedChecks(validateMaskHtml(ohneRuntime)).map((f) => f.name))
      .toContain('Runtime-Buendel eingebettet')
  })
})

describe('Runtime-Bündel', () => {
  it('ist nach dem ASCII-Escaping weiterhin gültiges JavaScript', () => {
    const { html } = exportMask(demoTree())
    const script = /<script>\n([\s\S]*?)\n<\/script>/.exec(html)
    expect(script).not.toBeNull()
    // Kompilieren (nicht ausführen) — wirft bei Syntaxfehlern.
    expect(() => new Function(script![1])).not.toThrow()
  })

  it('ist nicht veraltet: Bündel enthält die aktuellen Block-Tags', () => {
    for (const tag of ['ff-button', 'ff-card', 'ff-datum', 'ff-formfeld', 'ff-kanban', 'ff-kanban-spalte', 'ff-text', 'ff-trenner', 'ff-zeile']) {
      expect(runtimeJsRaw, `npm run build:runtime ausführen — ${tag} fehlt`).toContain(tag)
    }
    // Kahlschlag 2026-07-14 (Nutzer-Entscheidung): Bereich, Infobox,
    // Status-Chip und Eingabefeld sind KOMPLETT entfernt — ein Bündel, das
    // sie noch trägt, ist veraltet. (Der alte ff-text fiel damals mit; als
    // statisches Atom ist ff-text am 2026-07-21 NEU gebaut worden — er steht
    // deshalb jetzt oben in der Positivliste, nicht mehr hier.)
    for (const tag of ['ff-container', 'ff-infobox', 'ff-badge', 'ff-formfield']) {
      expect(runtimeJsRaw, `npm run build:runtime ausführen — ${tag} ist abgeschafft`).not.toContain(tag)
    }
    // P1.1: der Vorlagen-Kasten ist abgeschafft — ein Bündel, das ihn noch
    // trägt, ist veraltet.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — ff-kanban-vorlage ist abgeschafft').not.toContain('ff-kanban-vorlage')
    // B2 (V2/K6): Zeilen ohne Treffer verschwinden NIE still — ein Bündel
    // ohne Auffang-Kennzeichen + "Nicht zugeordnet"-Laufzeitspalte hätte
    // wieder die abgeschaffte stille "erste Spalte"-Regel.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — Auffang-Kennzeichen (B2) fehlt').toContain('auffang')
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — "Nicht zugeordnet" (B2) fehlt').toContain('data-ff-nicht-zugeordnet')
    // Der eigene Datenanschluss bleibt Registry-getrieben.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — bindingRoute fehlt').toContain('bindingRoute')
    // Karten bleiben auch mit leeren Bindungen gleich hoch; die Diagnose
    // muss schon ohne empfangenes Datenpaket im Export vorhanden sein.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — feste Kartenhöhe fehlt')
      .toContain('height: 112px')
    for (const marker of ['body.REGMSG', 'Empfangene Pakete', 'nach 10s kein Interface']) {
      expect(runtimeJsRaw, `npm run build:runtime ausführen — Diagnose ${marker} fehlt`)
        .toContain(marker)
    }
  })
})

describe('Atome (statische Bausteine, Fahrplan 3)', () => {
  it('Text: Stil (Größe/Gewicht/Ausrichtung) + Inhalt reisen als Attribute; Sonderzeichen werden escaped', () => {
    // Freier Stil statt Größen-Stufen (Nutzer 2026-07-21): Pixelzahl,
    // Gewicht und Ausrichtung reisen als Technikwert-Attribute, der Inhalt
    // wird escaped.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'text',
        props: {
          groesse: 17, gewicht: 'fett', ausrichtung: 'mitte',
          text: 'A & B < C > "D" ä', width: 'fill',
        },
        parentId: 'root', childIds: [],
      },
    }
    const { html } = exportMask(tree)
    expect(html).toContain('<ff-text ')
    expect(html).toContain('groesse="17"')
    expect(html).toContain('gewicht="fett"')
    expect(html).toContain('ausrichtung="mitte"')
    // & -> &amp;, < -> &lt;, > -> &gt;, " -> &quot;, ä -> &#xE4; (serializer).
    expect(html).toContain('text="A &amp; B &lt; C &gt; &quot;D&quot; &#xE4;"')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Trennlinie exportiert als leeres Element ohne Eigenschaften', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tr'] },
      tr: { id: 'tr', type: 'trenner', props: { width: 'fill' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toMatch(/<ff-trenner[^>]*><\/ff-trenner>/)
  })
})
