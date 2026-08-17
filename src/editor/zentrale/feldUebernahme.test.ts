import { describe, expect, it } from 'vitest'
import { defaultRelationParams, type ActionParamBinding } from '../../core/data/aktionen'
import type { DataSource } from '../../core/data/dataSources'
import { parseRelationSyntax, type RelationTemplate } from '../../core/data/relations'
import {
  feldUebernahmeArt,
  feldUebernehmen,
  uebernahmeIdbQuellen,
  uebernahmeQuellen,
} from './feldUebernahme'

const relation: RelationTemplate = {
  id: 'standard-put',
  name: 'Standard-Schreiben',
  verb: 'PUT_RELATION',
  nr: '174',
  params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
}

const source: DataSource = {
  id: 'termine',
  name: 'Terminplaner',
  kind: 'idb',
  idbId: 'IDBID0001',
  fields: [
    { code: '10_8', label: 'Adressnummer' },
    { code: '253_30', label: 'Zimmer' },
    { code: 'name', label: 'Name' },
    { code: '30_', label: 'Ungültiger Code' },
  ],
}

describe('Feld uebernehmen V2', () => {
  it('erkennt beide Schreibweisen der drei Zielparameter', () => {
    expect(feldUebernahmeArt('POS')).toBe('pos')
    expect(feldUebernahmeArt('{feld_pos}')).toBe('pos')
    expect(feldUebernahmeArt('len')).toBe('len')
    expect(feldUebernahmeArt('{FELD_LEN}')).toBe('len')
    expect(feldUebernahmeArt('IDBID')).toBe('relid')
    expect(feldUebernahmeArt('{relid}')).toBe('relid')
    expect(feldUebernahmeArt('VART')).toBeNull()
    expect(feldUebernahmeArt('PINDEX')).toBeNull()
    expect(feldUebernahmeArt('QUELLDATEN')).toBeNull()
    expect(feldUebernahmeArt('x{POS}')).toBeNull()
    expect(feldUebernahmeArt(' POS ')).toBeNull()
  })

  it('setzt POS und LEN aus der echten Nutzer-Syntax, aber nicht IDBID', () => {
    const parsed = parseRelationSyntax(
      'PUT_RELATION[174!POS!LEN!VART!PINDEX!IDBID!QUELLDATEN]',
    )
    if (!parsed) throw new Error('Die echte Nutzer-Syntax muss parsebar sein.')
    const echteRelation: RelationTemplate = {
      id: 'echte-put',
      name: 'Echte PUT-Syntax',
      ...parsed,
    }
    const params = defaultRelationParams(echteRelation)

    const result = feldUebernehmen(params, echteRelation, source, '253_30', 'feld')

    expect(result.params).toEqual([
      { source: 'fixed', value: '253' },
      { source: 'fixed', value: '30' },
      { source: 'fixed', value: '' },
      { source: 'fixed', value: '' },
      { source: 'fixed', value: '' },
      { source: 'fixed', value: '' },
    ])
    expect(result.gesetzt).toEqual([
      { art: 'pos', wert: '253' },
      { art: 'len', wert: '30' },
    ])
  })

  it('setzt die Tabelle separat und bewahrt alle anderen Bindungen', () => {
    const params = defaultRelationParams(relation)
    const pinIndex: ActionParamBinding = { source: 'step_result', value: 'get-index' }
    const value: ActionParamBinding = {
      source: 'data_field', value: '253_30', dataSourceId: source.id,
    }
    params[3] = pinIndex
    params[5] = value

    const feldResult = feldUebernehmen(params, relation, source, '253_30', 'feld')
    expect(feldResult.params).toEqual([
      { source: 'fixed', value: '253' },
      { source: 'fixed', value: '30' },
      { source: 'fixed', value: '' },
      pinIndex,
      { source: 'fixed', value: '' },
      value,
    ])
    expect(feldResult.gesetzt).toEqual([
      { art: 'pos', wert: '253' },
      { art: 'len', wert: '30' },
    ])

    const idbResult = feldUebernehmen(params, relation, source, '', 'idb')
    expect(idbResult.params).toEqual([
      { source: 'fixed', value: '' },
      { source: 'fixed', value: '' },
      { source: 'fixed', value: '' },
      pinIndex,
      { source: 'fixed', value: 'ID0001' },
      value,
    ])
    expect(idbResult.gesetzt).toEqual([{ art: 'relid', wert: 'ID0001' }])
    expect(idbResult.params).not.toBe(params)
  })

  it('liefert unveraenderte Bindungen bei einem ungueltigen Feldcode', () => {
    const params = defaultRelationParams(relation)

    expect(feldUebernehmen(params, relation, source, 'Zimmer', 'feld')).toEqual({
      params,
      gesetzt: [],
    })
  })

  it('listet nur IDB-Felder mit gueltigem pos_len-Code und IDB-Quellen', () => {
    const stamm: DataSource = {
      id: 'adr',
      name: 'Adressen',
      kind: 'adressstamm',
      fields: [{ code: '2_8', label: 'Adressnummer' }],
    }

    expect(uebernahmeQuellen([source, stamm])).toEqual([
      { sourceId: 'termine', sourceName: 'Terminplaner', code: '10_8', label: 'Adressnummer' },
      { sourceId: 'termine', sourceName: 'Terminplaner', code: '253_30', label: 'Zimmer' },
    ])
    expect(uebernahmeIdbQuellen([source, stamm])).toEqual([
      { sourceId: 'termine', sourceName: 'Terminplaner' },
    ])
  })
})
