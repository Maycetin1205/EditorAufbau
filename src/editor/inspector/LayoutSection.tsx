// LayoutSection
// Flow-Eigenschaften des selektierten Blocks im Inspector (Kap. 2.4):
//   - Breite (jeder Block):  Automatisch / Füllen / Fest (px)
//   - FREIE Bereiche zusätzlich: Richtung, Abstand der Kinder, Innenabstand.
//     Container mit festem Design (Kanban-Board/-Spalte, erkennbar an der
//     festen childDirection) bieten diese Regler NICHT an — ihr Layout ist
//     Teil des abgenommenen Zielbilds.
// Schreibt über editor.updateProperty — derselbe Weg wie alle Änderungen.
// Die Werte sind Bedeutungen (klein/mittel/groß), nie rohe Pixelzahlen —
// außer bei "Fest", wo die Zahl der Sinn ist (auch per Anfasser ziehbar).

import type { BlockNode } from '../../core/blocks/BlockData'
import { parseFlowWidth } from '../../core/blocks/flowLayout'
import { useEditor } from '../../state/useEditor'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import { SelectControl } from './controls/SelectControl'

interface LayoutSectionProps {
  block: BlockNode
  // true = freier Container (Bereich): Richtung/Abstand/Innenabstand anbieten.
  showFlowControls: boolean
}

export function LayoutSection({ block, showFlowControls }: LayoutSectionProps) {
  const ed = useEditor()
  const set = (attr: string, value: unknown) => ed.updateProperty(block.id, attr, value)

  const width = parseFlowWidth(block.props.width)
  const widthMode = typeof width === 'number' ? 'fest' : width

  return (
    <div className="flex flex-col gap-3">
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
      {typeof width === 'number' && (
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

      {showFlowControls && (
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
