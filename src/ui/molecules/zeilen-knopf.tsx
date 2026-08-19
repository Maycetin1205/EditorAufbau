import { cn } from '@/lib/utils'

interface ZeilenKnopfProps {
  // Links, fett: worum es geht („Zeigt", „Erfassen", „Aktionen").
  name: string

  // Rechts, blass: der aktuelle Stand in Klartext.
  stand: string

  // Faerbt den Stand rot — fuer einen Wert, den die Bibliothek nicht kennt
  // (dieselbe Sprache wie im WaehlerKnopf).
  standWarnung?: boolean

  bezeichnung: string
  onClick: () => void
  className?: string
}

// Ein Knopf, der eine ganze Zeile fuellt: links das Thema, rechts der Stand,
// Klick oeffnet das Fenster, das dazu gehoert. Traegt bewusst dieselbe Huelle
// wie der WaehlerKnopf (gleiche Hoehe, gleicher Rahmen) — der Inspector soll
// eine Handbreit bleiben und nicht nach zwei Bediensprachen aussehen.
export function ZeilenKnopf({
  name,
  stand,
  standWarnung,
  bezeichnung,
  onClick,
  className,
}: ZeilenKnopfProps) {
  return (
    <button
      type="button"
      aria-label={bezeichnung}
      onClick={onClick}
      className={cn(
        'flex h-8 w-full min-w-0 items-center gap-3 rounded-md border border-input bg-background px-2.5 text-left text-xs',
        'hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span className="shrink-0 font-medium text-foreground">{name}</span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-right',
          standWarnung ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {stand}
      </span>
    </button>
  )
}
