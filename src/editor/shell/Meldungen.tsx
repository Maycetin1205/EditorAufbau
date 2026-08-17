import { X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import { useMeldungen } from '../../state/useMeldungen'

export function Meldungen() {
  const stelle = useMeldungen()
  const liste = stelle.liste
  if (liste.length === 0) return null

  return (
    <div

      className="pointer-events-none fixed bottom-8 right-3 z-50 flex w-[22rem] max-w-[calc(100vw-1.5rem)] flex-col gap-2"
    >
      {liste.map((m) => (
        <div
          key={m.id}
          role="alert"
          className="pointer-events-auto flex items-start gap-1 rounded-md border border-border border-l-2 border-l-destructive bg-card p-2.5 pl-3 shadow-md"
        >

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
