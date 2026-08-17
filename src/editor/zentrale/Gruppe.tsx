import type { ReactNode } from 'react'

interface GruppeProps {
  titel: string
  children: ReactNode
}

export function Gruppe({ titel, children }: GruppeProps) {
  return (
    <div>
      <h4 className="mb-1 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {titel}
      </h4>
      {children}
    </div>
  )
}
