// Meldungen
// Die Anzeige der Editor-Meldungsspur (state/meldungen.ts): Karten unten
// rechts, ueber der Statuszeile. U2 (2026-08-12) — sie ersetzen die sieben
// `window.alert`-Kaesten.
//
// Nicht blockierend: die Karten liegen ueber der Flaeche (fixed), fangen keine
// Klicks ab, wo keine Karte ist (pointer-events), und niemand muss sie
// wegklicken, um weiterzuarbeiten. Sie blenden sich aber auch nicht von selbst
// aus — s. Kopf von meldungen.ts.

import { X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import { useMeldungen } from '../../state/useMeldungen'

export function Meldungen() {
  const stelle = useMeldungen()
  const liste = stelle.liste
  if (liste.length === 0) return null

  return (
    <div
      // pointer-events-none auf dem Stapel, -auto auf der Karte: der Streifen
      // rechts unten darf nicht die Flaeche darunter blockieren.
      className="pointer-events-none fixed bottom-8 right-3 z-50 flex w-[22rem] max-w-[calc(100vw-1.5rem)] flex-col gap-2"
    >
      {liste.map((m) => (
        <div
          key={m.id}
          role="alert"
          className="pointer-events-auto flex items-start gap-1 rounded-md border border-border border-l-2 border-l-destructive bg-card p-2.5 pl-3 shadow-md"
        >
          {/* whitespace-pre-line: die Texte tragen ihre eigenen Zeilenumbrueche
              (Fundliste einer abgelehnten Maskendatei, Notfallkopie-Schluessel). */}
          <p className="min-w-0 flex-1 whitespace-pre-line text-xs leading-relaxed text-foreground">
            {m.text}
          </p>
          <IconButton
            aria-label="Meldung schließen"
            title="Schließen"
            onClick={() => stelle.schliesse(m.id)}
          >
            <X size={13} />
          </IconButton>
        </div>
      ))}
    </div>
  )
}
