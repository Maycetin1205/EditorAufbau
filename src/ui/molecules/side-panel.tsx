// SidePanel: Molekül — Hülle für die Seiten-Organe (Sidebar, Inspector):
// schmaler Header (Titel + optionaler Untertitel) + scrollbarer Body.
// War vorher zweimal kopiert (Sidebar-Markup + InspectorFrame).
//
// Rückzeilen-Modus (R3-Feinschliff 2026-07-21): setzt der Aufrufer `onBack`,
// blättert das Panel zu einer Unteraufgabe um — über dem Titel eine schmale
// klickbare Rückzeile „← <backLabel>". Kein Modal, keine Abdunklung, gleiche
// 340-px-Hülle: der Inspector-Inhalt wechselt komplett zur Aufgabe.

import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface SidePanelProps {
  title: ReactNode
  description?: ReactNode
  /** Knöpfe rechts im Panel-Kopf (z. B. Duplizieren/Löschen im Inspector). */
  actions?: ReactNode
  /** Setzt den Rückzeilen-Modus: Klick/Enter blättert zur Herkunft zurück. */
  onBack?: () => void
  /** Beschriftung der Rückzeile (nur mit onBack), z. B. der Baustein-Name. */
  backLabel?: ReactNode
  children: ReactNode
}

export function SidePanel({ title, description, actions, onBack, backLabel, children }: SidePanelProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <header className="flex items-start justify-between gap-2 px-0.5">
        <div className="flex min-w-0 flex-col gap-1">
          {onBack && (
            <button
              type="button"
              aria-label="Zurück"
              onClick={onBack}
              className="flex min-w-0 items-center gap-1 self-start text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={13} className="shrink-0" />
              <span className="truncate">{backLabel}</span>
            </button>
          )}
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {description && !onBack && (
            <p className="text-[0.6875rem] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center">{actions}</div>}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}
