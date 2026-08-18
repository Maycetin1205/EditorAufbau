import { css, html, nothing, type TemplateResult } from 'lit'
import { zeilePasst } from './textSuche'

// Die Tipp-Vorschlagsliste. Sie entsteht EINMAL hier und wird geteilt: das
// Formularfeld „nachschlagen" zeigt sie zuerst (G1), die Erfassungszeile der
// Tabelle bekommt dieselbe (G2). Geteilt sind Logik UND Aussehen — zwei
// Fassungen wuerden auseinanderlaufen, genau wie beim Nachschlage-Fenster
// vor V7.

// Mehr als acht Treffer liest niemand im Vorbeitippen; wer alle sehen will,
// nimmt das grosse Fenster (Wellen-Kopf G: „bis ~8 Treffer").
export const VORSCHLAEGE_MAX = 8

export interface Vorschlag {
  anzeige: string

  wert: string
}

// Gesucht wird in BEIDEM, Anzeige und gespeichertem Wert: Geuebte tippen
// „bay" fuer Baytril, andere die Nummer (Wellen-Kopf G). Leer getippt = KEINE
// Liste — bei leerem Feld ist Enter der Weg ins grosse Fenster, und alle
// Saetze untereinander waeren dort nur im Weg.
export function passendeVorschlaege<T extends Vorschlag>(
  eintraege: readonly T[],
  getippt: string,
  max: number = VORSCHLAEGE_MAX,
): T[] {
  if (getippt.trim() === '') return []
  const treffer: T[] = []
  for (const eintrag of eintraege) {
    if (!zeilePasst([eintrag.anzeige, eintrag.wert], getippt)) continue
    treffer.push(eintrag)
    if (treffer.length >= max) break
  }
  return treffer
}

// Die Marke laeuft um: unter dem letzten Treffer geht es oben wieder los.
// Ohne Treffer gibt es nichts zu markieren — dann steht sie auf 0.
export function bewegteMarke(marke: number, anzahl: number, schritt: 1 | -1): number {
  if (anzahl <= 0) return 0
  return (((marke + schritt) % anzahl) + anzahl) % anzahl
}

// Jeder Tastendruck kann die Liste kuerzen; eine Marke hinter dem Ende waere
// eine Uebernahme ins Leere. Sie faellt dann auf den ersten Treffer zurueck.
export function gueltigeMarke(marke: number, anzahl: number): number {
  if (anzahl <= 0) return 0
  return marke < 0 || marke >= anzahl ? 0 : marke
}

// Was eine Taste an der Vorschlagsliste bedeutet — als eigene Entscheidung,
// weil die Erfassungszeile der Tabelle (G2/G3) genau dieselbe braucht (dort
// kommt nur der Sprung in die naechste Zelle hinzu) und weil sie sich so ohne
// Feld und ohne Browser pruefen laesst. Benannte Schalter statt zwei
// boolean hintereinander: vertauscht sieht man an der Aufrufstelle nicht.
export type TastenFolge =
  | 'marke-hoch'
  | 'marke-runter'
  | 'uebernehmen'
  | 'liste-zu'
  | 'fenster'
  | 'nichts'

export function tastenFolge(taste: string, args: {
  listeOffen: boolean

  feldLeer: boolean
}): TastenFolge {
  if (taste === 'ArrowDown') return args.listeOffen ? 'marke-runter' : 'nichts'
  if (taste === 'ArrowUp') return args.listeOffen ? 'marke-hoch' : 'nichts'
  if (taste === 'Escape') return args.listeOffen ? 'liste-zu' : 'nichts'
  if (taste !== 'Enter') return 'nichts'
  if (args.listeOffen) return 'uebernehmen'
  // Enter im LEEREN Feld oeffnet das grosse Fenster (Wellen-Kopf G).
  // Getippter Text ohne Treffer laesst es ZU: sonst belohnt das Fenster den
  // Tippfehler und der Bediener verliert seinen Text aus den Augen.
  return args.feldLeer ? 'fenster' : 'nichts'
}

export function vorschlagListeTpl(args: {
  eintraege: readonly Vorschlag[]

  marke: number

  onWaehlen: (index: number) => void

  onMarke: (index: number) => void
}): TemplateResult {
  // mousedown abfangen: ohne das verliert das Feld den Fokus, BEVOR der
  // Klick ankommt — das Verlassen raeumt die Liste ab und der Klick landet
  // im Leeren.
  return html`<ul
    class="vorschlaege"
    @mousedown=${(e: MouseEvent) => e.preventDefault()}
  >${args.eintraege.map((eintrag, i) => html`<li
      class=${i === args.marke ? 'vorschlag marke' : 'vorschlag'}
      @click=${() => args.onWaehlen(i)}
      @mouseenter=${() => args.onMarke(i)}
    ><span class="vorschlag-anzeige">${eintrag.anzeige !== '' ? eintrag.anzeige : eintrag.wert}</span>${
      eintrag.wert !== '' && eintrag.wert !== eintrag.anzeige
        ? html`<span class="vorschlag-wert">${eintrag.wert}</span>`
        : nothing
    }</li>`)}</ul>`
}

// Der Halter der Liste braucht `position: relative` und muss ueber seinen
// Nachbarn liegen — das steht beim jeweiligen Baustein, weil nur er weiss,
// welches Element sein Halter ist.
export const vorschlagStil = css`
  .vorschlaege {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 3;
    max-height: 240px;
    overflow: auto;
    margin: 2px 0 0;
    padding: 0;
    list-style: none;
    background: var(--se-panel);
    border: var(--se-border) solid var(--se-accent);
    border-radius: var(--se-r-md);
    font-family: var(--se-font);
    font-size: var(--se-fs);
    color: var(--se-ink);
  }

  .vorschlag {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--se-gap);
    padding: 4px 10px;
    white-space: nowrap;
    cursor: pointer;
  }
  .vorschlag + .vorschlag { border-top: 1px solid var(--se-line-soft); }

  .vorschlag-anzeige { overflow: hidden; text-overflow: ellipsis; }

  .vorschlag-wert {
    flex: none;
    color: var(--se-muted);
    font-size: var(--se-fs-sm);
  }

  .vorschlag.marke { background: var(--se-accent-soft); }
`
