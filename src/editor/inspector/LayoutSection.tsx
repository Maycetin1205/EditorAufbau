// LayoutSection
// Flow-Eigenschaften des selektierten Blocks im Inspector (Kap. 2.4):
//   - Breite (jeder Block):  Automatisch / Füllen / Fest (px)
//   - Bereiche zusätzlich:   Richtung, Abstand der Kinder, Innenabstand
// Schreibt über editor.updateProperty — derselbe Weg wie alle Änderungen.
// Die Werte sind Bedeutungen (klein/mittel/groß), nie rohe Pixelzahlen —
// außer bei "Fest", wo die Zahl der Sinn ist (auch per Anfasser ziehbar).

import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { parseFlowHeight, parseFlowWidth } from '../../core/blocks/flowLayout'
import { useEditor } from '../../state/useEditor'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import { SelectControl } from './controls/SelectControl'

interface LayoutSectionProps {
  block: BlockNode
  isContainer: boolean
}

export function LayoutSection({ block, isContainer }: LayoutSectionProps) {
  const ed = useEditor()
  const set = (attr: string, value: unknown) => ed.updateProperty(block.id, attr, value)

  const width = parseFlowWidth(block.props.width)
  const widthMode = typeof width === 'number' ? 'fest' : width
  const def = getBlockDefinition(block.type)
  // Blöcke mit festgelegter Breite (lockedWidth, K0: Kanban-Spalte) regeln
  // ihre Breite selbst — ein Breite-Feld hätte keine Wirkung und wäre eine
  // Täuschung.
  const locked = def?.lockedWidth !== undefined
  // Höhe (P1.3, opt-in per Registry): nur Blöcke mit resizableHeight —
  // Kanban: feste Höhe lässt die Karten IM Spaltenrumpf scrollen.
  const heightable = def?.resizableHeight === true
  const height = parseFlowHeight(block.props.height)

  return (
    <div className="flex flex-col gap-3">
      {!locked && (
        <SelectControl
          label="Breite"
          value={widthMode}
          options={[
            { value: 'auto', label: 'Automatisch' },
            { value: 'fill', label: 'Füllen' },
            { value: 'fest', label: 'Fest (px)' },
          ]}
          onChange={(v) => set('width', v === 'fest' ? 240 : v)}
        />
      )}
      {!locked && typeof width === 'number' && (
        <Field label="Breite in px">
          {(field) => (
            <TextInput
              id={field.id}
              type="number"
              min={40}
              value={String(width)}
              onChange={(e) => {
                const n = Number(e.currentTarget.value)
                if (Number.isFinite(n) && n >= 40) set('width', Math.round(n))
              }}
            />
          )}
        </Field>
      )}

      {heightable && (
        <SelectControl
          label="Höhe"
          value={typeof height === 'number' ? 'fest' : 'auto'}
          options={[
            { value: 'auto', label: 'Automatisch' },
            { value: 'fest', label: 'Fest (px)' },
          ]}
          onChange={(v) => set('height', v === 'fest' ? 480 : 'auto')}
        />
      )}
      {heightable && typeof height === 'number' && (
        <Field label="Höhe in px">
          {(field) => (
            <TextInput
              id={field.id}
              type="number"
              min={120}
              value={String(height)}
              onChange={(e) => {
                const n = Number(e.currentTarget.value)
                if (Number.isFinite(n) && n >= 120) set('height', Math.round(n))
              }}
            />
          )}
        </Field>
      )}

      {isContainer && (
        <>
          <SelectControl
            label="Richtung"
            value={block.props.direction === 'row' ? 'row' : 'column'}
            options={[
              { value: 'column', label: 'Untereinander' },
              { value: 'row', label: 'Nebeneinander' },
            ]}
            onChange={(v) => set('direction', v)}
          />
          <SelectControl
            label="Abstand"
            value={typeof block.props.gap === 'string' ? (block.props.gap as string) : 'md'}
            options={[
              { value: 'sm', label: 'Klein' },
              { value: 'md', label: 'Mittel' },
              { value: 'lg', label: 'Groß' },
            ]}
            onChange={(v) => set('gap', v)}
          />
          <SelectControl
            label="Innenabstand"
            value={typeof block.props.padding === 'string' ? (block.props.padding as string) : 'none'}
            options={[
              { value: 'none', label: 'Keiner' },
              { value: 'sm', label: 'Klein' },
              { value: 'md', label: 'Mittel' },
              { value: 'lg', label: 'Groß' },
            ]}
            onChange={(v) => set('padding', v)}
          />
        </>
      )}
    </div>
  )
}
