import { html, nothing, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { vorschlagListeTpl, type Vorschlag } from '../shared/vorschlagListe'
import { spaltenArt } from './spaltenArten'
import { zielIn, type ErfassungsUmfeld } from './erfassungsZellen'
import { ZELLE_PLATZHALTER } from './spalten'

// EINE tippbare Zeile. Es gibt sie mehrmals: jede noch nicht geschriebene
// Position ist so eine Zeile, und die letzte ist die leere, in der es
// weitergeht (S2.6). Sie ist eine FÄHIGKEIT der Tabelle und kein eigener
// Baustein: ohne den Schalter gibt es sie nicht, und eine Tabelle ohne sie
// exportiert wie zuvor. Was eine Zelle tut, steht an ihrer Spalte (Feld +
// „Sucht beim Erfassen in") — an der Zeile selbst wird nichts eingestellt.

export interface ErfassungsLage {
  // Spalten, Tabellen-Quelle und Verknüpfungen — dieselbe Sicht, aus der auch
  // der Lauf seine Ableitungen zieht.
  umfeld: ErfassungsUmfeld

  cols: Readonly<Record<string, string>>

  imEditor: boolean

  // Welche der tippbaren Zeilen das ist. Steht am Element (`data-erf-zeile`),
  // damit der Baustein nach dem Rendern genau diese Zelle fokussieren kann.
  zeile: number

  // Die Zeile, in der der Bediener gerade arbeitet: sie traegt die Marke, und
  // die Zeilen-Werkzeuge meinen sie.
  aktiv: boolean

  // Steht etwas in ihr, ist sie eine werdende Position und wird links
  // markiert — erst der Knopf macht daraus einen ERP-Satz.
  gefuellt: boolean

  // Ohne Kopfzeile übernimmt im Editor auch die Erfassungszelle den
  // Kopf-Griff (Klick öffnet den Feld-Picker der Spalte) — sie sieht aus wie
  // die Strich-Zeilen darunter und muss sich gleich anfassen lassen
  // (Nutzer-Befund 2026-08-19). Gesetzt nur im Editor bei Kopf aus.
  zellenGriff?: (e: MouseEvent, index: number) => void

  // Was in der Zelle steht (Laufzeit).
  wert: (index: number) => string

  // Die offene Vorschlagsliste gehört zu GENAU EINER Zelle EINER Zeile: in
  // einer Zeile, die nicht die aktive ist, steht hier -1.
  tippSpalte: number
  vorschlaege: readonly Vorschlag[]
  marke: number

  // Nach OBEN aufklappen. Der Rumpf schneidet ab, was aus ihm herausragt
  // (`.koerper { overflow: auto }`): steht die Zeile am unteren Rand, wäre eine
  // Liste nach unten unerreichbar. Ist unter ihr noch Platz (das Lineal füllt
  // den Rest), klappt sie nach unten — dorthin wächst der Rollbereich mit.
  listeNachOben: boolean
}

export interface ErfassungsHandeln {
  tippen: (index: number, text: string) => void
  taste: (index: number, e: KeyboardEvent) => void
  verlassen: (index: number) => void

  // Der Fokus wandert in diese Zelle — auch per Maus oder Shift+Tab. Damit
  // wird ihre Zeile die aktive, ohne dass jemand tippt.
  betreten: (index: number) => void

  waehleVorschlag: (listenIndex: number) => void
  setzeMarke: (listenIndex: number) => void
}

function eingabe(
  lage: ErfassungsLage,
  tun: ErfassungsHandeln,
  index: number,
): TemplateResult {
  // Der Spaltenname steht blass IN der leeren Zelle (G5): wer reinklickt,
  // sieht sofort, was reingehört — der Klarname ist die Vorschau.
  return html`<input
    class="erf-eingabe"
    type="text"
    data-spalte=${index}
    placeholder=${lage.umfeld.spalten[index]?.titel ?? ''}
    .value=${lage.wert(index)}
    @input=${(e: Event) => tun.tippen(index, (e.target as HTMLInputElement).value)}
    @keydown=${(e: KeyboardEvent) => tun.taste(index, e)}
    @focus=${() => tun.betreten(index)}
    @blur=${() => tun.verlassen(index)}
  />`
}

// Eine SUCHENDE Zelle kann eine Vorschlagsliste zeigen und braucht dafür einen
// Halter; eine Zelle, die nirgends sucht („frei"), ist nur ein Eingabefeld —
// auch dann, wenn sie einen Wert aus einem gewählten Satz ANZEIGT. Eine Lupe
// hat hier keine mehr: Enter in der leeren Zelle öffnet das große Fenster
// (Nutzer-Entscheidung 2026-08-18). Die Lupe am Formularfeld bleibt.
function laufzeitZelle(
  lage: ErfassungsLage,
  tun: ErfassungsHandeln,
  index: number,
  mitListe: boolean,
): TemplateResult {
  if (!mitListe) return eingabe(lage, tun, index)
  const liste = lage.tippSpalte === index && lage.vorschlaege.length > 0
  return html`<div class=${lage.listeNachOben ? 'erf-halter nach-oben' : 'erf-halter'}>
    ${eingabe(lage, tun, index)}
    ${liste ? vorschlagListeTpl({
      eintraege: lage.vorschlaege,
      marke: lage.marke,
      onWaehlen: (i) => tun.waehleVorschlag(i),
      onMarke: (i) => tun.setzeMarke(i),
    }) : nothing}
  </div>`
}

function klassen(lage: ErfassungsLage): string {
  return ['zeile', 'erfassung']
    .concat(lage.aktiv ? ['aktiv'] : [])
    .concat(lage.gefuellt ? ['gefuellt'] : [])
    .join(' ')
}

export function erfassungsZeileTpl(
  lage: ErfassungsLage,
  tun: ErfassungsHandeln,
): TemplateResult {
  return html`<div
    class=${klassen(lage)}
    role="row"
    data-erf-zeile=${lage.zeile}
    style=${styleMap(lage.cols)}
  >
    ${lage.umfeld.spalten.map((spalte, i) => {
      const klasse = spaltenArt(spalte.art).klasse
      // Im Editor gibt es keine Daten und keine Eingaben, sondern Striche —
      // der Editor erfindet nie Daten (Regel 7).
      if (lage.imEditor) {
        const griff = lage.zellenGriff
        // Hat die Zelle den Kopf-Griff, gibt es KEINE Kopfzeile — dann traegt
        // sie auch deren Namen, blass, wie der Platzhalter, den der Bediener
        // spaeter an dieser Stelle sieht. Sonst stuende im Editor eine Tabelle
        // ganz ohne Beschriftung (Nutzer-Befund 2026-08-20).
        return html`<div
          class=${klasse}
          role="cell"
          data-ff-editable=${griff ? '' : nothing}
          @click=${griff ? (e: MouseEvent) => griff(e, i) : nothing}
        >${griff
          ? html`<span class="spalten-name">${spalte.titel}</span>`
          : ZELLE_PLATZHALTER}</div>`
      }
      const mitListe = zielIn(lage.umfeld, i).suchQuelleId !== ''
      return html`<div class=${klasse} role="cell">${
        laufzeitZelle(lage, tun, i, mitListe)
      }</div>`
    })}
  </div>`
}
