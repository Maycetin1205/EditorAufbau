// Waehler — DAS eine Bauteil fuer „welches Feld?", „welche Quelle?",
// „welche Seite?", „welche Relation?", „welcher Baustein?".
//
// Warum es das gibt (gezaehlt 2026-08-17, Nutzer-Auftrag „komplett umbauen"):
// dieselben vier Fragen wurden im Editor auf 45 verschiedene Arten gestellt —
// ein Feld waehlte man an neun Stellen, eine Quelle an sieben, und ein
// Suchfeld gab es in genau EINEM der neun Feld-Waehler. Bei 21 Feldern scrollt
// man, bei 280 sucht man; die uebrigen acht liessen einen scrollen.
//
// Zwei Teile, damit beide Bauformen dasselbe zeigen:
//   WaehlerKnopf  — der Ausloeser in einer Formularzeile: aktueller Klarname,
//                   dahinter leise die Kennung, ein Pfeilchen. Oeffnet die
//                   Liste als schwebendes Fenster.
//   WaehlerListe  — der Inhalt: Suchzeile + Gruppen + Eintraege. Steht auch
//                   allein, wo schon ein Fenster da ist (der Feld-Picker an
//                   der angeklickten Stelle bringt seinen eigenen Rahmen und
//                   eigene Koepfe mit).
//
// Regel 3 in Reinform: sichtbar ist der KLARNAME, die Kennung/der Feldcode
// steht als leise Marke daneben, gespeichert wird allein der Technikwert.
//
// Die Suche ist IMMER da — auch bei drei Eintraegen. Ein Bedienelement, das
// mal so und mal anders aussieht, ist genau die Uneinheitlichkeit, gegen die
// dieses Bauteil gebaut wurde. Sie filtert Klarname UND Kennung: wer den
// Feldcode kennt, tippt ihn.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, Search } from '@/ui/zeichen'
import { cn } from '@/lib/utils'
import { AuswahlFenster } from './auswahl-fenster'
import { Field } from './field'

export interface WaehlerEintrag {
  // Technikwert — was gespeichert wird.
  wert: string
  // Klarname — was der Bediener liest.
  name: string
  // Leise Technik-Marke rechts ('2_8', 'ID0021', 'ADR'). Leer = keine.
  kennung?: string
}

export interface WaehlerGruppe {
  key: string
  // Gruppenkopf; fehlt er, stehen die Eintraege ohne Ueberschrift da (der
  // haeufige Fall: eine einzige Quelle).
  name?: string
  kennung?: string
  // Zusatz im Gruppenkopf, z. B. worueber eine weitere Quelle verknuepft ist.
  hinweis?: string
  eintraege: readonly WaehlerEintrag[]
}

// Fenstergroesse: dieselbe Breite wie der bisherige Feld-Picker (w-60), damit
// sich am gewohnten Bild nichts verschiebt; die Hoehe traegt jetzt die
// Suchzeile mit.
const FENSTER_KLASSE = 'max-h-80 w-64'

function passt(text: string, suche: string): boolean {
  return text.toLowerCase().includes(suche)
}

interface WaehlerListeProps {
  gruppen: readonly WaehlerGruppe[]
  // Aktueller Technikwert ('' = nichts gewaehlt).
  wert: string
  // Beschriftung des Eintrags, der die Wahl aufhebt. Fehlt er, gibt es ihn
  // nicht — manche Stellen MUESSEN eine Wahl haben.
  leerText?: string
  // Was ueber der Suchzeile steht (Feld-Picker: seine Wahl-/Zuordnungs-Koepfe).
  kopf?: ReactNode
  onWaehle: (wert: string) => void
}

export function WaehlerListe({ gruppen, wert, leerText, kopf, onWaehle }: WaehlerListeProps) {
  const [suche, setSuche] = useState('')
  const sucheRef = useRef<HTMLInputElement | null>(null)

  // Beim Aufmachen springt die Tastatur in die Suche — dieselbe Linie wie beim
  // Popup (C3.3): wer ein Fenster oeffnet, will darin arbeiten, nicht erst
  // hineinklicken.
  useEffect(() => { sucheRef.current?.focus() }, [])

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase()
    if (s === '') return gruppen
    return gruppen
      .map((g) => ({
        ...g,
        eintraege: g.eintraege.filter(
          (e) => passt(e.name, s) || passt(e.kennung ?? '', s),
        ),
      }))
      // Eine Gruppe ohne Treffer verschwindet ganz — ein leerer Quellenkopf
      // waere eine Ueberschrift ueber nichts.
      .filter((g) => g.eintraege.length > 0)
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
                onClick={() => onWaehle(e.wert)}
                className={cn(
                  'flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground',
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

      {/* Nichts gefunden: den Zustand benennen statt eine leere Flaeche zeigen
          (Regel 4). Bei GAR keinen Eintraegen steht derselbe Platz — sonst
          saehe „die Quelle hat keine Felder" aus wie „das Fenster ist kaputt". */}
      {leer && (
        <p className="px-2 py-2 text-xs text-muted-foreground">
          {suche.trim() === '' ? 'Nichts zur Auswahl.' : 'Kein Treffer.'}
        </p>
      )}
    </>
  )
}

interface WaehlerKnopfProps {
  // Beschriftung der Formularzeile. Fehlt sie, steht der Knopf allein (in
  // einer Parameterzeile, die ihre Beschriftung schon links traegt).
  label?: string
  description?: string
  // Klarname des Fensters fuer Hilfstechnik.
  bezeichnung: string
  gruppen: readonly WaehlerGruppe[]
  wert: string
  leerText?: string
  // Was im Knopf steht, solange nichts gewaehlt ist.
  platzhalter?: string
  className?: string
  onWaehle: (wert: string) => void
}

export function WaehlerKnopf({
  label,
  description,
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

  // Der GEWAEHLTE Eintrag ueber alle Gruppen. Nicht gefunden heisst: die Quelle
  // ist weg oder das Feld geloescht — dann steht der Technikwert selbst da.
  // Ihn zu verschweigen waere die stille Luege, gegen die Regel 4 steht: der
  // Export nimmt die Bindung unveraendert mit.
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

  const knopf = (id?: string, beschrieben?: string) => (
    <button
      ref={knopfRef}
      id={id}
      aria-describedby={beschrieben}
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
      {label === undefined
        ? knopf()
        : (
          <Field label={label} description={description}>
            {(f) => knopf(f.id, f['aria-describedby'])}
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
