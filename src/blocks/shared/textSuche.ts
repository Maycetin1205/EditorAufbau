function woerterVon(text: string): string[] {
  return text.trim().toLowerCase().split(/\s+/).filter((w) => w !== '')
}

export function zeilePasst(zeile: readonly string[], suchtext: string): boolean {
  const woerter = woerterVon(suchtext)
  if (woerter.length === 0) return true

  const zeileText = zeile.join(' ').toLowerCase()
  return woerter.every((wort) => zeileText.includes(wort))
}
