// SidePanel: Molekül — Hülle für die Seiten-Organe (Sidebar, Inspector):
// schmaler Header (Titel + optionaler Untertitel) + scrollbarer Body.
// War vorher zweimal kopiert (Sidebar-Markup + InspectorFrame).

import type { ReactNode } from 'react'

interface SidePanelProps {
  title: ReactNode
  description?: ReactNode
  /** Knöpfe rechts im Panel-Kopf (z. B. Duplizieren/Löschen im Inspector). */
  actions?: ReactNode
  children: ReactNode
}

export function SidePanel({ title, description, actions, children }: SidePanelProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <header className="flex items-start justify-between gap-2 px-0.5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center">{actions}</div>}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}
