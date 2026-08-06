// FieldPicker
// "Stelle anklicken → Feld wählen". Kleines
// Auswahlfeld direkt an der angeklickten Stelle — zeigt AUSSCHLIESSLICH
// Klarnamen aus dem Feld-Wörterbuch (nie Feldcodes, keine erfundenen
// Beispielwerte); der Feldcode (Technikwert) wird unsichtbar in die
// Bindungs-Prop geschrieben. "— nicht gebunden —" löst die Bindung wieder.
//
// Seit 2026-07-28 kann ein Baustein mehrere Datenquellen tragen. Der Picker
// zeigt sie deshalb als GRUPPEN: erste Quelle oben, danach die weiteren in
// Reihenfolge. Bei den weiteren steht dabei, WORÜBER verknüpft ist — der
// Bediener soll sehen, warum diese Quelle hier angeboten wird. Gibt es nur
// eine Quelle, sieht der Picker aus wie vorher (eine Gruppe, eine Kopfzeile).
//
// Reine Editor-Hilfe (Editor-UI-Tokens/Tailwind, KEIN Masken-Design):
// lebt im BlockHost über der Maske und erscheint nie im Export.

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { QUELLEN_TRENNER, bindungMitQuelle, zerlegeBindung } from '../../core/blocks/BlockDefinition'
import type { DataSourceField } from '../../core/data/dataSources'

// Eine Quelle als Abschnitt im Picker.
export interface PickerGruppe {
  // Technikwert; '' = erste Quelle des Bausteins (Bindung bleibt unqualifiziert).
  quelleId: string
  // Klarname der Quelle — was der Bediener liest (Regel 3).
  name: string
  // SE-Kennung in Bediener-Form ('ID0001', 'ADR', 'POS') als dezente
  // Technik-Marke NEBEN dem Klarnamen (Nutzer-Wunsch 2026-08-06: „nicht
  // nur der Alias"). Leer = keine Marke.
  kennung?: string
  // Bei weiteren Quellen: worüber verknüpft ist, in Klarnamen
  // ('Adressnummer'). Bei der ersten Quelle leer.
  hinweis?: string
  fields: readonly DataSourceField[]
}

// Eine zusätzliche WAHL über der Feldliste (Registry: ListenBindung.
// eintragsWahl — bei der Tabelle die Darstellung einer Spalte). Der Picker
// zeichnet sie generisch: er kennt nur Beschriftung, Optionen und den
// aktuellen Wert, nie deren Bedeutung.
export interface PickerWahl {
  label: string
  optionen: readonly { wert: string; name: string }[]
  aktuell: string
  onWaehle: (wert: string) => void
}

interface FieldPickerProps {
  // Klarname der Stelle (aus bindableSpots, z. B. 'Titel').
  spotLabel: string
  gruppen: readonly PickerGruppe[]
  // Optional, s. PickerWahl. Fehlt sie, sieht der Picker aus wie bisher.
  wahl?: PickerWahl
  // Aktuell gebundener Wert, ROH wie gespeichert ('' = ungebunden,
  // 'quelle::code' = Feld einer weiteren Quelle).
  current: string
  // Position in VIEWPORT-Koordinaten: der Picker haengt per Portal als
  // fixiertes Overlay am body — kein Scroll-/Overflow-Container (z. B.
  // der Kanban-Spaltenrumpf) kann ihn einfangen oder abschneiden.
  top: number
  left: number
  // Der fertige Wert, wie er gespeichert wird ('' = nicht gebunden).
  onPick: (wert: string) => void
  onClose: () => void
}

export function FieldPicker({
  spotLabel,
  gruppen,
  wahl,
  current,
  top,
  left,
  onPick,
  onClose,
}: FieldPickerProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Außenklick + Escape schließen. pointerdown (nicht click), damit auch
  // ein Klick, der woanders eine Auswahl startet, sofort schließt.
  // Scrollen außerhalb schließt ebenfalls: der Picker sitzt fixiert im
  // Viewport — beim Scrollen wanderte die Stelle sonst unter ihm weg.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onScroll = (e: Event) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('scroll', onScroll, true)
    }
  }, [onClose])

  // Der Haken sitzt am ZERLEGTEN Wert: bei einer Bindung an eine weitere
  // Quelle muss er in DEREN Gruppe stehen, nicht beim gleichnamigen Feldcode
  // der ersten Quelle. Im Bestand des Nutzers heisst „Tiername" in beiden
  // Quellen anders codiert — ohne Zerlegen stuende der Haken irgendwo.
  const jetzt = zerlegeBindung(current)

  const eintrag = (quelleId: string, code: string, name: string) => {
    const gewaehlt = code === jetzt.code && quelleId === jetzt.quelleId
    return (
      <button
        key={`${quelleId}${QUELLEN_TRENNER}${code === '' ? '__keine__' : code}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPick(bindungMitQuelle(quelleId, code))
        }}
        className={`flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground ${
          gewaehlt ? 'font-semibold' : ''
        }`}
      >
        <span>{gewaehlt ? '✓ ' : ''}{name}</span>
      </button>
    )
  }

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={`Feld für ${spotLabel}`}
      data-ff-editor-helper
      draggable={false}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      style={{ position: 'fixed', top, left, zIndex: 50 }}
      className="max-h-64 w-60 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      {/* Die zusätzliche Wahl steht OBEN und abgesetzt: sie gehört zur
          Stelle selbst, nicht zu einer der Quellen darunter. Ein Klick
          darauf schließt den Picker NICHT — Darstellung und Feld sind zwei
          Handgriffe an derselben Spalte, und wer beides ändern will, soll
          nicht zweimal aufmachen müssen. */}
      {wahl && (
        <div className="mb-1 border-b border-border pb-1">
          <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {wahl.label}
          </p>
          <div className="flex flex-wrap gap-1 px-1">
            {wahl.optionen.map((o) => (
              <button
                key={o.wert}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  wahl.onWaehle(o.wert)
                }}
                className={`rounded-sm border px-2 py-1 text-xs ${
                  o.wert === wahl.aktuell
                    ? 'border-primary bg-primary/10 font-semibold text-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Eine Quelle: Kopfzeile wie bisher. Mehrere: neutrale Kopfzeile, und
          jede Quelle bekommt ihre eigene Zwischenüberschrift. Die SE-Kennung
          steht dezent daneben (Mono, gedämpft — Nutzer 2026-08-06). */}
      <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {gruppen.length === 1 ? `${spotLabel} · Feld aus ${gruppen[0].name}` : `${spotLabel} · Feld wählen`}
        {gruppen.length === 1 && gruppen[0].kennung ? (
          <span className="ml-1.5 font-mono font-normal normal-case opacity-70">{gruppen[0].kennung}</span>
        ) : null}
      </p>
      {eintrag('', '', '— nicht gebunden —')}
      {gruppen.map((g, i) => (
        <div key={g.quelleId === '' ? '__erste__' : g.quelleId}>
          {gruppen.length > 1 && (
            <p className={`px-2 pb-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground ${i > 0 ? 'mt-1.5 border-t border-border pt-1.5' : 'pt-1.5'}`}>
              {g.name}
              {g.kennung ? <span className="ml-1.5 font-mono font-normal normal-case opacity-70">{g.kennung}</span> : null}
              {g.hinweis ? <span className="font-normal normal-case"> · über {g.hinweis}</span> : null}
            </p>
          )}
          {g.fields.map((f) => eintrag(g.quelleId, f.code, f.label))}
        </div>
      ))}
    </div>,
    document.body,
  )
}
