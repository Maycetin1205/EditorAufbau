import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/ui/atoms/button'

interface FehlergrenzeProps {
  children: ReactNode
}

interface FehlergrenzeState {
  fehler: Error | null
}

export class Fehlergrenze extends Component<FehlergrenzeProps, FehlergrenzeState> {
  override state: FehlergrenzeState = { fehler: null }

  static getDerivedStateFromError(fehler: unknown): FehlergrenzeState {
    return { fehler: fehler instanceof Error ? fehler : new Error(String(fehler)) }
  }

  override componentDidCatch(fehler: Error, info: ErrorInfo): void {
    console.error('Editor abgestuerzt:', fehler, info.componentStack)
  }

  override render(): ReactNode {
    const { fehler } = this.state
    if (!fehler) return this.props.children
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="text-base font-semibold text-foreground">
            Der Editor ist auf einen Fehler gelaufen.
          </h1>
          <p className="text-sm text-muted-foreground">
            Die zuletzt gespeicherte Maske ist nicht betroffen — sie liegt im
            Browser-Speicher und wird beim Neuladen wieder geöffnet.
          </p>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-xs text-foreground">
            {fehler.message}
          </pre>
          <Button onClick={() => { location.reload() }}>Neu laden</Button>
        </div>
      </div>
    )
  }
}
