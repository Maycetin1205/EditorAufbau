// bindungsStand.test
// Source + sorting field form the board connection shown in its own dialog.
// Visible structure/card bindings stay on the canvas. Write path and catch
// selection keep their existing contextual Inspector controls.

import { describe, expect, it } from 'vitest'
import { KanbanBlock } from '../../blocks/kanban/KanbanBlock'
import { KanbanSpalteBlock } from '../../blocks/kanban/KanbanSpalteBlock'
import { getBlockDefinition } from './blockRegistry'
import type { BindingRoute } from './BlockDefinition'
import { bindungsStand } from './bindungsStand'

const route: BindingRoute = {
  fieldProp: 'statusField',
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

  it('unbekannte Quelle bleibt sichtbar unvollstaendig', () => {
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

  it('bekannte Quelle ohne Einsortieren-Feld ist nicht angeschlossen', () => {
    const stand = bindungsStand(
      node({ source: 'terminplaner', statusField: '' }),
      route,
      sources,
    )
    expect(stand.quelleBekannt).toBe(true)
    expect(stand.feldGewaehlt).toBe(false)
    expect(stand.angeschlossen).toBe(false)
  })

  it('Quelle + Einsortieren-Feld sind angeschlossen', () => {
    expect(
      bindungsStand(
        node({ source: 'terminplaner', statusField: '253_30' }),
        route,
        sources,
      ),
    ).toEqual({
      quelleGewaehlt: true,
      quelleBekannt: true,
      feldGewaehlt: true,
      angeschlossen: true,
    })
  })

  it('Nicht-String-Props zaehlen als leer', () => {
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

describe('Registry: genau ein Bedienweg je Einstellung', () => {
  it('das Board deklariert nur sein Einsortieren-Feld fuer den Dialog', () => {
    const board = getBlockDefinition(KanbanBlock.blockType)
    expect(board?.bindingRoute).toEqual(route)
    expect(board?.defaultProps).toHaveProperty(route.fieldProp)
  })

  it('nur das Dialog-Feld ist versteckt; Schreibweg und Auffang bleiben bedienbar', () => {
    const board = getBlockDefinition(KanbanBlock.blockType)
    const feld = board?.customProperties.find(
      (property) => property.attributeName === route.fieldProp,
    )
    const schreiben = board?.customProperties.find(
      (property) => property.attributeName === 'putRelation',
    )
    const spalte = getBlockDefinition(KanbanSpalteBlock.blockType)
    const auffang = spalte?.customProperties.find(
      (property) => property.attributeName === 'auffang',
    )

    expect(feld?.hiddenInInspector).toBe(true)
    expect(schreiben?.hiddenInInspector).not.toBe(true)
    expect(auffang?.hiddenInInspector).not.toBe(true)
    expect(auffang?.exclusiveAmongSiblings).toBe(true)
  })
})