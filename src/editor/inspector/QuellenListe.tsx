import { Plus, X } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { WaehlerKnopf } from '@/ui/molecules/waehler'
import type { BlockNode } from '../../core/blocks/BlockData'
import { quellenKennung } from '../../core/data/dataSources'
import {
  quelleBrauchbar,
  WEITERE_QUELLEN_PROP,
  weitereQuellenAus,
  type BausteinQuelle,
} from '../../core/data/sourceLinks'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SchluesselPaarZeilen } from './SchluesselPaarZeilen'

interface QuellenListeProps {
  block: BlockNode
}

export function QuellenListe({ block }: QuellenListeProps) {
  const ed = useEditor()
  const bibliothek = useDataSources().list

  const erste = typeof block.props.source === 'string' ? block.props.source : ''
  const weitere = weitereQuellenAus(block.props[WEITERE_QUELLEN_PROP])

  const fehlt = (id: string) => id !== '' && !bibliothek.some((s) => s.id === id)
  const felderVon = (id: string) => bibliothek.find((s) => s.id === id)?.fields ?? []

  function setzeWeitere(next: BausteinQuelle[]) {
    ed.updateProperty(block.id, WEITERE_QUELLEN_PROP, next)
  }

  function aendere(index: number, teil: Partial<BausteinQuelle>) {
    setzeWeitere(weitere.map((q, i) => (i === index ? { ...q, ...teil } : q)))
  }

  function optionen(eigene: string) {
    const belegt = new Set([erste, ...weitere.map((q) => q.quelleId)])
    belegt.delete(eigene)
    return bibliothek.filter((s) => !belegt.has(s.id))
  }

  // Eine fehlende Quelle braucht keine Kunst-Option mehr: der Waehler zeigt
  // einen Wert, den er nicht kennt, von sich aus rot.
  const quellenAuswahl = (wert: string, titel: string, onWert: (v: string) => void) => (
    <WaehlerKnopf
      label={titel}
      bezeichnung={titel}
      gruppen={[{
        key: 'quellen',
        eintraege: optionen(wert).map((s) => ({
          wert: s.id,
          name: s.name,
          kennung: quellenKennung(s),
        })),
      }]}
      wert={wert}
      leerText="— keine —"
      onWaehle={onWert}
    />
  )

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Datenquellen
      </span>

      {quellenAuswahl(erste, 'Datenquelle 1', (v) => ed.updateProperty(block.id, 'source', v))}
      {fehlt(erste) && (
        <p className="text-xs text-destructive">
          Die gewählte Datenquelle fehlt in der Bibliothek. Neu wählen — oder
          unter Datencenter → Datenquellen wieder anlegen.
        </p>
      )}

      {weitere.map((q, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              {quellenAuswahl(q.quelleId, `Datenquelle ${i + 2}`, (v) => aendere(i, { quelleId: v }))}
            </div>
            <IconButton
              aria-label={`Datenquelle ${i + 2} entfernen`}
              onClick={() => setzeWeitere(weitere.filter((_, at) => at !== i))}
            >
              <X size={13} />
            </IconButton>
          </div>
          <SchluesselPaarZeilen
            frage="Woran erkennt man die zusammengehörige Zeile?"
            paare={q.keyPairs}
            linkeFelder={felderVon(erste)}
            rechteFelder={felderVon(q.quelleId)}
            linkeBezeichnung={(at) => `Feld ${at + 1} der ersten Datenquelle`}
            rechteBezeichnung={(at) => `Feld ${at + 1} der Datenquelle ${i + 2}`}
            entfernenBezeichnung={(at) => `Zeile ${at + 1} entfernen`}
            onAendern={(keyPairs) => aendere(i, { keyPairs })}
          />

          {!quelleBrauchbar(q) && (
            <p className="text-xs text-muted-foreground">
              Noch nicht benutzbar: es fehlt eine Datenquelle oder ein Feldpaar,
              bei dem <em>beide</em> Seiten gefüllt sind.
            </p>
          )}
        </div>
      ))}

      {erste !== '' && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setzeWeitere([...weitere, { quelleId: '', keyPairs: [{ fromField: '', toField: '' }] }])}
        >
          <Plus size={13} /> Datenquelle
        </Button>
      )}
    </div>
  )
}
