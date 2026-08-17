import { useState } from 'react'
import { Wand2 } from '@/ui/zeichen'
import { useKeyboardShortcuts } from '../../state/useKeyboardShortcuts'
import { Canvas } from '../canvas/Canvas'
import { SeitenLeiste } from '../canvas/SeitenLeiste'
import { Inspector } from '../inspector/Inspector'
import { Sidebar } from '../sidebar/Sidebar'
import { Kommandozentrale } from '../zentrale/Kommandozentrale'
import { Meldungen } from './Meldungen'
import { StatusBar } from './StatusBar'
import { Toolbar, VerlaufKnoepfe } from './Toolbar'

export function EditorShell() {
  useKeyboardShortcuts()

  const [datencenterOffen, setDatencenterOffen] = useState(false)

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <header className="grid h-10 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-card px-2">
        <div className="flex min-w-0 items-center gap-2 pl-1">
          <span
            title="Aufbau-Editor"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <Wand2 size={13} />
          </span>
          <span className="h-4 w-px bg-border" />
          <VerlaufKnoepfe />
        </div>
        <div className="justify-self-center">
          <SeitenLeiste />
        </div>
        <Toolbar onDatencenter={() => setDatencenterOffen(true)} />
      </header>

      {datencenterOffen && <Kommandozentrale onClose={() => setDatencenterOffen(false)} />}

      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 overflow-hidden border-r border-border bg-card">
          <Sidebar />
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-[hsl(var(--canvas-bg))] p-5">
          <Canvas />
        </main>

        <aside className="w-[21.25rem] shrink-0 overflow-hidden border-l border-border bg-card">
          <Inspector />
        </aside>
      </div>

      <StatusBar />

      <Meldungen />
    </div>
  )
}
