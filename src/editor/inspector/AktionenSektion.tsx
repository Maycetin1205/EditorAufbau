import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { useEditor } from '../../state/useEditor'
import { KettenFenster } from '../zentrale/KettenFenster'

export function AktionenSektion({
  block,
  events,
}: {
  block: BlockNode
  events: readonly BlockEventSpec[]
}) {
  const ed = useEditor()

  const [offenesEreignis, setOffenesEreignis] = useState<BlockEventSpec | null>(null)

  const kette = (eventKey: string) => ed.tree[block.id]?.events?.[eventKey] ?? []

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev) => {
        const steps = kette(ev.key)
        return (
          <div key={ev.key} className="flex min-h-7 items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate text-[0.6875rem] font-semibold text-foreground">
              {ev.name}
              {steps.length > 0 && (
                <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">
                  {steps.length}
                </span>
              )}
            </span>

            <Button variant="outline" size="sm" onClick={() => setOffenesEreignis(ev)}>
              {steps.length === 0 ? 'Schritt anlegen' : 'Kette bearbeiten'}
            </Button>
          </div>
        )
      })}
      {offenesEreignis && (
        <KettenFenster
          block={block}
          eventKey={offenesEreignis.key}
          eventName={offenesEreignis.name}
          onClose={() => setOffenesEreignis(null)}
        />
      )}
    </div>
  )
}
