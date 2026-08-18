import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, Search } from '@/ui/zeichen'
import { cn } from '@/lib/utils'
import { AuswahlFenster } from './auswahl-fenster'
import { Field } from './field'

export interface WaehlerEintrag {
  wert: string

  name: string

  kennung?: string

  deaktiviert?: boolean
}

export interface WaehlerGruppe {
  key: string

  name?: string
  kennung?: string

  hinweis?: string
  eintraege: readonly WaehlerEintrag[]
}

const FENSTER_KLASSE = 'max-h-80 w-64'

function passt(text: string, suche: string): boolean {
  return text.toLowerCase().includes(suche)
}

interface WaehlerListeProps {
  gruppen: readonly WaehlerGruppe[]

  wert: string

  leerText?: string

  kopf?: ReactNode
  onWaehle: (wert: string) => void
}

export function WaehlerListe({ gruppen, wert, leerText, kopf, onWaehle }: WaehlerListeProps) {
  const [suche, setSuche] = useState('')
  const sucheRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { sucheRef.current?.focus() }, [])

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase()
    const treffer = s === ''
      ? gruppen
      : gruppen.map((g) => ({
          ...g,
          eintraege: g.eintraege.filter(
            (e) => passt(e.name, s) || passt(e.kennung ?? '', s),
          ),
        }))

    return treffer.filter((g) => g.eintraege.length > 0)
  }, [gruppen, suche])

  const leer = gefiltert.length === 0

  return (
    <>
      {kopf}
      <div className="flex items-center gap-1.5 border-b border-border px-2 py-1.5">
        <Search size={13} className="shrink-0 text-muted-foreground" />
        <input
          ref={sucheRef}
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Suchen…"
          aria-label="Suchen"
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {leerText !== undefined && suche.trim() === '' && (
        <button
          type="button"
          onClick={() => onWaehle('')}
          className={cn(
            'flex w-full items-baseline rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            wert === '' && 'font-semibold text-foreground',
          )}
        >
          {wert === '' ? '✓ ' : ''}{leerText}
        </button>
      )}

      {gefiltert.map((g) => (
        <div key={g.key}>
          {g.name !== undefined && g.name !== '' && (
            <p className="flex items-baseline gap-2 px-2 pb-0.5 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="min-w-0 truncate">{g.name}</span>
              {g.kennung !== undefined && g.kennung !== '' && (
                <span className="shrink-0 font-mono normal-case tracking-normal">{g.kennung}</span>
              )}
            </p>
          )}
          {g.hinweis !== undefined && g.hinweis !== '' && (
            <p className="px-2 pb-1 text-[0.625rem] text-muted-foreground">{g.hinweis}</p>
          )}
          {g.eintraege.map((e) => {
            const gewaehlt = e.wert === wert
            return (
              <button
                key={`${g.key}::${e.wert}`}
                type="button"
                disabled={e.deaktiviert}
                onClick={() => onWaehle(e.wert)}
                className={cn(
                  'flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs',
                  e.deaktiviert
                    ? 'cursor-not-allowed text-muted-foreground opacity-60'
                    : 'hover:bg-accent hover:text-accent-foreground',
                  gewaehlt && 'font-semibold',
                )}
              >
                <span className="min-w-0 truncate">{gewaehlt ? '✓ ' : ''}{e.name}</span>
                {e.kennung !== undefined && e.kennung !== '' && (
                  <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                    {e.kennung}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}

      {leer && (
        <p className="px-2 py-2 text-xs text-muted-foreground">
          {suche.trim() === '' ? 'Nichts zur Auswahl.' : 'Kein Treffer.'}
        </p>
      )}
    </>
  )
}

interface WaehlerKnopfProps {
  label?: string
  description?: string

  fehler?: ReactNode

  bezeichnung: string
  gruppen: readonly WaehlerGruppe[]
  wert: string
  leerText?: string

  platzhalter?: string
  className?: string
  onWaehle: (wert: string) => void
}

export function WaehlerKnopf({
  label,
  description,
  fehler,
  bezeichnung,
  gruppen,
  wert,
  leerText,
  platzhalter = '— wählen —',
  className,
  onWaehle,
}: WaehlerKnopfProps) {
  const [offen, setOffen] = useState<{ top: number; left: number } | null>(null)
  const knopfRef = useRef<HTMLButtonElement | null>(null)

  const treffer = gruppen.flatMap((g) => g.eintraege).find((e) => e.wert === wert)
  const unbekannt = wert !== '' && treffer === undefined

  const oeffne = () => {
    const r = knopfRef.current?.getBoundingClientRect()
    if (!r) return
    setOffen({
      top: Math.max(8, r.bottom + 4),
      left: Math.max(8, Math.min(r.left, window.innerWidth - 272)),
    })
  }

  const knopf = (id?: string, beschrieben?: string, ungueltig?: boolean) => (
    <button
      ref={knopfRef}
      id={id}
      aria-describedby={beschrieben}
      aria-invalid={ungueltig}
      type="button"
      onClick={oeffne}
      className={cn(
        'flex h-8 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-background px-2.5 text-left text-xs',
        'hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span
        className={cn(
          'min-w-0 flex-1 truncate',
          wert === '' && 'text-muted-foreground',
          unbekannt && 'text-destructive',
        )}
      >
        {unbekannt ? wert : (treffer?.name ?? (leerText ?? platzhalter))}
      </span>
      {treffer?.kennung !== undefined && treffer.kennung !== '' && (
        <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
          {treffer.kennung}
        </span>
      )}
      <ChevronDown size={13} className="shrink-0 text-muted-foreground" />
    </button>
  )

  return (
    <>
      {label === undefined && fehler === undefined
        ? knopf()
        : (
          <Field label={label} description={description} error={fehler}>
            {(f) => knopf(f.id, f['aria-describedby'], f['aria-invalid'])}
          </Field>
        )}
      {offen && (
        <AuswahlFenster
          bezeichnung={bezeichnung}
          oben={offen.top}
          links={offen.left}
          className={FENSTER_KLASSE}
          imBildHalten
          escapeAbfangen
          onClose={() => setOffen(null)}
        >
          <WaehlerListe
            gruppen={gruppen}
            wert={wert}
            leerText={leerText}
            onWaehle={(v) => {
              onWaehle(v)
              setOffen(null)
            }}
          />
        </AuswahlFenster>
      )}
    </>
  )
}
