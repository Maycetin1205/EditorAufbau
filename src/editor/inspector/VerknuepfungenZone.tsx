import { useState } from 'react'
import { Plus, Trash2 } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { WaehlerKnopf } from '@/ui/molecules/waehler'
import type { BlockNode } from '../../core/blocks/BlockData'
import { QUELLE_PROP } from '../../core/blocks/treeQuery'
import { quellenKennung } from '../../core/data/dataSources'
import {
  vollstaendigePaare,
  WEITERE_QUELLEN_PROP,
  weitereQuellenAus,
  type BausteinQuelle,
} from '../../core/data/sourceLinks'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SchluesselPaarZeilen } from './SchluesselPaarZeilen'

// Die Verknuepfungen des Bausteins als benannte Zeilen: jede sagt in Klartext,
// WELCHE Quelle an WELCHEM Feldpaar haengt. Die alte Darstellung im Inspector
// zaehlte sie nur durch („Datenquelle 2", „Datenquelle 3") — man musste die
// Nummern im Kopf behalten, um die Erfassung zu verstehen.
export function VerknuepfungenZone({ block }: { block: BlockNode }) {
  const ed = useEditor()
  const bibliothek = useDataSources().list

  const [offen, setOffen] = useState<number | null>(null)

  const erste = typeof block.props[QUELLE_PROP] === 'string'
    ? (block.props[QUELLE_PROP] as string)
    : ''
  const weitere = weitereQuellenAus(block.props[WEITERE_QUELLEN_PROP])

  const quelleVon = (id: string) => bibliothek.find((s) => s.id === id)
  const felderVon = (id: string) => quelleVon(id)?.fields ?? []
  const nameVon = (id: string) => quelleVon(id)?.name ?? id
  const feldName = (quelleId: string, code: string) =>
    felderVon(quelleId).find((f) => f.code === code)?.label ?? code

  function setzeWeitere(next: BausteinQuelle[]): void {
    ed.updateProperty(block.id, WEITERE_QUELLEN_PROP, next)
  }

  function aendere(index: number, teil: Partial<BausteinQuelle>): void {
    setzeWeitere(weitere.map((q, i) => (i === index ? { ...q, ...teil } : q)))
  }

  function entferne(index: number): void {
    setzeWeitere(weitere.filter((_, i) => i !== index))
    setOffen(null)
  }

  // „<Quelle> — <Feld> = <Feld>". Fehlt etwas, sagt die Zeile genau das.
  function klartext(q: BausteinQuelle): string {
    if (q.quelleId === '') return 'Noch keine Datenquelle gewählt'
    const paare = vollstaendigePaare(q)
    if (paare.length === 0) return `${nameVon(q.quelleId)} — noch kein Feldpaar`
    const teile = paare.map(
      (p) => `${feldName(erste, p.fromField)} = ${feldName(q.quelleId, p.toField)}`,
    )
    return `${nameVon(q.quelleId)} — ${teile.join(' · ')}`
  }

  // Schon verknuepfte Quellen tauchen nicht zweimal auf.
  function optionen(eigene: string) {
    const belegt = new Set([erste, ...weitere.map((q) => q.quelleId)])
    belegt.delete(eigene)
    return bibliothek.filter((s) => !belegt.has(s.id))
  }

  return (
    <div className="flex flex-col gap-2">
      {weitere.length === 0 && (
        <p className="text-xs text-muted-foreground">Noch keine Verknüpfung.</p>
      )}

      {weitere.map((q, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOffen(offen === i ? null : i)}
              className="min-w-0 flex-1 truncate rounded-sm px-1 py-0.5 text-left text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {klartext(q)}
            </button>
            <IconButton
              aria-label={`Verknüpfung „${klartext(q)}“ löschen`}
              onClick={() => entferne(i)}
            >
              <Trash2 size={13} />
            </IconButton>
          </div>

          {offen === i && (
            <div className="flex flex-col gap-2 border-t border-border pt-2">
              <WaehlerKnopf
                label="Verknüpfte Datenquelle"
                bezeichnung="Verknüpfte Datenquelle"
                gruppen={[{
                  key: 'quellen',
                  eintraege: optionen(q.quelleId).map((s) => ({
                    wert: s.id,
                    name: s.name,
                    kennung: quellenKennung(s),
                  })),
                }]}
                wert={q.quelleId}
                leerText="— keine —"
                onWaehle={(v) => aendere(i, { quelleId: v })}
              />
              <SchluesselPaarZeilen
                frage="Woran erkennt man die zusammengehörige Zeile?"
                paare={q.keyPairs}
                linkeFelder={felderVon(erste)}
                rechteFelder={felderVon(q.quelleId)}
                linkeBezeichnung={(at) => `Feld ${at + 1} in „${nameVon(erste)}“`}
                rechteBezeichnung={(at) => `Feld ${at + 1} in „${nameVon(q.quelleId)}“`}
                entfernenBezeichnung={(at) => `Feldpaar ${at + 1} entfernen`}
                onAendern={(keyPairs) => aendere(i, { keyPairs })}
              />
            </div>
          )}
        </div>
      ))}

      {erste !== '' && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setzeWeitere([...weitere, { quelleId: '', keyPairs: [{ fromField: '', toField: '' }] }])
            setOffen(weitere.length)
          }}
        >
          <Plus size={13} /> Verknüpfung
        </Button>
      )}
    </div>
  )
}
