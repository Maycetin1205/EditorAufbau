import { html, type TemplateResult } from 'lit'

// Das Ankreuzfeld als eigene Aufgabe: sein SE-Wert-Kontrakt und seine
// Darstellung. Herausgezogen, weil es das EINZIGE Feld ist, dessen Wert nicht
// das ist, was der Bediener sieht — er sieht einen Haken, gespeichert wird ein
// Buchstabe. Diese Uebersetzung gehoert an EINE Stelle.
//
// Der Kontrakt ist belegt, nicht geraten: SoftEngine fuehrt Ja/Nein als
// Feldart `AJN` mit LAENGE 1 und den Werten `J`/`N` — 21 Vorkommen in den
// echten SE-Dateien des Nutzers (DatasetServer.xml, `@SAT`-Bloecke, 2026-08-20).
// Bis dahin war das Ankreuzfeld unbindbar, weil niemand sagen konnte, ob SE
// `J/N` oder `1/0` erwartet.

export const HAKEN_JA = 'J'

export const HAKEN_NEIN = 'N'

// Gelesen wird NACHSICHTIG: in gewachsenen Installationen steht in einem
// Ja/Nein-Feld auch mal `1` oder `X`. Geschrieben wird dagegen STRENG nach dem
// Kontrakt — sonst traegt unsere Maske die Uneinheitlichkeit weiter.
const ANGEHAKT_WERTE = [HAKEN_JA, '1', 'X', 'TRUE']

export function istAngehakt(wert: string): boolean {
  return ANGEHAKT_WERTE.includes(wert.trim().toUpperCase())
}

export function hakenWert(an: boolean): string {
  return an ? HAKEN_JA : HAKEN_NEIN
}

// Die Bindestelle sitzt an der ZEILE, nicht am Kaestchen: das Kaestchen ist
// 13 Pixel gross und waere als Klickziel im Editor nicht zu treffen.
export function ankreuzfeldTpl(opts: {
  angehakt: boolean
  gebunden: boolean
  onAendern: (an: boolean) => void
  text: TemplateResult
}): TemplateResult {
  return html`<div class="feld">
    <div class="zeile" data-ff-spot="value" ?data-ff-bound=${opts.gebunden}>
      <input
        class="ctrl"
        type="checkbox"
        .checked=${opts.angehakt}
        @change=${(e: Event) => opts.onAendern((e.target as HTMLInputElement).checked)}
      />
      ${opts.text}
    </div>
  </div>`
}
