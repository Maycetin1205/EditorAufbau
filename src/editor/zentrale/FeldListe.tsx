import { Plus, X } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { LEERE_ZEILE, type FeldZeile } from './feldZeile'

const SPALTEN = 'grid grid-cols-[minmax(0,1fr)_72px_72px_auto] items-center gap-x-2'
const SPALTEN_NAMEN = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-x-2'

interface FeldListeProps {
  zeilen: FeldZeile[]
  setZeilen: (naechste: FeldZeile[]) => void
  zeilenFehler: string[]
  doppeltFehler: string
  zeigeFehler: boolean

  // DataSet-Quellen sprechen ihre Spalten mit Namen an — dann steht hier
  // ein Namensfeld statt der zwei Zahlenfelder.
  spaltenNamen?: boolean
}

export function FeldListe({
  zeilen, setZeilen, zeilenFehler, doppeltFehler, zeigeFehler, spaltenNamen = false,
}: FeldListeProps) {
  const raster = spaltenNamen ? SPALTEN_NAMEN : SPALTEN
  const setZeile = (at: number, patch: Partial<FeldZeile>) =>
    setZeilen(zeilen.map((row, i) => (i === at ? { ...row, ...patch } : row)))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[0.6875rem] font-medium">Felder</span>
        <Button variant="outline" size="sm" onClick={() => setZeilen([...zeilen, { ...LEERE_ZEILE }])}>
          <Plus size={13} /> Feld
        </Button>
      </div>

      <div className={`${raster} text-[0.6875rem] text-muted-foreground`}>
        <span>Klarname</span>
        {spaltenNamen
          ? <span>Spalte im DataSet</span>
          : <><span>Position</span><span>Länge</span></>}
        <span />
      </div>
      {zeilen.map((z, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className={raster}>
            <TextInput
              aria-label={`Feld ${i + 1}: Klarname`}
              value={z.label}
              placeholder="z. B. Vorname"
              onChange={(e) => setZeile(i, { label: e.target.value })}
            />
            {spaltenNamen ? (
              <TextInput
                aria-label={`Feld ${i + 1}: Spalte im DataSet`}
                value={z.rawCode}
                placeholder="z. B. Chargennummer"
                onChange={(e) => setZeile(i, { rawCode: e.target.value })}
              />
            ) : (
              <>
                <TextInput
                  aria-label={`Feld ${i + 1}: Position`}
                  value={z.pos}
                  placeholder={z.rawCode !== '' ? '—' : '193'}
                  onChange={(e) => setZeile(i, { pos: e.target.value })}
                />
                <TextInput
                  aria-label={`Feld ${i + 1}: Länge`}
                  value={z.len}
                  placeholder={z.rawCode !== '' ? '—' : '30'}
                  onChange={(e) => setZeile(i, { len: e.target.value })}
                />
              </>
            )}
            <IconButton
              aria-label={`Feld ${i + 1} entfernen`}
              onClick={() => setZeilen(zeilen.filter((_, at) => at !== i))}
            >
              <X size={14} />
            </IconButton>
          </div>
          {zeigeFehler && zeilenFehler[i] !== '' && (
            <p className="text-xs text-destructive">{zeilenFehler[i]}</p>
          )}
        </div>
      ))}
      {zeigeFehler && doppeltFehler !== '' && (
        <p className="text-xs text-destructive">{doppeltFehler}</p>
      )}
    </div>
  )
}
