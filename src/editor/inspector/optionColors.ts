const OPTION_COLORS: Record<string, string> = {
  info: 'var(--se-blue)',      // „Hinweis“
  success: 'var(--se-green)',  // „Erfolg“
  warning: 'var(--se-amber)',  // „Warnung“
  danger: 'var(--se-red)',     // „Fehler“

  standard: 'var(--se-ink)',
  gedaempft: 'var(--se-muted)',
  akzent: 'var(--se-accent)',
  erfolg: 'var(--se-green)',
  warnung: 'var(--se-amber)',
  fehler: 'var(--se-red)',
}

export function optionColor(value: string): string | undefined {
  return OPTION_COLORS[value]
}

export function allOptionsHaveColor(options: readonly { value: string }[]): boolean {
  return options.length > 0 && options.every((o) => o.value in OPTION_COLORS)
}
