// EditorShell
// Editor-Layout: schmale Top-Bar (Maskenname | Seiten-Reiter | Werkzeuge),
// links Sidebar, mittig Canvas als Blatt auf ruhigem Grund, rechts
// Inspector. R1 (2026-07-21): Seiten-Reiter wohnen in der Top-Bar, der
// „MVP Editor"-Schriftzug ist Geschichte.

import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { useKeyboardShortcuts } from '../../state/useKeyboardShortcuts'
import { Canvas } from '../canvas/Canvas'
import { SeitenLeiste } from '../canvas/SeitenLeiste'
import { Inspector } from '../inspector/Inspector'
import { Sidebar } from '../sidebar/Sidebar'
import { Kommandozentrale } from '../zentrale/Kommandozentrale'
import { StatusBar } from './StatusBar'
import { Toolbar, VerlaufKnoepfe } from './Toolbar'

export function EditorShell() {
  useKeyboardShortcuts()
  // Kommandozentrale (Z1): öffnet über den Toolbar-Knopf „Steuerung".
  const [steuerungOffen, setSteuerungOffen] = useState(false)

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
        <Toolbar onSteuerung={() => setSteuerungOffen(true)} />
      </header>

      {steuerungOffen && <Kommandozentrale onClose={() => setSteuerungOffen(false)} />}

      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 overflow-hidden border-r border-border bg-card">
          <Sidebar />
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-[hsl(var(--canvas-bg))] p-5">
          <Canvas />
        </main>

        <aside className="w-[340px] shrink-0 overflow-hidden border-l border-border bg-card">
          <Inspector />
        </aside>
      </div>

      <StatusBar />
    </div>
  )
}
