// bindungsStand.test (V2/B3)
// Die EINE pure Vollstaendigkeitspruefung der Board-Bindung: ihre Aussagen
// speisen die Strecken-Haken + den Kurzzustand (B3) und spaeter den
// Board-Hinweis (B5) + die Export-Preflight (B6). Dazu: das Kanban muss
// seine Bindungsstrecke in der Registry deklarieren (bindingRoute) und die
// abgeloesten Bruecken-Controls (B1-Wertefeld, B2-Auffang, Einsortieren-
// Select) duerfen NIE wieder als eigene Inspector-Controls auftauchen —
// gepflegt wird NUR in der Strecke.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Import registriert als Side-Effect kanban + kanban-spalte (+ card).
import { KanbanBlock } from '../../blocks/kanban/KanbanBlock'
import { KanbanSpalteBlock } from '../../blocks/kanban/KanbanSpalteBlock'
import { getBlockDefinition } from './blockRegistry'
import type { BindingRoute } from './BlockDefinition'
import { bindungsStand } from './bindungsStand'

const route: BindingRoute = {
  fieldProp: 'statusField',
  column: {
    type: 'kanban-spalte',
    titleProp: 'heading',
    valuesProp: 'statusValues',
    catchProp: 'auffang',
  },
}

const sources = [{ id: 'terminplaner' }, { id: 'geraete' }]

const node = (props: Record<string, unknown>) => ({ props })

describe('bindungsStand (pure)', () => {
  it('ohne Quelle ist nichts erledigt', () => {
    expect(bindungsStand(node({ source: '', statusField: '' }), route, sources)).toEqual({
      quelleGewaehlt: false,
      quelleBekannt: false,
      feldGewaehlt: false,
      angeschlossen: false,
    })
  })

  it('geloeschte/unbekannte Quelle: gewaehlt, aber nicht bekannt — nicht angeschlossen', () => {
    const stand = bindungsStand(
      node({ source: 'geloescht', statusField: '253_30' }),
      route,
      sources,
    )
    expect(stand.quelleGewaehlt).toBe(true)
    expect(stand.quelleBekannt).toBe(false)
    expect(stand.feldGewaehlt).toBe(true)
    expect(stand.angeschlossen).toBe(false)
  })

  it('Quelle bekannt, Einsortieren-Feld fehlt: nicht angeschlossen', () => {
    const stand = bindungsStand(node({ source: 'terminplaner', statusField: '' }), route, sources)
    expect(stand.quelleBekannt).toBe(true)
    expect(stand.feldGewaehlt).toBe(false)
    expect(stand.angeschlossen).toBe(false)
  })

  it('Quelle + Feld gesetzt: angeschlossen', () => {
    const stand = bindungsStand(
      node({ source: 'terminplaner', statusField: '253_30' }),
      route,
      sources,
    )
    expect(stand).toEqual({
      quelleGewaehlt: true,
      quelleBekannt: true,
      feldGewaehlt: true,
      angeschlossen: true,
    })
  })

  it('Nicht-String-Props zaehlen als leer (kaputter/manipulierter Speicher)', () => {
    const stand = bindungsStand(
      node({ source: 42, statusField: ['x'] }),
      route,
      sources,
    )
    expect(stand.quelleGewaehlt).toBe(false)
    expect(stand.feldGewaehlt).toBe(false)
    expect(stand.angeschlossen).toBe(false)
  })
})

describe('Registry: Kanban deklariert die Bindungsstrecke (B3)', () => {
  it('bindingRoute des Boards beschreibt genau die echten Props', () => {
    const def = getBlockDefinition(KanbanBlock.blockType)
    expect(def?.bindingRoute).toEqual(route)
    // Die Route zeigt auf existierende Props (Tippfehler-Schutz).
    expect(def?.defaultProps).toHaveProperty(route.fieldProp)
    const spalte = getBlockDefinition(KanbanSpalteBlock.blockType)
    expect(spalte?.defaultProps).toHaveProperty(route.column.titleProp)
    expect(spalte?.defaultProps).toHaveProperty(route.column.valuesProp)
    expect(spalte?.defaultProps).toHaveProperty(route.column.catchProp)
  })

  it('die abgeloesten Bruecken-Controls sind hiddenInInspector — Pflege NUR in der Strecke', () => {
    const board = getBlockDefinition(KanbanBlock.blockType)
    const feldProp = board?.customProperties.find((p) => p.attributeName === route.fieldProp)
    expect(feldProp?.hiddenInInspector).toBe(true)
    const spalte = getBlockDefinition(KanbanSpalteBlock.blockType)
    const werteProp = spalte?.customProperties.find(
      (p) => p.attributeName === route.column.valuesProp,
    )
    const auffangProp = spalte?.customProperties.find(
      (p) => p.attributeName === route.column.catchProp,
    )
    expect(werteProp?.hiddenInInspector).toBe(true)
    expect(auffangProp?.hiddenInInspector).toBe(true)
    // Die Exklusivitaet des Auffang-Kennzeichens (B2) bleibt an der
    // versteckten Beschreibung haengen — Store + Preflight lesen sie dort.
    expect(auffangProp?.exclusiveAmongSiblings).toBe(true)
  })
})
