import { html, nothing, type TemplateResult } from 'lit'
import { dateValueToInput } from './feldRuntime'

// Die Auswahlliste des Formularfelds: aus der Komma-Liste der Eigenschaft
// „Optionen" werden die Eintraege. Eigene Datei, weil sie als einziges
// Steuerelement eine Regel hat, die man kennen muss — den FREMDWERT.
//
// Fremdwert heisst: im Feld steht ein Wert, den die Optionen gar nicht
// anbieten (aus dem ERP gelesen, oder die Optionen wurden spaeter geaendert).
// Er bekommt eine versteckte eigene Option, damit das Feld ihn ANZEIGT statt
// still auf leer zu springen — der Editor wirft keine Daten weg, die er
// vorgefunden hat.
export function auswahlListeTpl(opts: {
  wert: string
  optionen: string
  onInput: (e: Event) => void
  onChange: () => void
}): TemplateResult {
  const eintraege = opts.optionen.split(',').map((o) => o.trim()).filter((o) => o !== '')
  const fremdwert = opts.wert !== '' && !eintraege.includes(opts.wert)
  return html`<select
    class="ctrl"
    .value=${opts.wert}
    @input=${opts.onInput}
    @change=${opts.onChange}
  >
    <option value="" disabled hidden></option>
    ${fremdwert ? html`<option value=${opts.wert} hidden>${opts.wert}</option>` : nothing}
    ${eintraege.length === 0
      ? html`<option disabled>(keine Optionen)</option>`
      : eintraege.map((o) => html`<option value=${o}>${o}</option>`)}
  </select>`
}

// Die zwei Steuerelemente ohne eigene Regel: der Mehrzeiler und das schlichte
// Eingabefeld. Sie stehen hier bei der Auswahlliste, weil alle drei dieselbe
// Aufgabe haben — ein Feldtyp, ein Steuerelement — und der Baustein daneben
// den Zustand und die Bedienung behaelt.
export function mehrzeilerTpl(opts: {
  wert: string
  onInput: (e: Event) => void
  onChange: () => void
}): TemplateResult {
  return html`<textarea
    class="ctrl"
    .value=${opts.wert}
    @input=${opts.onInput}
    @change=${opts.onChange}
  ></textarea>`
}

// `datum` ist der einzige Typ, dessen Anzeige nicht sein Wert ist: im Feld
// steht die Browser-Form, gespeichert bleibt unsere.
export function eingabeFeldTpl(opts: {
  typ: string
  wert: string
  onInput: (e: Event) => void
  onChange: () => void
  onFokus: (drin: boolean) => void
}): TemplateResult {
  return html`<input
    class="ctrl"
    type=${opts.typ}
    .value=${opts.typ === 'date' ? dateValueToInput(opts.wert) : opts.wert}
    @input=${opts.onInput}
    @change=${opts.onChange}
    @focus=${() => opts.onFokus(true)}
    @blur=${() => opts.onFokus(false)}
  />`
}
