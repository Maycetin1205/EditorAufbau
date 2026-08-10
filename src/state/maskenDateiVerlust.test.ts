// Maskendatei — Tests zur VERLUST-Kontrolle (2026-07-28, hierher 2026-08-10).
//
// Die harte Zusage dieser Seite: still verlorene Teile gibt es nicht. Verwirft
// ein Sanitizer etwas, gilt die ganze Datei als beschaedigt und wird NICHT
// geladen — sonst laedt eine ausgeduennte Maske, sieht heil aus, und die
// Bindungen zeigen ins Leere.
//
// Aus maskenDatei.test.ts herausgeloest, als die Datei am 500-Zeilen-Deckel
// stand (check:regeln) und A3/A4 weitere Faelle brauchten. Der Schnitt liegt
// am Thema: drueben der RAHMEN der Datei (Hin und zurueck, Erkennungsmarke,
// Version, Historie), hier der VERLUST. Die Faelle sind unveraendert
// uebernommen — reine Verschiebung.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/card/CardBlock'
// Karten leben laut Registry NUR in einer Kanban-Spalte (allowedParentTypes),
// und seit A4 prueft der Lade-Weg diesen Vertrag: die Karten-Faelle unten
// bauen ihre Karte darum an den erlaubten Platz statt direkt unter die Wurzel.
import '../blocks/kanban/KanbanBlock'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'
import { packeMaske, packeMaskeAus, type MaskenInhalt } from './maskenDatei'

registerTestBlocks()

// Dieselbe Beispielmaske wie in maskenDatei.test.ts. Bewusst je Datei eigen:
// jeder Fall prueft gegen SEINE Vorlage, ein Auseinanderdriften kann daher
// keinen Test falsch gruen machen.
function beispiel(): MaskenInhalt {
  return {
    tree: {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: { id: 'a', type: TEST_BLOCK, props: { text: 'Hallo Ümlaut' }, parentId: 'root', childIds: [] },
    },
    datenquellen: [
      {
        id: 'q1', name: 'Terminplaner', kind: 'idb', idbId: 'IDBID0001', indexField: '0_10',
        fields: [{ code: '10_8', label: 'Adressnummer' }, { code: '78_10', label: 'TerminDatum' }],
      },
    ],
    relationen: [
      { id: 'r1', name: 'Schreiben', verb: 'PUT_RELATION', nr: '0174', params: ['{PINDEX}', '', '{VALUE}'] },
    ],
  }
}

describe('packeMaskeAus verliert nichts still (Zaehlprobe)', () => {
  it('eine kaputte Datenquelle unter mehreren -> Datei wird ABGELEHNT', () => {
    const inhalt = beispiel()
    const roh = JSON.parse(packeMaske(inhalt)) as Record<string, unknown>
    ;(roh.datenquellen as unknown[]).push({ id: 'kaputt' }) // ohne name/kind
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(false)
    if (!e.ok) {
      expect(e.grund).toContain('Datenquellen')
      // A4: die Ablehnung nennt den EINTRAG und den Grund, nicht nur den
      // Abschnitt. Vorher stand da „im Abschnitt Datenquellen stimmen Angaben
      // nicht" — und der Bediener durfte raten, welcher von zwanzig.
      expect(e.probleme).toEqual([
        { bereich: 'Datenquellen', stelle: 'kaputt', grund: 'der Klarname fehlt' },
      ])
    }
  })

  it('eine Quelle mit einem kaputten FELD -> ebenfalls abgelehnt', () => {
    // Der gefaehrlichste Fall: der Eintrag kommt durch, nur ausgeduennt.
    // Die Maske laedt, sieht heil aus — und Bindungen zeigen ins Leere.
    const roh = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    const quellen = roh.datenquellen as { fields: unknown[] }[]
    quellen[0].fields.push({ code: 42 }) // kein String -> faellt raus
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.grund).toContain('Datenquellen')
  })

  it('eine heile Datei laeuft durch, ohne dass die Zaehlprobe anschlaegt', () => {
    expect(packeMaskeAus(packeMaske(beispiel())).ok).toBe(true)
  })
})

describe('packeMaskeAus faengt auch getarnte Verluste (Critical, Codereview)', () => {
  const verbogen = (aenderung: (o: Record<string, unknown>) => void): boolean => {
    const o = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    aenderung(o)
    return packeMaskeAus(JSON.stringify(o)).ok
  }

  it('Feldliste ist gar keine Liste -> abgelehnt (Zaehlung haette nichts gemerkt)', () => {
    expect(verbogen((o) => {
      (o.datenquellen as Record<string, unknown>[])[0].fields = 'kaputt'
    })).toBe(false)
  })

  it('ein EINZELWERT kippt den Typ -> abgelehnt (idbId als Zahl)', () => {
    expect(verbogen((o) => {
      (o.datenquellen as Record<string, unknown>[])[0].idbId = 42
    })).toBe(false)
  })

  // A4: dieser Fall zeigt, warum das KRITERIUM der Vergleich bleibt und nicht
  // die Meldung des Sanitizers. `idbId: 42` sieht der Sanitizer gar nicht an —
  // er uebernimmt den Eintrag und laesst den Wert weg. Gemeldet hat er also
  // nichts, verloren ist trotzdem etwas. Dann sagt der Fund wenigstens den
  // Bereich, statt zu schweigen.
  it('ein lautloser Verlust nennt wenigstens den Bereich', () => {
    const o = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    ;(o.datenquellen as Record<string, unknown>[])[0].idbId = 42
    const e = packeMaskeAus(JSON.stringify(o))
    expect(e.ok).toBe(false)
    if (!e.ok) {
      expect(e.probleme).toHaveLength(1)
      expect(e.probleme[0].bereich).toBe('Datenquellen')
      expect(e.probleme[0].stelle).toBe('')
    }
  })

  it('ein unbrauchbares Kennzeichen -> abgelehnt (allowExtraParams als Text)', () => {
    expect(verbogen((o) => {
      (o.relationen as Record<string, unknown>[])[0].allowExtraParams = 'vielleicht'
    })).toBe(false)
  })

  it('eine ERGAENZUNG des Sanitizers ist KEIN Verlust — Datei bleibt gueltig', () => {
    // sanitizeRelationTemplates setzt ein fehlendes allowExtraParams auf false.
    // Ein strikter Gleichheitsvergleich haette diese heile Datei abgelehnt.
    expect(verbogen((o) => {
      delete (o.relationen as Record<string, unknown>[])[0].allowExtraParams
    })).toBe(true)
  })
})

describe('packeMaskeAus prueft den BAUM genauso streng (Critical, Codereview Runde 2)', () => {
  const mitBaum = (tree: unknown): ReturnType<typeof packeMaskeAus> => {
    const o = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    o.tree = tree
    return packeMaskeAus(JSON.stringify(o))
  }

  it('root: null -> abgelehnt (kam vorher durch und leerte alles)', () => {
    expect(mitBaum({ root: null }).ok).toBe(false)
  })

  it('Wurzel ohne childIds -> abgelehnt', () => {
    expect(mitBaum({ root: { id: 'root', type: 'root' } }).ok).toBe(false)
  })

  it('ein Kind fehlt im Baum -> abgelehnt statt still weggelassen', () => {
    expect(mitBaum({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'fehlt'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
    }).ok).toBe(false)
  })

  it('eine WAISE (kein Weg von der Wurzel) -> abgelehnt', () => {
    expect(mitBaum({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      waise: { id: 'waise', type: TEST_BLOCK, props: {}, parentId: 'nirgends', childIds: [] },
    }).ok).toBe(false)
  })

  it('ein abgeschaffter BAUSTEINTYP bleibt erlaubt — das ist der gewollte Weg', () => {
    // Dieser Verlust ist gewollt und wird dem Bediener hinterher gemeldet
    // („Beim Laden entfernt: …"). Nur dafuer gibt es die verworfen-Liste.
    const e = mitBaum({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'alt'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      alt: { id: 'alt', type: 'gibt-es-nicht-mehr', props: {}, parentId: 'root', childIds: [] },
    })
    expect(e.ok).toBe(true)
    if (e.ok) expect([...e.verworfen.keys()]).toEqual(['gibt-es-nicht-mehr'])
  })
})

describe('packeMaskeAus faengt auch AUSGEDUENNTE Bausteine (Critical, Runde 3)', () => {
  // Gleich viele Knoten, trotzdem Verlust: normalizeProps wirft unbekannte
  // Eigenschaften weg, sanitizeBlockEvents verwirft eine GANZE Kette, wenn
  // ein Schritt kaputt ist. Beides lautlos.
  const mitKnoten = (aenderung: (a: Record<string, unknown>) => void): boolean => {
    const o = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    const baum = o.tree as Record<string, Record<string, unknown>>
    aenderung(baum.a)
    return packeMaskeAus(JSON.stringify(o)).ok
  }

  it('eine Eigenschaft, die der Baustein nicht kennt -> abgelehnt', () => {
    expect(mitKnoten((a) => {
      (a.props as Record<string, unknown>).gibtEsNicht = 'wichtige Arbeit'
    })).toBe(false)
  })

  it('eine kaputte Aktionskette -> abgelehnt statt still verworfen', () => {
    expect(mitKnoten((a) => { a.events = { onClick: 'kaputt' } })).toBe(false)
  })


  it('derselbe Baustein unter ZWEI Eltern -> abgelehnt (Beziehung ginge lautlos verloren)', () => {
    const o = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    o.tree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b1', 'b2'] },
      b1: { id: 'b1', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: ['kind'] },
      b2: { id: 'b2', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: ['kind'] },
      kind: { id: 'kind', type: TEST_BLOCK, props: {}, parentId: 'b1', childIds: [] },
    }
    expect(packeMaskeAus(JSON.stringify(o)).ok).toBe(false)
  })


  it('die WURZEL verliert eine Beziehung -> abgelehnt', () => {
    const o = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    o.tree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'a'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
    }
    expect(packeMaskeAus(JSON.stringify(o)).ok).toBe(false)
  })

  it('der Baustein unveraendert -> weiterhin gueltig', () => {
    expect(mitKnoten(() => {})).toBe(true)
  })
})

describe('eine EBEN gespeicherte Maske laesst sich immer wieder laden', () => {
  // Codex-Codereview Runde 5: der Altbestands-Putzer fuer Karten-Demotexte
  // lief bedingungslos und haette „Heute" im Chip geleert — eine gerade
  // gespeicherte Datei waere beim Laden abgelehnt worden. Er laeuft jetzt
  // nur noch fuer ALTE Staende.
  it('eine Karte mit dem echten Wert „Heute" ueberlebt Speichern und Laden', () => {
    const inhalt: MaskenInhalt = {
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
        s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['k'] },
        k: { id: 'k', type: 'card', props: { chipText: 'Heute', heading: 'Rückruf' }, parentId: 's1', childIds: [] },
      },
      datenquellen: [], relationen: [],
    }
    const e = packeMaskeAus(packeMaske(inhalt))
    expect(e.ok).toBe(true)
    if (e.ok) expect(e.inhalt.tree.k?.props.chipText).toBe('Heute')
  })

  // A2 (2026-08-10): die andere Seite der Grenze, damit Datei- und Browser-Weg
  // nachweislich GLEICH entscheiden (migrationen.test prueft dieselben zwei
  // Faelle am Browser-Speicher). Eine Datei aus Schema 4 traegt die Werkswerte
  // noch ab Werk — dort ist Putzen richtig.
  //
  // War von A2 bis A2.1 ein it.todo: der Putzer setzte keine Schemastufe, also
  // lief die Detail-Verlustpruefung und sah seine absichtlich geleerten Props
  // als Verlust — die Datei wurde abgelehnt („am Baustein ‚k' stimmen Angaben
  // nicht"). Seit A2.1 meldet der Putzer die Stellen namentlich, und nur die
  // werden geduldet.
  it('in einer Datei aus Schema 4 werden die Werkswerte weiterhin geleert', () => {
    const inhalt: MaskenInhalt = {
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
        s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['k'] },
        k: { id: 'k', type: 'card', props: { chipText: 'Heute', heading: 'Rückruf Fr. Wagner' }, parentId: 's1', childIds: [] },
      },
      datenquellen: [], relationen: [],
    }
    const roh = JSON.parse(packeMaske(inhalt)) as Record<string, unknown>
    roh.schemaVersion = 4
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(true)
    if (!e.ok) return
    expect(e.inhalt.tree.k?.props.chipText).toBe('')
    expect(e.inhalt.tree.k?.props.heading).toBe('')
  })

  // Die Ausnahme aus A2.1 muss ENG sein. Sonst waere der Fix schlimmer als der
  // Fehler: eine Datei mit einem Werkstext irgendwo haette den ganzen Baustein
  // ungeprueft passieren lassen. Hier traegt DERSELBE Baustein einen echten
  // Schaden daneben — eine Eigenschaft, die der Typ nicht kennt und die beim
  // Bereinigen wegfaellt. Die Datei muss trotzdem abgelehnt werden.
  it('duldet nur die geleerten Stellen — echter Schaden am selben Baustein faellt weiter auf', () => {
    const inhalt: MaskenInhalt = {
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
        s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['k'] },
        k: { id: 'k', type: 'card', props: { chipText: 'Heute' }, parentId: 's1', childIds: [] },
      },
      datenquellen: [], relationen: [],
    }
    const roh = JSON.parse(packeMaske(inhalt)) as Record<string, unknown>
    roh.schemaVersion = 4
    const baum = roh.tree as Record<string, { props: Record<string, unknown> }>
    baum.k.props.gibtEsNicht = 'faellt beim Bereinigen weg'
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.grund).toContain('stimmen Angaben nicht')
  })
})
