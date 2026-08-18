import type { ReactNode } from 'react'

interface SidePanelProps {
  title: ReactNode

  actions?: ReactNode
  children: ReactNode
}

export function SidePanel({ title, actions, children }: SidePanelProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <header className="flex items-start justify-between gap-2 px-0.5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-ui-titel font-semibold">{title}</h2>
        </div>
        {actions && <div className="flex shrink-0 items-center">{actions}</div>}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}
