// Editor-Shell: neue UI-Anordnung aus Sidebar, Live-Canvas, Inspector und Status.
import { AppShell } from '@mantine/core'
import { Canvas } from '../canvas/Canvas'
import { Inspector } from '../inspector/Inspector'
import { Sidebar } from '../sidebar/Sidebar'
import { Header } from './Header'
import { StatusBar } from './StatusBar'

export function EditorShell() {
  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 284, breakpoint: 'sm' }}
      aside={{ width: 380, breakpoint: 'sm' }}
      footer={{ height: 34 }}
      padding={0}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Canvas />
      </AppShell.Main>
      <AppShell.Aside>
        <Inspector />
      </AppShell.Aside>
      <AppShell.Footer>
        <StatusBar />
      </AppShell.Footer>
    </AppShell>
  )
}
