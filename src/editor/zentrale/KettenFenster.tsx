import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { ActionStep } from '../../core/data/aktionen'
import { bausteinName } from '../../core/blocks/bausteinName'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SchrittListe } from './SchrittListe'
import { StepForm } from './StepForm'

interface KettenFensterProps {
  block: BlockNode
  eventKey: string
  eventName: string
  onClose: () => void
}

export function KettenFenster({ block, eventKey, eventName, onClose }: KettenFensterProps) {
  const ed = useEditor()
  const quellen = useDataSources()

  const [offeneId, setOffeneId] = useState<string | null>(null)

  const [neu, setNeu] = useState(false)

  const kette = ed.tree[block.id]?.events?.[eventKey] ?? []
  const offen = offeneId === null ? undefined : kette.find((s) => s.id === offeneId)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const setzeKette = (steps: ActionStep[]): void => {
    const node = ed.tree[block.id]
    if (!node) return
    ed.updateBlockEvents(block.id, { ...(node.events ?? {}), [eventKey]: steps })
  }

  const speichere = (step: ActionStep): void => {
    setzeKette(offen ? kette.map((s) => (s.id === step.id ? step : s)) : [...kette, step])
    setNeu(false)
    setOffeneId(step.id)
  }

  const zeigeFormular = neu || offen !== undefined

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 p-6"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Aktionskette ${eventName}`}
        className="flex h-full max-h-[47.5rem] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h2 className="min-w-0 truncate text-sm font-semibold">
            {bausteinName(block, quellen.list)}
            <span className="ml-2 font-normal text-muted-foreground">
              {eventName} · {kette.length} {kette.length === 1 ? 'Schritt' : 'Schritte'}
            </span>
          </h2>
          <IconButton aria-label="Schließen" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex w-[22rem] shrink-0 flex-col border-r border-border">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Schritte
              </span>
              <IconButton
                aria-label="Schritt hinzufügen"
                title="Schritt hinzufügen"
                onClick={() => {
                  setOffeneId(null)
                  setNeu(true)
                }}
              >
                <Plus size={14} />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1">
              <SchrittListe
                steps={kette}
                aktivId={offeneId ?? undefined}
                onWaehle={(s) => {
                  setNeu(false)
                  setOffeneId(s.id)
                }}
                onAendern={setzeKette}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl">
            {zeigeFormular ? (
              <StepForm

                key={offen?.id ?? 'neu'}
                step={offen}
                kette={kette}
                onClose={() => {
                  setNeu(false)
                  setOffeneId(null)
                }}
                onSave={speichere}
              />
            ) : (

              <p className="text-xs text-muted-foreground">
                {kette.length === 0
                  ? 'Noch kein Schritt.'
                  : 'Schritt links auswählen.'}
              </p>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
