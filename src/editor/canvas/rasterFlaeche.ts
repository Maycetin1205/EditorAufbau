// rasterFlaeche — WELCHES DOM-Element eine Rasterfläche gerade ist.
//
// Reine Editor-Hilfe (misst/sucht im DOM, läuft nie in der Maske). Die
// Zeiger→Zelle-Vermessung (rasterDnd) und das Pointer-Bewegen (rasterMove)
// brauchen das ECHTE Grid-Element — es ist zugleich der Scroll-Besitzer, den
// `zelleAusZeiger` mitrechnet.
//
// Warum es dafür eine eigene Frage braucht (C2, 2026-08-16): auf der
// Hauptfläche liegt der Baustein-Wrapper unmittelbar im Grid-Element, dort
// genügte `wrapper.parentElement`. Im POPUP liegt das Gitter (`.rumpf`) im
// SCHATTEN des Bausteins, die Bausteine des Bauers als Licht-DOM davor —
// `parentElement` wäre dort `<ff-popup>` und trüge weder Spalten noch
// Scrollstand. Beide Fragen unten sind reine DOM-Beziehungen: kein
// Bausteinwissen, kein `.rumpf` als versteckter Vertrag (Regel 2).

// Die Fläche, die DIESEN Wrapper layoutet. Ist er geslottet, ist es der
// Elternteil seines Slots (der Slot selbst steht auf display:contents und
// erzeugt keinen eigenen Kasten); sonst sein normaler Elternteil.
export function flaecheVon(wrapper: HTMLElement): HTMLElement | null {
  return wrapper.assignedSlot?.parentElement ?? wrapper.parentElement
}

// Die Fläche IN einem Baustein: dorthin wandern seine Kinder, also ist es der
// Elternteil seines Standard-<slot>. Beantwortet die Frage auch für ein LEERES
// Popup — dort gibt es keinen Wrapper, an dem sich die Fläche ablesen ließe,
// und genau dann braucht der erste Drop sie.
export function flaecheIn(host: Element | null | undefined): HTMLElement | null {
  const slot = host?.shadowRoot?.querySelector('slot:not([name])')
  const flaeche = slot?.parentElement
  return flaeche instanceof HTMLElement ? flaeche : null
}
