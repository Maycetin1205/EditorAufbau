import { html, type TemplateResult } from 'lit'
import { datensatzText } from './suche'

export interface FussLage {
  hatQuelle: boolean

  sichtbar: number
  gesamt: number
  suchtAktiv: boolean
  auswahlAktiv: boolean
  seite: number
  seiten: number
}

export interface FussHandeln {
  blaettere: (zu: number) => void
}

export function tabelleFuss(lage: FussLage, tun: FussHandeln): TemplateResult {
  return html`<div class="fusszeile">
    <div class="seiten-info">${datensatzText({
      hatQuelle: lage.hatQuelle,
      sichtbar: lage.sichtbar,
      gesamt: lage.gesamt,
      suchtAktiv: lage.suchtAktiv,
      auswahlAktiv: lage.auswahlAktiv,
    })}</div>
    <div class="seiten-nav">
      <button
        aria-label="Seite zurück"
        ?disabled=${lage.seite <= 0}
        @click=${() => tun.blaettere(lage.seite - 1)}
      >‹</button>
      <span>Seite ${lage.seite + 1} von ${lage.seiten}</span>
      <button
        aria-label="Seite vor"
        ?disabled=${lage.seite >= lage.seiten - 1}
        @click=${() => tun.blaettere(lage.seite + 1)}
      >›</button>
    </div>
  </div>`
}
