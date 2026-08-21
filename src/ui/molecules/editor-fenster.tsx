import { useEffect, useRef, type ReactNode } from 'react'
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

// Wer liegt oben? Escape schliesst nur das oberste Fenster. Vorher meldete
// jedes Fenster einen eigenen Horcher an und hielt die Taste nicht auf: EIN
// Escape schloss den ganzen Stapel (Datencenter -> Ketten-Fenster) auf
// einmal. Die Marke ist ein Objekt und damit fuer jedes Fenster eigen.
const fensterStapel: object[] = []

// Die EINE Huelle aller Editor-Fenster: abgedunkelte Flaeche, Kasten mittig,
// Kopfzeile mit Schliessen-Kreuz, Escape und Klick daneben schliessen. Vorher
// stand dieselbe Huelle zweimal im Code (Datencenter und Ketten-Fenster) —
// wer eine anfasste, aenderte nur das halbe Haus.
export function EditorFenster({ bezeichnung, titel, onClose, children }: EditorFensterProps) {
  // onClose kommt von Rendern zu Rendern als neue Funktion. Ueber den Zeiger
  // gelesen, haengt die Anmeldung im Stapel nicht daran — sonst flog das
  // Fenster bei jedem Rendern aus dem Stapel und kaeme als OBERSTES zurueck,
  // auch wenn ein anderes darueber liegt.
  const schliessen = useRef(onClose)
  useEffect(() => { schliessen.current = onClose })

  useEffect(() => {
    const marke = {}
    fensterStapel.push(marke)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (fensterStapel[fensterStapel.length - 1] !== marke) return
      schliessen.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const stelle = fensterStapel.indexOf(marke)
      if (stelle >= 0) fensterStapel.splice(stelle, 1)
    }
  }, [])

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
