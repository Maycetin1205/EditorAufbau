// flowLayout-Tests (K0): lockedWidth ersetzt fillMinWidth.
// Entscheidung A: festgelegtes 'fill' -> flex-basis 0 + min-width 0 —
// KEINE Mindestbreite, kein Umbruch, kein horizontaler Scroll; die
// width-Prop des Knotens wird bei lockedWidth ignoriert (alte gespeicherte
// Breiten wie 260/290 bleiben wirkungslos, keine Migration noetig).
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import { flowItemHeightStyle, flowItemStyle, parseFlowHeight, parseFlowWidth } from './flowLayout'

describe('parseFlowWidth', () => {
  it('kennt auto/fill/px und faellt sonst auf auto zurueck', () => {
    expect(parseFlowWidth('fill')).toBe('fill')
    expect(parseFlowWidth(240)).toBe(240)
    expect(parseFlowWidth('auto')).toBe('auto')
    expect(parseFlowWidth(-5)).toBe('auto')
    expect(parseFlowWidth('quatsch')).toBe('auto')
    expect(parseFlowWidth(undefined)).toBe('auto')
  })
})

describe('flowItemStyle', () => {
  it('ohne lockedWidth unveraendert: auto/fill/px wie bisher', () => {
    expect(flowItemStyle('auto', 'row')).toEqual({})
    expect(flowItemStyle('auto', 'column')).toEqual({})
    expect(flowItemStyle('fill', 'row')).toEqual({ flexGrow: 1, flexBasis: 0, minWidth: 0 })
    expect(flowItemStyle('fill', 'column')).toEqual({ alignSelf: 'stretch' })
    expect(flowItemStyle(240, 'row')).toEqual({ width: '240px', flexShrink: 0 })
    expect(flowItemStyle(240, 'column')).toEqual({ width: '240px', flexShrink: 0 })
  })

  it("lockedWidth 'fill' (Kanban-Spalte) ignoriert die width-Prop — Entscheidung A", () => {
    expect(flowItemStyle(290, 'row', 'fill')).toEqual({ flexGrow: 1, flexBasis: 0, minWidth: 0 })
    expect(flowItemStyle('auto', 'row', 'fill')).toEqual({ flexGrow: 1, flexBasis: 0, minWidth: 0 })
    expect(flowItemStyle('auto', 'column', 'fill')).toEqual({ alignSelf: 'stretch' })
  })

  it("lockedWidth 'auto' ignoriert die width-Prop", () => {
    expect(flowItemStyle(260, 'row', 'auto')).toEqual({})
    expect(flowItemStyle('fill', 'column', 'auto')).toEqual({})
  })
})

describe('Höhe (P1.3, opt-in per resizableHeight)', () => {
  it('parseFlowHeight kennt nur auto/px und faellt sonst auf auto zurueck', () => {
    expect(parseFlowHeight(480)).toBe(480)
    expect(parseFlowHeight('auto')).toBe('auto')
    expect(parseFlowHeight(-5)).toBe('auto')
    expect(parseFlowHeight('fill')).toBe('auto') // Höhe kennt kein 'fill'
    expect(parseFlowHeight(undefined)).toBe('auto')
  })

  it('flowItemHeightStyle: feste Höhe in px + flex-shrink 0, auto = nichts', () => {
    expect(flowItemHeightStyle(480)).toEqual({ height: '480px', flexShrink: 0 })
    expect(flowItemHeightStyle('auto')).toEqual({})
  })
})
