import { cn } from '@/lib/utils'
import { WaehlerKnopf, type WaehlerEintrag } from '@/ui/molecules/waehler'
import type { BlockNode } from '../../core/blocks/BlockData'
import { auswahlQuelleIdVon, istAuswahlGeber } from '../../core/blocks/treeQuery'
import {
  AUSWAHL_FOLGE_PROP,
  auswahlFolgenAus,
  folgeBrauchbar,
  type AuswahlFolge,
} from '../../core/data/auswahlFolge'
import { quellenKennung } from '../../core/data/dataSources'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { bausteinName } from '../../core/blocks/bausteinName'
import { SchluesselPaarZeilen } from './SchluesselPaarZeilen'

interface AuswahlFolgeSektionProps {
  block: BlockNode

  mitTrenner: boolean
}

export function AuswahlFolgeSektion({ block, mitTrenner }: AuswahlFolgeSektionProps) {
  const ed = useEditor()
  const bibliothek = useDataSources().list

  const folge: AuswahlFolge | undefined = auswahlFolgenAus(block.props[AUSWAHL_FOLGE_PROP])[0]

  const kandidaten = Object.values(ed.tree).filter(
    (n) => n.id !== block.id && istAuswahlGeber(n),
  )

  if (kandidaten.length === 0 && !folge) return null

  const quelleVon = (n: BlockNode | undefined) =>
    bibliothek.find((s) => s.id === auswahlQuelleIdVon(n))
  const eigeneQuelle = quelleVon(block)
  const geberNode = folge ? ed.tree[folge.geberId] : undefined
  const geberQuelle = quelleVon(geberNode)

  const eintrag = (n: BlockNode): WaehlerEintrag => {
    const q = quelleVon(n)
    return q
      ? { wert: n.id, name: `${bausteinName(n, bibliothek)} (${q.name})`, kennung: quellenKennung(q) }
      : { wert: n.id, name: bausteinName(n, bibliothek) }
  }

  function setze(neu: AuswahlFolge[]): void {
    ed.updateProperty(block.id, AUSWAHL_FOLGE_PROP, neu)
  }
  function setzeGeber(v: string): void {
    if (v === '') {
      setze([])
      return
    }
    setze([{
      geberId: v,
      keyPairs: folge && folge.keyPairs.length > 0
        ? folge.keyPairs
        : [{ fromField: '', toField: '' }],
    }])
  }
  return (
    <div className={cn('flex flex-col gap-2', mitTrenner && 'mt-4 border-t border-border pt-4')}>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Auswahl folgen
      </span>
      {/* Ein geloeschter Geber braucht keine Kunst-Option: der Waehler zeigt
          einen Wert, den er nicht kennt, von sich aus rot. */}
      <WaehlerKnopf
        label="Folgt der Auswahl von"
        bezeichnung="Folgt der Auswahl von"
        gruppen={[{ key: 'geber', eintraege: kandidaten.map(eintrag) }]}
        wert={folge?.geberId ?? ''}
        leerText="— keinem —"
        onWaehle={setzeGeber}
      />
      {folge && (
        <>
          <SchluesselPaarZeilen
            frage="Woran erkennt man die zusammengehörigen Zeilen?"
            paare={folge.keyPairs}
            linkeFelder={geberQuelle?.fields ?? []}
            rechteFelder={eigeneQuelle?.fields ?? []}
            linkeBezeichnung={(at) => `Feld ${at + 1} beim Auswahl-Geber`}
            rechteBezeichnung={(at) => `Feld ${at + 1} in diesem Baustein`}
            entfernenBezeichnung={(at) => `Feldpaar ${at + 1} entfernen`}
            onAendern={(keyPairs) => setze([{ ...folge, keyPairs }])}
          />

          {(!geberQuelle || !eigeneQuelle) && (
            <p className="text-xs text-muted-foreground">
              Beide Bausteine brauchen zuerst eine Datenquelle — sonst gibt es
              keine Felder, an denen man die Zeilen erkennen könnte.
            </p>
          )}
          {geberQuelle && eigeneQuelle && !folgeBrauchbar(folge) && (
            <p className="text-xs text-muted-foreground">
              Noch nicht wirksam: es fehlt ein Feldpaar, bei dem <em>beide</em>{' '}
              Seiten gefüllt sind.
            </p>
          )}
        </>
      )}
    </div>
  )
}
