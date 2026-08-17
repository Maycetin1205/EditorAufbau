import { MousePointerClick } from '@/ui/zeichen'
import type { ReactElement } from 'react'

export function LeerHinweis({ titel }: { titel: string }): ReactElement {
  return (
    <div
      data-ff-editor-helper
      className="pointer-events-none flex flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-card/70 px-8 py-6 text-center font-sans"
    >
      <MousePointerClick size={18} className="text-muted-foreground/60" />
      <p className="text-[0.8125rem] font-medium text-foreground/80">{titel}</p>
      <p className="text-xs text-muted-foreground">
        Zieh einen Baustein aus der Bibliothek links hierher.
      </p>
    </div>
  )
}
