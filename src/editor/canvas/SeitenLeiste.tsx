// SeitenLeiste
// Seiten-Reiter — seit R1 (2026-07-21) als kompakte segmentierte Gruppe in
// der Top-Bar der Shell (vorher schwebend über der Fläche). Reine
// Editor-Hilfe: Hauptseite | Popup-Klarnamen | + Popup. Umbenannt wird am
// Ding (Doppelklick auf den Fenstertitel der Popup-Seite), gelöscht über
// das normale Entfernen des selektierten Popups.

import { useEditor } from '../../state/useEditor'

export function SeitenLeiste() {
  const ed = useEditor()
  const pages = ed.pages
  const aktiv = ed.activePageId
  return (
    <div
      className="flex max-w-[44vw] items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-muted p-0.5"
      data-ff-editor-helper
    >
      {pages.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => ed.setActivePage(p.id)}
          className={
            p.id === aktiv
              ? 'h-6 shrink-0 whitespace-nowrap rounded-md bg-card px-2.5 text-xs font-semibold text-foreground shadow-sm'
              : 'h-6 shrink-0 whitespace-nowrap rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground'
          }
        >
          {p.name}
        </button>
      ))}
      <button
        type="button"
        onClick={() => ed.addPopupPage()}
        title="Neue Popup-Seite anlegen"
        className="h-6 shrink-0 whitespace-nowrap rounded-md px-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground"
      >
        ＋ Popup
      </button>
    </div>
  )
}
