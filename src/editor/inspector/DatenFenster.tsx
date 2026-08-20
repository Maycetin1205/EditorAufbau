import { useState, type ReactNode } from 'react'
import { EditorFenster } from '@/ui/molecules/editor-fenster'
import { WaehlerKnopf } from '@/ui/molecules/waehler'
import { Button } from '@/ui/atoms/button'
import type { BlockNode } from '../../core/blocks/BlockData'
import { bausteinName } from '../../core/blocks/bausteinName'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { darfAuswahlFolgen, QUELLE_PROP } from '../../core/blocks/treeQuery'
import { quellenKennung } from '../../core/data/dataSources'
import { lesendeKetten } from '../../core/data/kettenLeser'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { KettenFenster } from '../zentrale/KettenFenster'
import { AuswahlFolgeSektion } from './AuswahlFolgeSektion'
import { PropControl } from './PropControl'
import { VerknuepfungenZone } from './VerknuepfungenZone'

function Zone({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {name}
      </span>
      {children}
    </section>
  )
}

// Alles, was mit den DATEN eines Bausteins zu tun hat, in einem Fenster statt
// im Inspector: woher die Zeilen kommen (ZEIGT), welche weiteren Quellen an
// ihnen haengen (VERKNUEPFUNGEN) und wer sie wegschreibt (SCHREIBT UEBER).
// Die letzte Zone stellt bewusst NICHTS ein — sie zeigt nur, welche Kette
// liest, und springt dorthin; eingestellt wird eine Kette an genau einer
// Stelle, im Aktionen-Fenster ihres Bausteins.
export function DatenFenster({ block, onClose }: { block: BlockNode; onClose: () => void }) {
  const ed = useEditor()
  const bibliothek = useDataSources().list

  const [sprung, setSprung] = useState<{ blockId: string; eventKey: string } | null>(null)

  const quelleId = typeof block.props[QUELLE_PROP] === 'string'
    ? (block.props[QUELLE_PROP] as string)
    : ''
  const fehlt = quelleId !== '' && !bibliothek.some((s) => s.id === quelleId)

  const leser = lesendeKetten(ed.tree, block.id)

  // Die Erfassen-Zone zeigt GENAU die Eigenschaft, an der die Registry das
  // Erfassen festmacht (`kannErfassen.wenn`) — kein Bausteintyp im Code
  // (Regel 2). Heute hat nur die Tabelle diese Faehigkeit, also gibt es die
  // Zone auch nur dort. Bis 2026-08-20 stand der Schalter in der allgemeinen
  // Eigenschaftsliste, waehrend die Inspector-Zeile „Erfassen" auf dieses
  // Fenster zeigte — der Schalter war also nie da, wo er angekuendigt wurde.
  const erfassenAttribut = getBlockDefinition(block.type)?.kannErfassen?.wenn?.attributeName
  const erfassenEigenschaft = erfassenAttribut === undefined
    ? undefined
    : getBlockDefinition(block.type)?.customProperties
      .find((p) => p.attributeName === erfassenAttribut)

  const sprungBlock = sprung ? ed.tree[sprung.blockId] : undefined
  const sprungEvent = sprungBlock && sprung
    ? getBlockDefinition(sprungBlock.type)?.blockEvents?.find((e) => e.key === sprung.eventKey)
    : undefined

  return (
    <>
      <EditorFenster
        bezeichnung={`Daten von ${bausteinName(block, bibliothek)}`}
        titel={(
          <>
            {bausteinName(block, bibliothek)}
            <span className="ml-2 font-normal text-muted-foreground">Daten</span>
          </>
        )}
        onClose={onClose}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Zone name="Zeigt">
            <WaehlerKnopf
              label="Datenquelle"
              bezeichnung="Datenquelle"
              gruppen={[{
                key: 'quellen',
                eintraege: bibliothek.map((s) => ({
                  wert: s.id,
                  name: s.name,
                  kennung: quellenKennung(s),
                })),
              }]}
              wert={quelleId}
              leerText="— keine —"
              fehler={fehlt
                ? 'Diese Datenquelle fehlt in der Bibliothek. Neu wählen — oder unter Datencenter → Datenquellen wieder anlegen.'
                : undefined}
              onWaehle={(v) => ed.updateProperty(block.id, QUELLE_PROP, v)}
            />
            {darfAuswahlFolgen(block) && <AuswahlFolgeSektion block={block} mitTrenner={false} />}
          </Zone>

          <Zone name="Verknüpfungen">
            <VerknuepfungenZone block={block} />
          </Zone>

          {erfassenEigenschaft && (
            <Zone name="Erfassen">
              <PropControl
                block={block}
                property={erfassenEigenschaft}
                sourceInReach={ed.dataSourceFor(block.id)}
                sitzung={{
                  onBeginBearbeitung: () => ed.beginTransaction(),
                  onEndeBearbeitung: () => ed.endTransaction(),
                }}
              />
            </Zone>
          )}

          <Zone name="Schreibt über">
            {leser.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Keine Aktionskette liest aus diesem Baustein.
              </p>
            )}
            {leser.map((k) => {
              const node = ed.tree[k.blockId]
              const ev = node
                ? getBlockDefinition(node.type)?.blockEvents?.find((e) => e.key === k.eventKey)
                : undefined
              if (!node) return null
              const name = `${bausteinName(node, bibliothek)} · ${ev?.name ?? k.eventKey}`
              return (
                <div key={`${k.blockId}::${k.eventKey}`} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                    {name}
                    <span className="ml-2 tabular-nums text-muted-foreground">
                      {k.stellen} {k.stellen === 1 ? 'Stelle' : 'Stellen'}
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSprung({ blockId: k.blockId, eventKey: k.eventKey })}
                  >
                    Kette öffnen
                  </Button>
                </div>
              )
            })}
          </Zone>
        </div>
      </EditorFenster>

      {sprungBlock && sprung && (
        <KettenFenster
          block={sprungBlock}
          eventKey={sprung.eventKey}
          eventName={sprungEvent?.name ?? sprung.eventKey}
          onClose={() => setSprung(null)}
        />
      )}
    </>
  )
}
