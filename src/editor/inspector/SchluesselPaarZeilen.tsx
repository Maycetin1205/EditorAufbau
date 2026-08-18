import { Plus, X } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { WaehlerKnopf } from '@/ui/molecules/waehler'
import type { DataSourceField } from '../../core/data/dataSources'
import { MAX_SCHLUESSELPAARE, type SchluesselPaar } from '../../core/data/sourceLinks'

interface SchluesselPaarZeilenProps {
  frage: string
  paare: readonly SchluesselPaar[]

  linkeFelder: readonly DataSourceField[]
  rechteFelder: readonly DataSourceField[]
  linkeBezeichnung: (at: number) => string
  rechteBezeichnung: (at: number) => string
  entfernenBezeichnung: (at: number) => string
  onAendern: (paare: SchluesselPaar[]) => void
}

export function SchluesselPaarZeilen({
  frage,
  paare,
  linkeFelder,
  rechteFelder,
  linkeBezeichnung,
  rechteBezeichnung,
  entfernenBezeichnung,
  onAendern,
}: SchluesselPaarZeilenProps) {
  const setzePaar = (at: number, teil: Partial<SchluesselPaar>) =>
    onAendern(paare.map((p, i) => (i === at ? { ...p, ...teil } : p)))

  // Der Waehler bringt die Suche mit — eine Quelle kann hunderte Felder
  // haben. Und er zeigt einen Feldcode, den die Quelle nicht mehr kennt,
  // rot statt wie das rohe <select> einfach leer.
  const feldWaehler = (
    bezeichnung: string,
    felder: readonly DataSourceField[],
    wert: string,
    onWaehle: (code: string) => void,
  ) => (
    <WaehlerKnopf
      className="flex-1"
      bezeichnung={bezeichnung}
      gruppen={[{
        key: 'felder',
        eintraege: felder.map((f) => ({ wert: f.code, name: f.label, kennung: f.code })),
      }]}
      wert={wert}
      leerText="— Feld —"
      onWaehle={onWaehle}
    />
  )

  return (
    <>
      <span className="text-xs text-muted-foreground">{frage}</span>
      {paare.map((paar, at) => (
        <div key={at} className="flex items-center gap-1.5">
          {feldWaehler(linkeBezeichnung(at), linkeFelder, paar.fromField,
            (code) => setzePaar(at, { fromField: code }))}
          <span className="shrink-0 text-xs text-muted-foreground">=</span>
          {feldWaehler(rechteBezeichnung(at), rechteFelder, paar.toField,
            (code) => setzePaar(at, { toField: code }))}
          {paare.length > 1 && (
            <IconButton
              aria-label={entfernenBezeichnung(at)}
              onClick={() => onAendern(paare.filter((_, x) => x !== at))}
            >
              <X size={13} />
            </IconButton>
          )}
        </div>
      ))}
      {paare.length < MAX_SCHLUESSELPAARE && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onAendern([...paare, { fromField: '', toField: '' }])}
        >
          <Plus size={13} /> Feld dazu
        </Button>
      )}
    </>
  )
}
