import { html, type TemplateResult } from 'lit'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { meldeFehler } from '../../softengine/meldung'
import { zeilenNachAuswahl } from '../shared/auswahl'
import {
  DIALOG_RAHMEN_TAG,
  DIALOG_SCHLIESSEN_EVENT,
  type DialogRahmen,
} from '../shared/DialogRahmen'
import { zeilePasst } from '../shared/textSuche'

export function nachschlagFeldTpl(args: {
  wert: string
  onTippen: (wert: string) => void
  onVerlassen: () => void
  onLupe: () => void
}): TemplateResult {
  return html`<div class="nachschlag">
    <input
      class="ctrl"
      type="text"
      .value=${args.wert}
      @input=${(e: Event) => args.onTippen((e.target as HTMLInputElement).value)}
      @blur=${() => args.onVerlassen()}
    />
    <button
      class="lupe"
      type="button"
      aria-label="Nachschlagen"
      title="Nachschlagen"
      @click=${() => args.onLupe()}
    ><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
      <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
    </svg></button>
  </div>`
}

export interface NachschlagenArgs {
  el: HTMLElement
  quelleId: string
  anzeigeFeld: string
  speicherFeld: string
  anzeigeTitel: string
  speicherTitel: string
  titel: string
  onUebernehmen: (anzeige: string, wert: string, satz: unknown) => void
}

export interface Eintrag {
  anzeige: string
  wert: string

  satz: unknown
}

export interface NachschlagEinstellung {
  el: HTMLElement
  quelleId: string
  anzeigeFeld: string
  speicherFeld: string
}

const SEITENGROESSE = 10

export function nachschlagEintraege(
  rows: readonly unknown[],
  anzeigeFeld: string,
  speicherFeld: string,
): Eintrag[] {
  const eintraege: Eintrag[] = []
  const gleichesFeld = anzeigeFeld.trim() !== '' && anzeigeFeld.trim() === speicherFeld.trim()
  const gesehen = new Set<string>()
  for (const row of rows) {
    const anzeige = getField(row, anzeigeFeld).trim()
    const wert = getField(row, speicherFeld).trim()
    if (anzeige === '' && wert === '') continue
    if (gleichesFeld) {
      if (gesehen.has(wert)) continue
      gesehen.add(wert)
    }
    eintraege.push({ anzeige, wert, satz: row })
  }
  return eintraege
}

export function nachschlagTreffer(eintraege: readonly Eintrag[], suchtext: string): Eintrag[] {
  return eintraege.filter((eintrag) => zeilePasst([eintrag.anzeige, eintrag.wert], suchtext))
}

export function fensterEintraege(
  el: HTMLElement,
  rows: unknown[],
  anzeigeFeld: string,
  speicherFeld: string,
): Eintrag[] {
  return nachschlagEintraege(zeilenNachAuswahl(el, rows).rows, anzeigeFeld, speicherFeld)
}

export type EintraegeErgebnis =
  | { ok: true; eintraege: Eintrag[] }
  | { ok: false; grund: 'unvollstaendig' | 'quelleFehlt' }

export function holeEintraege(e: NachschlagEinstellung): EintraegeErgebnis {
  if (e.quelleId === '' || e.anzeigeFeld === '' || e.speicherFeld === '') {
    return { ok: false, grund: 'unvollstaendig' }
  }
  const quelle = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, e.quelleId)
  if (!quelle) return { ok: false, grund: 'quelleFehlt' }
  const rows = rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId)
  return { ok: true, eintraege: fensterEintraege(e.el, rows, e.anzeigeFeld, e.speicherFeld) }
}

export function einzigenTrefferFinden(
  eintraege: readonly Eintrag[],
  feldLeer: boolean,
): Eintrag | null {
  return feldLeer && eintraege.length === 1 ? eintraege[0] : null
}

export function satzPasstZurAuswahl(el: HTMLElement, satz: unknown): boolean {
  const { rows, gefiltert } = zeilenNachAuswahl(el, [satz])
  return !gefiltert || rows.length > 0
}

export type VerlassenFolge = 'nichts' | 'leeren' | 'zurueck'

export function folgeBeimVerlassen(

  getippt: string,

  bestaetigteAnzeige: string,
  bestaetigterWert: string,
): VerlassenFolge {
  if (getippt === '') {
    return bestaetigteAnzeige === '' && bestaetigterWert === '' ? 'nichts' : 'leeren'
  }
  return getippt === bestaetigteAnzeige ? 'nichts' : 'zurueck'
}

let offen: DialogRahmen | null = null

function schliesse(): void {
  offen?.remove()
  offen = null
}

function zelle(text: string, kopf = false): HTMLTableCellElement {
  const element = document.createElement(kopf ? 'th' : 'td')
  element.textContent = text
  element.style.cssText = kopf
    ? 'position:sticky;top:0;z-index:1;padding:6px 10px;text-align:left;'
      + 'font-size:var(--se-fs-sm);font-weight:600;color:var(--se-muted);'
      + 'border-bottom:var(--se-border) solid var(--se-line);background:var(--se-panel-2)'
    : 'box-sizing:border-box;height:24px;padding:3px 10px;overflow:hidden;text-overflow:ellipsis;'
      + 'white-space:nowrap;border-bottom:var(--se-border) solid var(--se-line-soft)'
  return element
}

function seitenKnopf(text: string, label: string): HTMLButtonElement {
  const knopf = document.createElement('button')
  knopf.type = 'button'
  knopf.textContent = text
  knopf.setAttribute('aria-label', label)
  knopf.style.cssText = 'box-sizing:border-box;width:26px;height:24px;padding:0;'
    + 'border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm);'
    + 'background:var(--se-panel);color:var(--se-ink);font:inherit;cursor:pointer'
  return knopf
}

export function oeffneNachschlagen(args: NachschlagenArgs): void {
  const ergebnis = holeEintraege(args)
  if (!ergebnis.ok) {
    meldeFehler(ergebnis.grund === 'unvollstaendig'
      ? 'Nachschlagen ist an diesem Feld nicht vollstaendig eingestellt (Quelle, Angezeigt, Gespeichert).'
      : 'Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.')
    return
  }
  const eintraege = ergebnis.eintraege

  schliesse()

  const dialog = document.createElement(DIALOG_RAHMEN_TAG) as DialogRahmen
  dialog.setAttribute('data-ff-nachschlagen', '')
  dialog.viewport = true
  dialog.mitWerkzeug = true
  dialog.escapeSchliesst = true
  dialog.titel = args.titel !== '' ? args.titel : 'Nachschlagen'
  dialog.breite = 520
  dialog.hoehe = 380
  dialog.addEventListener(DIALOG_SCHLIESSEN_EVENT, schliesse)

  dialog.addEventListener('click', (event) => event.stopPropagation())

  const suche = document.createElement('input')
  suche.slot = 'werkzeug'
  suche.type = 'search'
  suche.placeholder = 'suchen ...'
  suche.setAttribute('aria-label', 'Nachschlagen durchsuchen')
  suche.style.cssText = 'box-sizing:border-box;width:100%;padding:5px 8px;'
    + 'font:inherit;color:inherit;background:var(--se-panel);'
    + 'border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm)'

  const tabelle = document.createElement('table')
  tabelle.style.cssText = 'width:100%;table-layout:fixed;border-collapse:collapse'
  const spalten = document.createElement('colgroup')
  const anzeigeSpalte = document.createElement('col')
  anzeigeSpalte.style.width = '65%'
  const wertSpalte = document.createElement('col')
  wertSpalte.style.width = '35%'
  spalten.append(anzeigeSpalte, wertSpalte)

  const kopf = document.createElement('thead')
  const kopfZeile = document.createElement('tr')
  kopfZeile.append(
    zelle(args.anzeigeTitel !== '' ? args.anzeigeTitel : 'Angezeigt', true),
    zelle(args.speicherTitel !== '' ? args.speicherTitel : 'Wert', true),
  )
  kopf.appendChild(kopfZeile)

  const rumpf = document.createElement('tbody')
  tabelle.append(spalten, kopf, rumpf)

  const tabellenBereich = document.createElement('div')
  tabellenBereich.style.cssText = 'flex:1 1 auto;min-height:0;overflow:auto'
  tabellenBereich.appendChild(tabelle)

  const fuss = document.createElement('div')
  fuss.style.cssText = 'box-sizing:border-box;flex:none;display:flex;align-items:center;'
    + 'min-height:33px;padding:4px 10px;border-top:var(--se-border) solid var(--se-line);'
    + 'background:var(--se-panel-2);font-size:var(--se-fs-sm)'
  const zaehler = document.createElement('span')
  zaehler.setAttribute('aria-live', 'polite')
  zaehler.style.cssText = 'flex:1;color:var(--se-muted)'

  const navigation = document.createElement('nav')
  navigation.setAttribute('aria-label', 'Trefferseiten')
  navigation.style.cssText = 'display:flex;align-items:center;gap:6px'
  const zurueck = seitenKnopf('‹', 'Vorherige Seite')
  const seitenstand = document.createElement('span')
  seitenstand.style.cssText = 'min-width:48px;text-align:center;color:var(--se-muted)'
  const weiter = seitenKnopf('›', 'Nächste Seite')
  navigation.append(zurueck, seitenstand, weiter)
  fuss.append(zaehler, navigation)

  const inhalt = document.createElement('div')
  inhalt.style.cssText = 'box-sizing:border-box;height:100%;min-height:0;display:flex;flex-direction:column'
  inhalt.append(tabellenBereich, fuss)

  let seite = 1
  let seiten = 1

  const zeichneTreffer = (): void => {
    rumpf.replaceChildren()
    const treffer = nachschlagTreffer(eintraege, suche.value)
    seiten = Math.max(1, Math.ceil(treffer.length / SEITENGROESSE))
    seite = Math.min(seite, seiten)
    const start = (seite - 1) * SEITENGROESSE
    const sichtbareTreffer = treffer.slice(start, start + SEITENGROESSE)

    zaehler.textContent = treffer.length === 0
      ? '0 von 0'
      : `${start + 1}-${Math.min(start + SEITENGROESSE, treffer.length)} von ${treffer.length}`
    seitenstand.textContent = `${seite} / ${seiten}`
    zurueck.disabled = seite === 1
    weiter.disabled = seite === seiten
    zurueck.style.opacity = zurueck.disabled ? '0.4' : '1'
    weiter.style.opacity = weiter.disabled ? '0.4' : '1'
    zurueck.style.cursor = zurueck.disabled ? 'default' : 'pointer'
    weiter.style.cursor = weiter.disabled ? 'default' : 'pointer'
    tabellenBereich.scrollTop = 0

    if (sichtbareTreffer.length === 0) {
      const zeile = document.createElement('tr')
      const leer = zelle(
        eintraege.length === 0 ? 'Diese Quelle hat keine Sätze.' : 'Kein Satz passt zur Suche.',
      )
      leer.colSpan = 2
      leer.style.color = 'var(--se-faint)'
      leer.style.fontSize = 'var(--se-fs-sm)'
      leer.style.padding = '16px 10px'
      zeile.appendChild(leer)
      rumpf.appendChild(zeile)
      return
    }

    for (const trefferZeile of sichtbareTreffer) {
      const zeile = document.createElement('tr')
      zeile.tabIndex = 0
      zeile.style.cursor = 'pointer'
      const anzeige = zelle(trefferZeile.anzeige)
      const wert = zelle(trefferZeile.wert)
      wert.style.fontFamily = 'var(--se-mono)'
      wert.style.color = 'var(--se-muted)'
      zeile.append(anzeige, wert)

      const uebernehmen = (): void => {
        schliesse()
        args.onUebernehmen(trefferZeile.anzeige, trefferZeile.wert, trefferZeile.satz)
      }
      zeile.addEventListener('click', uebernehmen)
      zeile.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        uebernehmen()
      })
      zeile.addEventListener('mouseenter', () => {
        zeile.style.background = 'var(--se-accent-soft)'
      })
      zeile.addEventListener('mouseleave', () => {
        zeile.style.background = ''
      })
      rumpf.appendChild(zeile)
    }
  }

  suche.addEventListener('input', () => {
    seite = 1
    zeichneTreffer()
  })
  zurueck.addEventListener('click', () => {
    if (seite === 1) return
    seite -= 1
    zeichneTreffer()
  })
  weiter.addEventListener('click', () => {
    if (seite === seiten) return
    seite += 1
    zeichneTreffer()
  })
  zeichneTreffer()
  dialog.append(suche, inhalt)
  document.body.appendChild(dialog)
  offen = dialog
  void dialog.updateComplete.then(() => {
    if (dialog.isConnected) suche.focus()
  })
}
