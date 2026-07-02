// LayoutSection
// Flow-Eigenschaften des selektierten Blocks im Inspector (Kap. 2.4):
//   - Breite (jeder Block):  Automatisch / Füllen / Fest (px)
//   - Bereiche zusätzlich:   Richtung, Abstand der Kinder, Innenabstand
// Schreibt über editor.updateProperty — derselbe Weg wie alle Änderungen.
// Die Werte sind Bedeutungen (klein/mittel/groß), nie rohe Pixelzahlen —
// außer bei "Fest", wo die Zahl der Sinn ist (auch per Anfasser ziehbar).

import type { BlockNode } from '../../core/blocks/BlockData'
import { parseFlowWidth } from '../../core/blocks/flowLayout'
import { useEditor } from '../../state/useEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/atoms/select'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'

interface Option {
  value: string
  label: string
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      {(field) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={field.id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  )
}

interface LayoutSectionProps {
  block: BlockNode
  isContainer: boolean
}

export function LayoutSection({ block, isContainer }: LayoutSectionProps) {
  const ed = useEditor()
  const set = (attr: string, value: unknown) => ed.updateProperty(block.id, attr, value)

  const width = parseFlowWidth(block.props.width)
  const widthMode = typeof width === 'number' ? 'fest' : width

  return (
    <div className="flex flex-col gap-3">
      <SelectField
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

      {isContainer && (
        <>
          <SelectField
            label="Richtung"
            value={block.props.direction === 'row' ? 'row' : 'column'}
            options={[
              { value: 'column', label: 'Untereinander' },
              { value: 'row', label: 'Nebeneinander' },
            ]}
            onChange={(v) => set('direction', v)}
          />
          <SelectField
            label="Abstand"
            value={typeof block.props.gap === 'string' ? (block.props.gap as string) : 'md'}
            options={[
              { value: 'sm', label: 'Klein' },
              { value: 'md', label: 'Mittel' },
              { value: 'lg', label: 'Groß' },
            ]}
            onChange={(v) => set('gap', v)}
          />
          <SelectField
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
