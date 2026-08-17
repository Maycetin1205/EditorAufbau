import { Plus, X } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { SchrittSelect } from '@/ui/atoms/schritt-select'
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

  const felderOptionen = (felder: readonly DataSourceField[]) => (
    <>
      <option value="">— Feld —</option>
      {felder.map((f) => (
        <option key={f.code} value={f.code}>{f.label}</option>
      ))}
    </>
  )

  return (
    <>
      <span className="text-xs text-muted-foreground">{frage}</span>
      {paare.map((paar, at) => (
        <div key={at} className="flex items-center gap-1.5">
          <SchrittSelect
            className="min-w-0 flex-1"
            aria-label={linkeBezeichnung(at)}
            value={paar.fromField}
            onChange={(e) => setzePaar(at, { fromField: e.target.value })}
          >
            {felderOptionen(linkeFelder)}
          </SchrittSelect>
          <span className="shrink-0 text-xs text-muted-foreground">=</span>
          <SchrittSelect
            className="min-w-0 flex-1"
            aria-label={rechteBezeichnung(at)}
            value={paar.toField}
            onChange={(e) => setzePaar(at, { toField: e.target.value })}
          >
            {felderOptionen(rechteFelder)}
          </SchrittSelect>
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
