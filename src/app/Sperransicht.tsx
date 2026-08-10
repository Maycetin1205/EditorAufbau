// Sperransicht — was der Bediener sieht, wenn sein gespeicherter Stand unter
// Quarantaene steht (A3).
//
// Der Fall: der Stand im Browser stammt aus einer NEUEREN Version des Editors
// (ab A4 auch: beim Laden waere etwas verlorengegangen). Diese App darf ihn
// nicht anfassen — sie kennt nicht, was darin steht, und ihr Autosave wuerde
// die verkleinerte Fassung 500 ms nach dem Start festschreiben.
//
// Darum ersetzt diese Ansicht den Editor, statt neben ihm zu stehen: ein
// Editor, der nie speichert, waere die schlimmere Falle. Es gibt GENAU DREI
// Wege weiter, alle vom Bediener ausgeloest, und keiner tut mehr, als er
// sagt. Es wird nichts automatisch „repariert" — dieser Editor kann einen
// Stand aus der Zukunft nicht verstehen, und so zu tun als ob, waere die
// gefaehrlichste Zusage von allen.
//
// Das hier ist EDITOR-Welt (index.css/shadcn, Muster: Fehlergrenze.tsx),
// nicht Masken-Welt: keine --se-*-Tokens.

import { useRef, useState, type ReactNode } from 'react'
import { downloadFile } from '../lib/dateiDownload'
import type { Editor } from '../state/Editor'
import type { LadeProblem } from '../core/data/ladeProblem'
import { uebernehmeMaske } from '../state/maskeUebernehmen'
import { packeMaskeAus } from '../state/maskenDatei'
import { meldeVerworfeneTypen, verwerfeGesperrteStaende } from '../state/persistence'
import { speicherGate, type Quarantaene, type QuarantaeneQuelle } from '../state/speicherGate'
import { Button } from '@/ui/atoms/button'

interface SperransichtProps {
  quarantaene: Quarantaene
  editor: Editor
  // Ruft die Ansicht, sobald wieder ein gueltiger Stand offen ist — dann
  // uebernimmt die Oberflaeche wie sonst.
  onWeiter: () => void
}

// Lange Listen abschneiden: bei einem von Hand verbogenen Stand koennen es
// hunderte sein, und dann liest niemand mehr etwas. Die Zahl der restlichen
// steht dabei — verschwiegen wird nichts.
const MAX_PROBLEME = 12

export function Sperransicht({ quarantaene, editor, onWeiter }: SperransichtProps) {
  const [dateiFehler, setDateiFehler] = useState<{ grund: string; probleme: readonly LadeProblem[] } | null>(null)
  const [verwerfenGefragt, setVerwerfenGefragt] = useState(false)
  const dateiRef = useRef<HTMLInputElement>(null)

  const rohdatenSichern = (quelle: QuarantaeneQuelle): void => {
    const stempel = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const teil = quelle.bezeichnung.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    downloadFile(`aufbau-editor-rohdaten-${teil}-${stempel}.json`, quelle.rohdaten, 'application/json')
  }

  // Die Datei ist nur ein KANDIDAT: wird sie abgelehnt, bleibt die Sperre
  // stehen und die Rohdaten bleiben unangetastet. Erst ein nachweislich
  // gueltiger Stand hebt den Riegel — in dieser Reihenfolge, sonst wuerde die
  // Uebernahme sofort wieder ins Leere speichern.
  const dateiGewaehlt = async (datei: File): Promise<void> => {
    let text: string
    try {
      text = await datei.text()
    } catch {
      setDateiFehler({ grund: 'Die Datei konnte nicht gelesen werden.', probleme: [] })
      return
    }
    const ergebnis = packeMaskeAus(text)
    if (!ergebnis.ok) {
      setDateiFehler({ grund: ergebnis.grund, probleme: ergebnis.probleme })
      return
    }
    setDateiFehler(null)
    speicherGate.entsperre()
    uebernehmeMaske(editor, ergebnis.inhalt)
    meldeVerworfeneTypen(ergebnis.verworfen)
    onWeiter()
  }

  const verwerfen = (): void => {
    verwerfeGesperrteStaende()
    onWeiter()
  }

  return (
    <div className="flex h-screen w-screen items-start justify-center overflow-auto bg-background p-6">
      <div className="my-auto w-full max-w-xl space-y-5 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-base font-semibold text-foreground">
            Der gespeicherte Stand wurde unter Quarantäne gestellt.
          </h1>
          <p className="text-sm text-muted-foreground">{quarantaene.grund}</p>
          <p className="text-sm text-muted-foreground">
            Es wurde nichts verändert und nichts gelöscht. Der Stand liegt
            unangetastet im Browser-Speicher; solange diese Seite offen ist,
            speichert der Editor nicht — weder die Maske noch Datenquellen oder
            Relationen.
          </p>
          <ul className="space-y-1">
            {quarantaene.quellen.map((q) => (
              <li key={q.speicherSchluessel} className="text-xs text-muted-foreground">
                <span className="text-foreground">{q.bezeichnung}</span>
                {' — '}
                <code className="rounded bg-muted px-1">{q.speicherSchluessel}</code>
                {q.kopieSchluessel !== null
                  ? <>, unveränderte Kopie unter <code className="rounded bg-muted px-1">{q.kopieSchluessel}</code></>
                  : ' (eine zweite Kopie konnte der Browser nicht anlegen)'}
              </li>
            ))}
          </ul>
        </div>

        <ProblemListe titel="Gefunden wurde:" probleme={quarantaene.probleme} />

        <div className="space-y-3 border-t border-border pt-4">
          <Weg
            titel="Rohdaten als Datei sichern"
            text="Legt den Stand Byte für Byte als Datei ab. Ändert nichts."
          >
            <div className="flex flex-wrap items-center gap-2">
              {quarantaene.quellen.map((q) => (
                <Button
                  key={q.speicherSchluessel}
                  variant="outline"
                  size="sm"
                  onClick={() => rohdatenSichern(q)}
                >
                  {q.bezeichnung} sichern…
                </Button>
              ))}
            </div>
          </Weg>

          <Weg
            titel="Gültige Maskendatei öffnen"
            text={'Eine mit „Maske speichern…" gesicherte Datei. Wird sie geprüft und '
              + 'angenommen, geht es mit ihr weiter; wird sie abgelehnt, bleibt alles, wie es ist.'}
          >
            <input
              ref={dateiRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const datei = e.target.files?.[0]
                try {
                  if (datei) void dateiGewaehlt(datei)
                } finally {
                  // Ohne das Leeren loest DIESELBE Datei kein zweites
                  // 'change' aus, und der Bediener klickt ins Leere.
                  e.target.value = ''
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={() => dateiRef.current?.click()}>
              Maskendatei öffnen…
            </Button>
          </Weg>

          <Weg
            titel="Lokalen Stand verwerfen und leer beginnen"
            text={'Entfernt GENAU die oben genannten gesperrten Stände aus dem Browser — '
              + 'nichts daneben. Die unveränderten Kopien bleiben erhalten. Das lässt '
              + 'sich nicht rückgängig machen.'}
          >
            {verwerfenGefragt ? (
              <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={verwerfen}>
                  Endgültig verwerfen
                </Button>
                <Button variant="outline" size="sm" onClick={() => setVerwerfenGefragt(false)}>
                  Abbrechen
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setVerwerfenGefragt(true)}>
                Verwerfen…
              </Button>
            )}
          </Weg>
        </div>

        {dateiFehler && (
          <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-sm text-foreground">{dateiFehler.grund}</p>
            <ProblemListe titel="An dieser Datei:" probleme={dateiFehler.probleme} />
          </div>
        )}
      </div>
    </div>
  )
}

function ProblemListe({ titel, probleme }: { titel: string; probleme: readonly LadeProblem[] }) {
  if (probleme.length === 0) return null
  const gezeigt = probleme.slice(0, MAX_PROBLEME)
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-foreground">{titel}</p>
      <ul className="space-y-1">
        {gezeigt.map((p, i) => (
          <li key={`${p.bereich}-${p.stelle}-${i}`} className="text-xs text-muted-foreground">
            <span className="text-foreground">{p.bereich}</span>
            {p.stelle !== '' && <> · <code className="rounded bg-muted px-1">{p.stelle}</code></>}
            {' — '}
            {p.grund}
          </li>
        ))}
      </ul>
      {probleme.length > gezeigt.length && (
        <p className="text-xs text-muted-foreground">
          … und {probleme.length - gezeigt.length} weitere.
        </p>
      )}
    </div>
  )
}

function Weg({ titel, text, children }: { titel: string; text: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{titel}</p>
      <p className="text-xs text-muted-foreground">{text}</p>
      {children}
    </div>
  )
}
