import { html, nothing, type TemplateResult } from 'lit'

// Die Nummernspalte links. In der Demo des Nutzers (Belegtabelle, 2026-08-20)
// ist sie der GRIFF der Zeile: sie zeigt, welche Zeile gemeint ist, und an ihr
// hängen die Zeilen-Werkzeuge — „einiges geht ja inline" (Nutzer-Ansage).
//
// Es gibt sie nur bei eingeschalteter Erfassung. Einer reinen Anzeige-Tabelle
// würde sonst eine Spalte wachsen, die niemand bestellt hat — und jede schon
// gebaute Maske sähe plötzlich anders aus.
export const GRIFF_SPUR = '32px'

// Zweistellig wie in der Demo: so springt die Spaltenbreite nicht, wenn die
// Liste von 9 auf 10 Zeilen wächst.
export function griffNummer(nummer: number): string {
  return String(nummer).padStart(2, '0')
}

export interface GriffLage {
  // Die laufende Nummer der Zeile auf dem Schirm. `null` = kein Satz und
  // keine Eingabe (Platzhalter-Zeile): dort steht nichts, eine Nummer ohne
  // Zeile wäre eine erfundene Position.
  nummer: number | null

  // Die Zeile, in der gearbeitet wird — sie trägt die Marke.
  aktiv: boolean

  // Nur die tippbaren Zeilen sind über den Griff wählbar. Datenzeilen haben
  // ihren Klick schon an der ganzen Zeile (aktiviereZeile).
  aufKlick?: () => void
}

export function zeilenGriffTpl(lage: GriffLage): TemplateResult {
  const klasse = lage.aktiv ? 'griff aktiv' : 'griff'
  return html`<div
    class=${klasse}
    role="cell"
    @click=${lage.aufKlick ?? nothing}
  >${lage.nummer === null ? nothing : griffNummer(lage.nummer)}</div>`
}

// Der leere Griff über dem Stapel: im Kopf und im Lineal steht keine Nummer,
// aber die Spur muss besetzt sein — sonst rutschen alle Zellen um eine Spalte.
export function leererGriffTpl(): TemplateResult {
  return html`<div class="griff leer" role="presentation"></div>`
}
