export function generateProjectMap(): boolean
export function isProjectMapCurrent(): boolean
export function projectMapStatus(): {
  current: boolean
  verified: boolean
  method: string
  problems: string[]
}
export function importsFrom(source: string, extension: string): Array<{
  specifier: string
  kind: 'runtime' | 'type' | 'dynamic' | 'style' | 'asset'
}>
export function analyzeImports(source: string, extension: string): {
  imports: ReturnType<typeof importsFrom>
  unresolved: string[]
}
export function buildMapData(): {
  nodes: Array<{ id: string; category: string; description: string; external: boolean }>
  edges: Array<{ from: string; to: string; kind: string }>
  analysis: { method: string; problems: string[] }
}
export function renderProjectMap(): string
