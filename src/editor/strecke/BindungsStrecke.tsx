// Datenanschluss-Dialog
// Ein eigener Dialog fuer die Datenquelle und das Einsortierfeld des Boards.
// Struktur und sichtbare Feldbindungen werden ausschliesslich direkt
// an den echten Bausteinen im Canvas bearbeitet.

import type { ReactNode } from 'react'
import { Button } from '@/ui/atoms/button'
import { Modal } from '@/ui/molecules/modal'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { bindungsStand } from '../../core/blocks/bindungsStand'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'

function Chip({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={aktiv}
      onClick={onClick}
      className={
        aktiv
          ? 'rounded border border-ring bg-accent px-2 py-1 text-xs font-medium text-accent-foreground'
          : 'rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted'
      }
    >
      {children}
    </button>
  )
}

function Schritt({
  nr,
  titel,
  fertig,
  children,
}: {
  nr: number
  titel: string
  fertig: boolean
  children: ReactNode
}) {
  return (
    <section role="group" aria-label={titel} className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold">
        <span
          aria-hidden="true"
          className={
            fertig
              ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground'
              : 'flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground'
          }
        >
          {fertig ? '\u2713' : nr}
        </span>
        {titel}
      </h3>
      {children}
    </section>
  )
}

interface BindungsStreckeProps {
  blockId: string
  onClose: () => void
}

export function BindungsStrecke({ blockId, onClose }: BindungsStreckeProps) {
  const ed = useEditor()
  const sources = useDataSources().list
  const node = ed.getNode(blockId)
  const def = node ? getBlockDefinition(node.type) : undefined
  const route = def?.bindingRoute
  if (!node || !def || !route) return null

  const stand = bindungsStand(node, route, sources)
  const sourceId = typeof node.props.source === 'string' ? node.props.source : ''
  const quelle = sources.find((source) => source.id === sourceId)
  const feldWert = node.props[route.fieldProp]
  const feld = typeof feldWert === 'string' ? feldWert : ''
  const feldProp = def.customProperties.find(
    (property) => property.attributeName === route.fieldProp,
  )
  const setQuelle = (id: string) => {
    if (id !== sourceId) ed.updateProperty(blockId, 'source', id)
  }
  const setFeld = (code: string) => {
    if (code !== feld) ed.updateProperty(blockId, route.fieldProp, code)
  }
  return (
    <Modal title={'Daten anschlie\u00DFen'} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <Schritt
          nr={1}
          titel="Datenquelle"
          fertig={stand.quelleGewaehlt && stand.quelleBekannt}
        >
          <div className="flex flex-wrap gap-1.5">
            <Chip aktiv={sourceId === ''} onClick={() => setQuelle('')}>
              &mdash; keine &mdash;
            </Chip>
            {sources.map((source) => (
              <Chip
                key={source.id}
                aktiv={source.id === sourceId}
                onClick={() => setQuelle(source.id)}
              >
                {source.name}
              </Chip>
            ))}
          </div>
          {stand.quelleGewaehlt && !stand.quelleBekannt && (
            <p className="text-xs text-destructive">
              Die gew&auml;hlte Datenquelle fehlt in der Bibliothek.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Vorlagen anlegen und bearbeiten: Steuerung &rarr; Datenquellen.
          </p>
        </Schritt>

        <Schritt
          nr={2}
          titel={feldProp?.name ?? 'Einsortieren nach'}
          fertig={stand.angeschlossen}
        >
          {!quelle ? (
            <p className="text-xs text-muted-foreground">
              Zuerst eine Datenquelle w&auml;hlen.
            </p>
          ) : (
            <>
              <p className="text-[11px] text-muted-foreground">
                {feldProp?.description ?? ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Chip aktiv={feld === ''} onClick={() => setFeld('')}>
                  &mdash; keins &mdash;
                </Chip>
                {quelle.fields.map((field) => (
                  <Chip
                    key={field.code}
                    aktiv={field.code === feld}
                    onClick={() => setFeld(field.code)}
                  >
                    {field.label}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </Schritt>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fertig</Button>
        </div>
      </div>
    </Modal>
  )
}
