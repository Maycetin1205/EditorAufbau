// SidePanel: Molekül — Hülle für die Seiten-Organe (Sidebar, Inspector):
// schmaler Header (Titel + optionaler Untertitel) + scrollbarer Body.
// War vorher zweimal kopiert (Sidebar-Markup + InspectorFrame).

import type { ReactNode } from 'react'

interface SidePanelProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
}

export function SidePanel({ title, description, children }: SidePanelProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <header className="flex flex-col gap-1 px-0.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}
