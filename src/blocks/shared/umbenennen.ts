// Der EINE Inline-Umbenennen-Griff (Doppelklick auf einen Text): das Ziel
// wird voruebergehend editierbar, Enter/Blur schliesst ab, Escape bricht ab.
// Was mit dem neuen Text passiert, entscheidet der Aufrufer: gibt sein
// `uebernehmen` false zurueck, stellt der Griff den alten Anzeigestand
// wieder her.
export function starteUmbenennen(
  ziel: HTMLElement,
  uebernehmen: (neu: string, original: string) => boolean,
): void {
  const original = ziel.textContent ?? ''
  // Die Text-Knoten selbst merken, nicht nur den String: beim Tippen
  // mutiert der Browser die vorhandenen Knoten, und Lit besitzt sie —
  // beim Wiederherstellen muessen exakt dieselben Knoten zurueck.
  const originalKnoten = Array.from(ziel.childNodes)
  const originalTexte = originalKnoten.map((n) => n.textContent ?? '')
  ziel.setAttribute('contenteditable', 'plaintext-only')
  ziel.focus()
  const auswahl = window.getSelection()
  const bereich = document.createRange()
  bereich.selectNodeContents(ziel)
  auswahl?.removeAllRanges()
  auswahl?.addRange(bereich)

  const wiederherstellen = (): void => {
    ziel.replaceChildren(...originalKnoten)
    originalKnoten.forEach((n, i) => {
      if (n.textContent !== originalTexte[i]) n.textContent = originalTexte[i]
    })
  }

  let fertig = false
  const abschluss = (commit: boolean): void => {
    if (fertig) return
    fertig = true
    ziel.removeAttribute('contenteditable')
    ziel.removeEventListener('blur', beiBlur)
    ziel.removeEventListener('keydown', beiTaste)
    const uebernommen = commit && uebernehmen((ziel.textContent ?? '').trim(), original)
    if (!uebernommen) wiederherstellen()
  }
  const beiBlur = (): void => abschluss(true)
  const beiTaste = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ziel.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      abschluss(false)
    }
  }
  ziel.addEventListener('blur', beiBlur)
  ziel.addEventListener('keydown', beiTaste)
}
