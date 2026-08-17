import { describe, expect, it } from 'vitest'

import '../blocks/kanban/KanbanBlock'

import '../blocks/kanban/KanbanZimmerBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

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
    const gesetzt = exportMask(board({ leerText: 'Niemand wartet gerade.' })).html
    expect(boardTag(gesetzt)).toMatch(/\sleerText="Niemand wartet gerade\."/i)
    expect(exportMask(board({ leerText: 'Heute für niemanden.' })).html)
      .toMatch(/\sleerText="Heute f&#xFC;r niemanden\."/i)
    expect(failedChecks(validateMaskHtml(gesetzt))).toEqual([])

    expect(boardTag(exportMask(board({ leerText: 'Keine Datensätze.' })).html))
      .not.toMatch(/leerText=/i)

    expect(/<ff-kanban-spalte[^>]*/i.exec(gesetzt)?.[0] ?? '').not.toMatch(/leer/i)
  })

  it('N4: Zimmertitel und „Unterteilen nach" reisen mit, der Zimmer-Leersatz nicht', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b'] },
      b: {
        id: 'b', type: 'kanban', parentId: 'root', childIds: ['sp'],
        props: { width: 'fill', height: 'fill', statusField: '20_10' },
      },
      sp: {
        id: 'sp', type: 'kanban-spalte', parentId: 'b', childIds: ['zi'],
        props: { heading: 'In Arbeit', zimmerField: '60_10' },
      },
      zi: {
        id: 'zi', type: 'kanban-zimmer', parentId: 'sp', childIds: [],
        props: { heading: 'Zimmer Süd' },
      },
    }
    const { html } = exportMask(tree)
    expect(/<ff-kanban-spalte[^>]*/i.exec(html)?.[0] ?? '').toMatch(/\szimmerField="60_10"/i)
    const zimmerTag = /<ff-kanban-zimmer[^>]*/i.exec(html)?.[0] ?? ''

    expect(zimmerTag).toMatch(/\sheading="Zimmer S&#xFC;d"/i)

    expect(zimmerTag).not.toMatch(/leer/i)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('N4: eine nicht unterteilte Spalte traegt kein zimmerField', () => {
    const { html } = exportMask(board({}))
    expect(/<ff-kanban-spalte[^>]*/i.exec(html)?.[0] ?? '').not.toMatch(/zimmerField/i)
  })
})
