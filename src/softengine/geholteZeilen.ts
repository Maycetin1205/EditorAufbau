const speicher = new Map<string, unknown[]>()

export function setzeGeholteZeilen(alias: string, zeilen: unknown[]): void {
  if (alias === '') return
  speicher.set(alias, zeilen)
}

export function geholteZeilenFuer(alias: string): unknown[] | undefined {
  return speicher.get(alias)
}

export function setzeGeholteZeilenZurueck(): void {
  speicher.clear()
}
