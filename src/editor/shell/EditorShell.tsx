// EditorShell
// Editor-Layout: Top-Header mit Logo + Toolbar, links Sidebar,
// mittig Canvas, rechts Inspector.

import { Wand2 } from 'lucide-react'
import { useKeyboardShortcuts } from '../../state/useKeyboardShortcuts'
import { Canvas } from '../canvas/Canvas'
import { Inspector } from '../inspector/Inspector'
import { Sidebar } from '../sidebar/Sidebar'
import { StatusBar } from './StatusBar'
import { Toolbar } from './Toolbar'

export function EditorShell() {
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wand2 size={15} />
          </span>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold">Aufbau</h1>
            <p className="text-[10px] text-muted-foreground">MVP Editor</p>
          </div>
        </div>
        <Toolbar />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 overflow-hidden border-r border-border bg-card">
          <Sidebar />
        </aside>

        <main className="min-w-0 flex-1 overflow-auto p-4">
          <Canvas />
        </main>

        <aside className="w-[340px] shrink-0 overflow-auto border-l border-border bg-card p-3">
          <Inspector />
        </aside>
      </div>

      <StatusBar />
    </div>
  )
}
