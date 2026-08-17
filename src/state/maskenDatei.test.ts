import { describe, expect, it } from 'vitest'
import '../blocks/tabelle/TabelleBlock'
import { registerTestBlocks, TEST_BLOCK, TEST_EVENT_BLOCK } from '../test/testBlocks'
import { Editor } from './Editor'
import { CURRENT_SCHEMA_VERSION } from './migrations'
import { MASKEN_DATEI_ART, packeMaske, packeMaskeAus, type MaskenInhalt } from './maskenDatei'

registerTestBlocks()

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

describe('packeMaske / packeMaskeAus (Hin und zurueck)', () => {
  it('Packen -> Auspacken ergibt denselben Baum und dieselben zwei Bibliotheken', () => {
    const e = packeMaskeAus(packeMaske(beispiel()))
    expect(e.ok).toBe(true)
    if (!e.ok) return
    expect(e.inhalt.tree.a?.props.text).toBe('Hallo Ümlaut')
    expect(e.inhalt.datenquellen.map((q) => q.id)).toEqual(['q1'])
    expect(e.inhalt.datenquellen[0].fields).toHaveLength(2)
    expect(e.inhalt.relationen.map((r) => r.nr)).toEqual(['0174'])
  })

  it('ein Baustein mit MEHREREN Datenquellen ueberlebt Speichern und Laden', () => {
    const inhalt = beispiel()
    inhalt.tree.a = {
      id: 'a', type: 'tabelle', parentId: 'root', childIds: [],
      props: {
        source: 'q1',
        weitereQuellen: [{ quelleId: 'q2', keyPairs: [{ fromField: '10_8', toField: '10_8' }] }],
        spalten: [{ titel: 'Notiz', feld: 'q2::128_350' }],
        tagField: '', suche: 'nein',
      },
    }
    const e = packeMaskeAus(packeMaske(inhalt))
    expect(e.ok).toBe(true)
    if (!e.ok) return
    expect(e.inhalt.tree.a?.props.weitereQuellen)
      .toEqual([{ quelleId: 'q2', keyPairs: [{ fromField: '10_8', toField: '10_8' }] }])
    expect(e.inhalt.tree.a?.props.spalten).toEqual([{ titel: 'Notiz', feld: 'q2::128_350' }])
  })

  it('zweimal packen ohne Aenderung ergibt denselben Text (vergleichbare Sicherungen)', () => {
    expect(packeMaske(beispiel())).toBe(packeMaske(beispiel()))
  })

  it('eine Maske mit abgeschaltetem Parameter laedt, statt als beschaedigt zu gelten', () => {
    const inhalt = beispiel()
    const kette = [{
      id: 'r1', type: 'RELATION' as const, resultKey: '', relationId: 'r1',
      params: [
        { source: 'fixed' as const, value: 'vorne' },
        { source: 'aus' as const, value: '' },
        { source: 'context' as const, value: 'PINDEX' },
      ],
      extraParams: [],
    }]
    inhalt.tree.a = {
      id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
      events: { onClick: kette },
    }
    const e = packeMaskeAus(packeMaske(inhalt))
    expect(e.ok).toBe(true)
    if (!e.ok) return
    expect(e.inhalt.tree.a?.events).toEqual({ onClick: kette })
  })
})

describe('packeMaskeAus wehrt ab (nie ein Wurf, immer ein Grund)', () => {
  const abgelehnt = (text: string): string => {
    const e = packeMaskeAus(text)
    expect(e.ok).toBe(false)
    return e.ok ? '' : e.grund
  }

  it('kaputtes JSON', () => {
    expect(abgelehnt('{{{kein json')).toContain('JSON')
  })

  it('leerer Text', () => {
    expect(abgelehnt('')).toBeTruthy()
  })

  it('die exportierte SEvariablen-Datei ist KEINE Maskendatei', () => {
    const grund = abgelehnt(JSON.stringify({ SEFILELOOP: [], ERPAPICALL: [] }))
    expect(grund).toContain('keine Maskendatei')
  })

  it('fehlende Erkennungsmarke', () => {
    expect(abgelehnt(JSON.stringify({ dateiVersion: 1, tree: {} }))).toContain('keine Maskendatei')
  })

  it('fehlende Formatangabe', () => {
    const grund = abgelehnt(JSON.stringify({ art: MASKEN_DATEI_ART, tree: {} }))
    expect(grund).toContain('Formatangabe')
  })
})

describe('packeMaskeAus lehnt Dateien aus der ZUKUNFT ab', () => {
  it('neuere Dateiversion', () => {
    const roh = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    roh.dateiVersion = 99
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.grund).toContain('neueren Version')
  })

  it('neuerer Schemastand', () => {
    const roh = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    roh.schemaVersion = CURRENT_SCHEMA_VERSION + 1
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.grund).toContain('neueren Version')
  })

  it('ein abgelehnter Kandidat nennt die Stelle, nicht nur „geht nicht"', () => {
    const roh = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    roh.schemaVersion = CURRENT_SCHEMA_VERSION + 1
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(false)
    if (!e.ok) {
      expect(e.probleme).toHaveLength(1)
      expect(e.probleme[0].grund).toContain(`Aufbau-Version ${CURRENT_SCHEMA_VERSION + 1}`)
    }
  })
})

describe('Dateiversion 1 laedt weiterhin (Bestandsdateien auf der Platte)', () => {
  it('eine Version-1-Datei MIT verknuepfungen-Abschnitt laedt sauber', () => {
    const roh = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    roh.dateiVersion = 1
    roh.verknuepfungen = [
      { id: 'v1', fromSourceId: 'q1', toSourceId: 'q2', keyPairs: [{ fromField: '10_8', toField: '10_8' }] },
    ]
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(true)
    if (!e.ok) return

    expect(e.inhalt.tree.a?.props.text).toBe('Hallo Ümlaut')
    expect(e.inhalt.datenquellen.map((q) => q.id)).toEqual(['q1'])
    expect(e.inhalt.relationen.map((r) => r.id)).toEqual(['r1'])
  })

  it('auch ein KAPUTTER verknuepfungen-Abschnitt haelt eine Version-1-Datei nicht auf', () => {
    const roh = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    roh.dateiVersion = 1
    roh.verknuepfungen = 'kaputt'
    expect(packeMaskeAus(JSON.stringify(roh)).ok).toBe(true)
  })
})

describe('packeMaskeAus migriert alte Staende (dieselbe Kette wie der Browser-Speicher)', () => {
  it('ein alter Schemastand laeuft durch die Migrationen', () => {
    const roh = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    roh.schemaVersion = 1
    const e = packeMaskeAus(JSON.stringify(roh))
    expect(e.ok).toBe(true)

    if (e.ok) expect(e.inhalt.tree.a).toBeDefined()
  })
})

describe('packeMaskeAus verlangt den vollstaendigen Rahmen (Critical, Codereview)', () => {
  const rahmen = (aenderung: (o: Record<string, unknown>) => void): string => {
    const o = JSON.parse(packeMaske(beispiel())) as Record<string, unknown>
    aenderung(o)
    return JSON.stringify(o)
  }

  it('fehlender Baum -> abgelehnt (wuerde sonst alles leeren)', () => {
    const e = packeMaskeAus(rahmen((o) => { delete o.tree }))
    expect(e.ok).toBe(false)
  })

  it('Baum OHNE Wurzel -> abgelehnt', () => {
    const e = packeMaskeAus(rahmen((o) => { o.tree = {} }))
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.grund).toContain('Masken-Aufbau')
  })

  it('LEERE Maske (Wurzel ohne Kinder) ist erlaubt — das ist kein Schaden', () => {
    const e = packeMaskeAus(rahmen((o) => {
      o.tree = { root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: [] } }
    }))
    expect(e.ok).toBe(true)
  })

  it('fehlende Versionsangabe des Aufbaus -> abgelehnt', () => {
    const e = packeMaskeAus(rahmen((o) => { delete o.schemaVersion }))
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.grund).toContain('Versionsangabe')
  })

  it('fehlender Bibliotheks-Abschnitt -> abgelehnt (nicht stillschweigend leer)', () => {
    const e = packeMaskeAus(rahmen((o) => { delete o.datenquellen }))
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.grund).toContain('Datenquellen')
  })
})

describe('Laden leert die Historie (kein halber Rueckweg)', () => {
  it('nach ersetzeMaske sind Undo UND Redo leer', () => {
    const ed = new Editor()
    const a = ed.addBlock(TEST_BLOCK, ed.rootId)
    ed.addBlock(TEST_BLOCK, ed.rootId)
    ed.removeBlock(a!.id)
    ed.undo()
    expect(ed.canUndo).toBe(true)
    expect(ed.canRedo).toBe(true)

    const e = packeMaskeAus(packeMaske(beispiel()))
    expect(e.ok).toBe(true)
    if (!e.ok) return
    ed.ersetzeMaske(e.inhalt.tree)

    expect(ed.canUndo).toBe(false)
    expect(ed.canRedo).toBe(false)
    expect(ed.selectedId).toBeNull()
    expect(ed.activePageId).toBe(ed.rootId)
    expect(ed.getNode('a')?.props.text).toBe('Hallo Ümlaut')
  })
})
