// Uebersicht — der Einstiegs-Bereich der Steuerung (Gerüst 2026-07-15).
// Kacheln mit Zählern je Bereich + die „Zu erledigen"-Liste aus der
// VORHANDENEN Export-Vorprüfung (preflightMask): dieselben Meldungen, die
// sonst erst beim Export-Klick als Abbruch erscheinen, stehen hier vorab —
// mit Sprung in den passenden Bereich. Keine neue Prüf-Logik (Ampeln über
// die Vorprüfung hinaus = Z4).

import type { CheckResult } from '../../export/validator'

export type Bereich = 'uebersicht' | 'datenquellen' | 'relationen' | 'aktionen'

// Welche Vorprüfungs-Meldung in welchem Bereich zu beheben ist. Meldungen
// ohne Eintrag (z. B. Kanban-Kennzeichen — die behebt man am Baustein
// selbst) erscheinen ohne Sprung-Knopf.
const SPRUNGZIEL: Record<string, Bereich> = {
  'Datenquelle fehlt': 'datenquellen',
  'Aktion unvollstaendig': 'aktionen',
}

export interface UebersichtZaehler {
  datenquellen: number
  relationen: number
  aktionenBausteine: number
  aktionenSchritte: number
}

interface UebersichtProps {
  zaehler: UebersichtZaehler
  probleme: readonly CheckResult[]
  oeffne: (bereich: Bereich) => void
}

function Kachel({ titel, wert, status, warnung, onClick }: {
  titel: string
  wert: string
  status: string
  warnung: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-ring"
    >
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span
          className={`size-2 shrink-0 rounded-full ${warnung ? 'bg-amber-500' : 'bg-emerald-600'}`}
        />
        {titel}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{wert}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{status}</div>
    </button>
  )
}

export function Uebersicht({ zaehler, probleme, oeffne }: UebersichtProps) {
  const quellenProbleme = probleme.filter((p) => p.name === 'Datenquelle fehlt').length
  const aktionsProbleme = probleme.filter((p) => p.name === 'Aktion unvollstaendig').length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <Kachel
          titel="Datenquellen"
          wert={String(zaehler.datenquellen)}
          status={quellenProbleme > 0 ? `${quellenProbleme} Verweis(e) kaputt` : 'in Ordnung'}
          warnung={quellenProbleme > 0}
          onClick={() => oeffne('datenquellen')}
        />
        <Kachel
          titel="Relationen"
          wert={String(zaehler.relationen)}
          status="in Ordnung"
          warnung={false}
          onClick={() => oeffne('relationen')}
        />
        <Kachel
          titel="Aktionen"
          wert={`${zaehler.aktionenSchritte}`}
          status={
            aktionsProbleme > 0
              ? `${aktionsProbleme} Schritt(e) unvollständig`
              : `Schritte an ${zaehler.aktionenBausteine} Baustein(en)`
          }
          warnung={aktionsProbleme > 0}
          onClick={() => oeffne('aktionen')}
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Zu erledigen
        </h3>
        {probleme.length === 0 ? (
          <p className="mt-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground">
            Nichts offen.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {probleme.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs"
              >
                <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-500" />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{p.name}:</span> {p.detail}
                </span>
                {SPRUNGZIEL[p.name] && (
                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-border px-2 py-0.5 font-medium hover:border-ring hover:text-foreground"
                    onClick={() => oeffne(SPRUNGZIEL[p.name])}
                  >
                    Öffnen
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
