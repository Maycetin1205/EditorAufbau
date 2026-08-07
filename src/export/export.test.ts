// Export-Tests
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
// Registriert Kanban-Board und -Spalte (Fall „Text wenn leer" unten).
import '../blocks/kanban/KanbanBlock'
// Die Faelle des TABELLEN-Bausteins stehen seit 2026-08-07 in
// tabelleExport.test.ts — diese Datei war ueber den 500-Zeilen-Deckel
// gewachsen (check:regeln), und der Schnitt liegt am Gegenstand.
import type { BlockTree } from '../core/blocks/BlockData'
import type { DataSource } from '../core/data/dataSources'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks, validateMaskHtml } from './validator'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'

registerTestBlocks()

function demoTree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'c1'] },
    // Wurzel-Kinder liegen auf dem Raster (Position/Größe als Zellen).
    t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Übersicht — Empfang', width: 'auto', rasterX: 0, rasterY: 0, rasterW: 12, rasterH: 2 }, parentId: 'root', childIds: [] },
    c1: { id: 'c1', type: TEST_BOX, props: { direction: 'row', width: 'fill', rasterX: 0, rasterY: 2, rasterW: 24, rasterH: 4 }, parentId: 'root', childIds: ['t2'] },
    // t2 liegt IM Container c1 → weiterhin Fluss (flowItemStyle).
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

  it('Standard reist nicht: unangetastete Eigenschaften stehen NICHT im Markup', () => {
    // Der Testblock hat text:'Standard' als Registry-Standard, der Testbereich
    // direction:'column'. Wer sie nie anfasst, soll sie auch nicht im Export
    // tragen — sonst steht in jeder Maske Zeile fuer Zeile, was ohnehin gilt,
    // und ein Export-Diff zeigt nicht mehr, was der Bauer eingestellt hat.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t', 'b'] },
      t: { id: 't', type: TEST_BLOCK, props: { text: 'Standard' }, parentId: 'root', childIds: [] },
      b: { id: 'b', type: TEST_BOX, props: { direction: 'column' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    // Nur die BEIDEN Element-Anfaenge pruefen, nicht das ganze Dokument: im
    // eingebetteten Runtime-Buendel steht `text=` als Minifikat-Zuweisung.
    const tagVon = (name: string): string => new RegExp(`<${name}[^>]*`).exec(html)?.[0] ?? ''
    expect(tagVon('ff-t-block')).not.toContain('text=')
    expect(tagVon('ff-t-box')).not.toContain('direction=')
    // Das Element selbst bleibt natuerlich stehen — nur nackt.
    expect(html).toMatch(/<ff-t-block[^>]*><\/ff-t-block>/)
    // Und Pflicht-/Layout-Attribute sind davon unberuehrt.
    expect(html).toContain('grid-column:')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Nicht-Standard reist: jede abweichende Eigenschaft steht im Markup', () => {
    // Gegenprobe zum Fall darueber — Wert um EIN Zeichen verschieden, und das
    // Attribut muss da sein. Sonst zeigte die Maske etwas anderes als der
    // Editor (WYSIWYG-Bruch, Regel 1).
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t', 'b'] },
      t: { id: 't', type: TEST_BLOCK, props: { text: 'Standard ' }, parentId: 'root', childIds: [] },
      b: { id: 'b', type: TEST_BOX, props: { direction: 'row' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toContain('text="Standard "')
    expect(html).toContain('direction="row"')
  })

  it('serialisiert den Baum als verschachtelte Custom Elements', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('<ff-t-box direction="row"')
    expect(html).toMatch(/<ff-t-box[^>]*>\n\s+<ff-t-block/) // Kind IM Container
    expect(html).toContain('text="Spalte"')
  })

  it('Fluss-Breite in Containern wirkt als Flex-Item-Style; Wurzel-Kinder als Grid-Item', () => {
    const { html } = exportMask(demoTree())
    // Fluss INNERHALB eines Containers (t2 fest 240px in der Zeile c1) — die
    // flowLayout-Quelle gilt dort unverändert.
    expect(html).toContain('style="width:240px;flex-shrink:0"')
    // Raster-Ebene (direkte Wurzel-Kinder): Platz + Größe als grid-column/row
    // aus der rasterLayout-Quelle (dieselbe wie der Canvas).
    expect(html).toContain('grid-column:1 / span 12') // t1 (x0/w12)
    expect(html).toContain('grid-row:3 / span 4')      // c1 (y2/h4)
  })

  it('exportiert eine Vollbildhülle; die Wurzel ist die Rasterfläche (Grid)', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('html, body { width: 100%; height: 100%;')
    expect(html).toContain('.ff-root { box-sizing: border-box; width: 100%; height: 100%; overflow: auto;')
    // Wurzel = CSS-Grid mit fester Spaltenzahl (rasterFlaecheStyle) statt Flex.
    expect(html).toContain('display:grid')
    expect(html).toContain('grid-template-columns:repeat(24, 1fr)')
  })

  it('fill-Höhe wirkt in einer Spalte als flex-grow (Fluss lebt in Containern weiter)', () => {
    // Der Fluss lebt INNERHALB von Containern: ein height:fill-Kind in einer
    // Spalte nimmt die verbleibende Höhe (flowItemHeightStyle, unverändert).
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['box'] },
      box: { id: 'box', type: TEST_BOX, props: { direction: 'column', width: 'fill' }, parentId: 'root', childIds: ['kind'] },
      kind: { id: 'kind', type: TEST_BLOCK, props: { text: 'x', height: 'fill' }, parentId: 'box', childIds: [] },
    }
    const { html } = exportMask(tree)
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
    // Geschlossen bis eine Kette öffnet: NIE mit offen-Attribut exportieren.
    expect(tag).not.toContain('offen')
    expect(html).toMatch(/<ff-popup[^>]*>\n\s+<ff-t-block[^>]*text="Im Popup"/)
  })

})

// Die Verteidigung (Validator: Marker/LF/ASCII/Interface/Buendel) und die
// Zeichen-Regeln des Serializers stehen seit 2026-08-06 in validator.test.ts —
// diese Datei war ueber den 500-Zeilen-Deckel gewachsen (check:regeln).

describe('Runtime-Bündel', () => {
  it('ist nach dem ASCII-Escaping weiterhin gültiges JavaScript', () => {
    const { html } = exportMask(demoTree())
    const script = /<script>\n([\s\S]*?)\n<\/script>/.exec(html)
    expect(script).not.toBeNull()
    // Kompilieren (nicht ausführen) — wirft bei Syntaxfehlern.
    expect(() => new Function(script![1])).not.toThrow()
  })

  it('ist nicht veraltet: Bündel enthält die aktuellen Block-Tags', () => {
    for (const tag of ['ff-button', 'ff-card', 'ff-datum', 'ff-formfeld', 'ff-kanban', 'ff-kanban-spalte', 'ff-popup', 'ff-tabelle', 'ff-text', 'ff-trenner', 'ff-zeile']) {
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
    // Die Auffangspalte bleibt waehlbar — sie ist der EINE Weg, Zeilen ohne
    // Treffer bewusst zu lenken.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — Auffang-Kennzeichen fehlt').toContain('auffang')
    // Umgekehrt zur Vorfassung (Nutzer-Entscheidung 2026-07-27): die
    // Laufzeit erfindet KEINE Spalte "Nicht zugeordnet" mehr. Ohne
    // Auffangspalte landen Zeilen ohne Treffer in der ERSTEN Spalte. Ein
    // Bündel, das das Kennzeichen noch trägt, ist veraltet.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — "Nicht zugeordnet" ist abgeschafft').not.toContain('data-ff-nicht-zugeordnet')
    // Der eigene Datenanschluss-Dialog ist abgeschafft (2026-07-27): alle
    // Bausteine waehlen ihre Quelle im Inspector. Ein Buendel, das die
    // Wegbeschreibung noch traegt, ist veraltet.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — bindingRoute ist abgeschafft').not.toContain('bindingRoute')
    // Hier stand bis 2026-08-06 `height: 112px`, die Mindesthoehe der Karte.
    // Sie ist mit dem Wert selbst gefallen: die Karte ist jetzt die Demo-Karte
    // und waechst mit ihrem Inhalt. Der Marker war ohnehin genau die Sorte,
    // die der Absatz unten verbietet.
    // KEINE Marker auf Baustein-CSS (Nutzer-Entscheidung 2026-08-04). Hier
    // standen zwei wortwörtliche CSS-Suchen (Platzhalter des gebundenen Felds,
    // Zeilenhöhe des leeren Textes). Sie sind wieder weg: ein Leerzeichen
    // anders im CSS färbt sie rot, obwohl die Maske stimmt — und umgekehrt
    // beweist der gefundene Text NICHT, dass es richtig aussieht. Optik prüft
    // allein der SE-Echttest des Nutzers. Neue CSS-Marker deshalb nicht
    // einführen; die Tags-Positivliste oben bleibt (sie prüft Existenz, nicht
    // Aussehen).
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

  it('Text: die Farbe reist als Technikwert-Attribut mit (Token, kein Hex)', () => {
    // Die Farbe ist eine Maskeneinstellung: faellt das Attribut weg, zeigt die
    // exportierte Maske eine andere Farbe als der Editor (WYSIWYG-Bruch).
    // Im Markup steht der TECHNIKWERT — den Token loest der Baustein selbst
    // auf (FARBEN), damit im Export nirgends eine Farbe fest verdrahtet ist.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'text',
        props: { text: 'Notfall', farbe: 'fehler', width: 'fill' },
        parentId: 'root', childIds: [],
      },
    }
    const { html } = exportMask(tree)
    expect(html).toMatch(/<ff-text[^>]*\sfarbe="fehler"/)
    expect(html).not.toMatch(/<ff-text[^>]*#[0-9a-fA-F]{3}/)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Text: Datenbindung (Quelle + Feld) reist als Attribut mit', () => {
    // 2026-08-04: der Text ist bindbar. Ohne diese zwei Attribute zeigte die
    // exportierte Maske stur den getippten Text, waehrend der Editor den
    // Feld-Klarnamen anbietet — WYSIWYG-Bruch (Regel 1).
    const sources: DataSource[] = [{
      id: 'q-termine', name: 'Terminplaner', kind: 'idb', idbId: 'IDBID0004',
      indexField: '0_10', fields: [{ code: '40_20', label: 'Titel' }],
    }]
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'text',
        props: { text: 'Titel', source: 'q-termine', textField: '40_20', width: 'fill' },
        parentId: 'root', childIds: [],
      },
    }
    const { html, sevariablen } = exportMask(tree, 'Maske', sources)
    expect(html).toMatch(/<ff-text[^>]*\ssource="q-termine"/)
    expect(html).toMatch(/<ff-text[^>]*\stextfield="40_20"/)
    // Die Quelle des Textes muss in der SEFILELOOP stehen — sonst schiebt
    // SoftEngine ihre Daten nie, und die Stelle bliebe leer.
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0004', FELDER: '*' },
    ])
    expect(preflightMask(tree, sources, [])).toEqual([])
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  // Die Richtung ist die EINZIGE Eigenschaft der Trennlinie (2026-08-05).
  // Waagerecht ist ihr Standard und reist deshalb NICHT mit (Standardwert-Regel
  // in exportMask) — senkrecht schon. Beide Faelle stehen hier, weil genau
  // dieses Paar den Round-Trip beweist: was der Bauer eingestellt hat, steht im
  // Markup; was er nie angefasst hat, blaeht die Maske nicht auf.
  it('Trennlinie waagerecht (Standard) exportiert als leeres Element ohne Attribute', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tr'] },
      tr: { id: 'tr', type: 'trenner', props: { width: 'fill', richtung: 'waagerecht' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toMatch(/<ff-trenner[^>]*><\/ff-trenner>/)
    // Gegenprobe am ELEMENT, nicht am ganzen Dokument: das eingebettete
    // Runtime-Buendel enthaelt „richtung" ohnehin (Bausteincode, dazu die
    // Text-Ausrichtung) — eine Volltextsuche traefe das mit.
    expect(html).not.toMatch(/<ff-trenner[^>]*richtung=/)
  })

  it('Trennlinie senkrecht traegt richtung="senkrecht" im Markup', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tr'] },
      tr: { id: 'tr', type: 'trenner', props: { width: 'fill', richtung: 'senkrecht' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toMatch(/<ff-trenner[^>]*richtung="senkrecht"/)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })
})

describe('Kanban', () => {
  const board = (props: Record<string, unknown>): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b'] },
    b: {
      id: 'b', type: 'kanban', parentId: 'root', childIds: ['sp'],
      props: { width: 'fill', height: 'fill', ...props },
    },
    sp: {
      id: 'sp', type: 'kanban-spalte', parentId: 'b', childIds: [],
      props: { heading: 'Offen', variant: 'warning' },
    },
  })
  const boardTag = (html: string): string => /<ff-kanban[\s>][^>]*/i.exec(html)?.[0] ?? ''

  it('„Text wenn leer" reist nur mit, wenn er vom Standard abweicht', () => {
    // Der Satz haengt am BOARD und wird zur Laufzeit an die leer ausgegangenen
    // Spalten gereicht (kanban/seRuntime). Faellt das Attribut im Export weg,
    // zeigt SoftEngine einen anderen Satz als der Editor angesagt hat
    // (WYSIWYG-Bruch, Regel 1). Der Umlaut ist die Falle — roher Text
    // zerbraeche an der ASCII-Regel.
    const gesetzt = exportMask(board({ leerText: 'Niemand wartet gerade.' })).html
    expect(boardTag(gesetzt)).toMatch(/\sleerText="Niemand wartet gerade\."/i)
    expect(exportMask(board({ leerText: 'Heute für niemanden.' })).html)
      .toMatch(/\sleerText="Heute f&#xFC;r niemanden\."/i)
    expect(failedChecks(validateMaskHtml(gesetzt))).toEqual([])
    // Der unangetastete Standardsatz bleibt daheim (Standardwert-Regel) —
    // sonst waere jede bestehende Maske im Export anders und der Byte-Waechter
    // (referenzabzug) haette bei diesem Paket angeschlagen.
    expect(boardTag(exportMask(board({ leerText: 'Keine Einträge.' })).html))
      .not.toMatch(/leerText=/i)
    // Die SPALTE traegt ihn nie: der Leerzustand ist ein Laufzeitwert
    // (leerHinweis, attribute:false), kein Bauplan der einzelnen Spalte.
    expect(/<ff-kanban-spalte[^>]*/i.exec(gesetzt)?.[0] ?? '').not.toMatch(/leer/i)
  })
})



