import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'

interface EditorFensterProps {
  // Was das Fenster IST — steht im aria-label, nicht sichtbar.
  bezeichnung: string

  // Die sichtbare Kopfzeile. Kommt als Knoten, weil die Fenster dort
  // Baustein-Name und Zusatz verschieden setzen.
  titel: ReactNode

  onClose: () => void
  children: ReactNode
}

// Die EINE Huelle aller Editor-Fenster: abgedunkelte Flaeche, Kasten mittig,
// Kopfzeile mit Schliessen-Kreuz, Escape und Klick daneben schliessen. Vorher
// stand dieselbe Huelle zweimal im Code (Datencenter und Ketten-Fenster) —
// wer eine anfasste, aenderte nur das halbe Haus.
export function EditorFenster({ bezeichnung, titel, onClose, children }: EditorFensterProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 p-6"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={bezeichnung}
        className="flex h-full max-h-[47.5rem] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h2 className="min-w-0 truncate text-sm font-semibold">{titel}</h2>
          <IconButton aria-label="Schließen" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
