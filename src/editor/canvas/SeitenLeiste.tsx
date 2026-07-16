// SeitenLeiste
// Seiten-Reiter über der Arbeitsfläche (P-A; Aufräumen A3 — wörtlich aus
// Canvas.tsx gezogen). Reine Editor-Hilfe: Hauptseite | Popup-Klarnamen |
// + Popup. Umbenannt wird am Ding (Doppelklick auf den Fenstertitel der
// Popup-Seite), gelöscht über das normale Entfernen des selektierten Popups.

import { useEditor } from '../../state/useEditor'

export function SeitenLeiste() {
  const ed = useEditor()
  const pages = ed.pages
  const aktiv = ed.activePageId
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5" data-ff-editor-helper>
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Seiten
      </span>
      {pages.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => ed.setActivePage(p.id)}
          className={
            p.id === aktiv
              ? 'rounded border border-ring bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground'
              : 'rounded border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:border-ring hover:text-foreground'
          }
        >
          {p.name}
        </button>
      ))}
      <button
        type="button"
        onClick={() => ed.addPopupPage()}
        className="rounded border border-dashed border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-ring hover:text-foreground"
      >
        ＋ Popup
      </button>
    </div>
  )
}
