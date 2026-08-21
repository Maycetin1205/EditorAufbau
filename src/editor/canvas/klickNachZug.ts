// Nach einem Zug mit dem Zeiger folgt noch EIN Klick auf dasselbe Element.
// Ungeschluckt wirkt er wie ein gewoehnlicher Klick: beim Verschieben im
// Raster landete er auf dem Nachbarn, an einem Groessen-Anfasser sprang die
// Auswahl weg. Geschluckt wird nur nach einem WIRKLICHEN Zug — Druecken ohne
// Bewegen bleibt ein Klick.
//
// Die eine Stelle fuer beide Zieh-Mechaniken (rasterMove, zieheGroesse);
// vorher stand das Muster nur in rasterMove, und der Groessen-Anfasser hatte
// es nicht.
function schluckeKlick(ev: MouseEvent): void {
  ev.stopPropagation()
  ev.preventDefault()
}

export function schluckeKlickNachZug(): void {
  window.addEventListener('click', schluckeKlick, { capture: true, once: true })
  // Folgt KEIN Klick (Zeiger ausserhalb losgelassen, Touch), raeumt der
  // Timeout auf — sonst frisst der once-Horcher irgendwann einen fremden Klick.
  setTimeout(() => {
    window.removeEventListener('click', schluckeKlick, { capture: true })
  }, 0)
}

export function vergissKlickSchlucker(): void {
  window.removeEventListener('click', schluckeKlick, { capture: true })
}
