import { html, nothing, type TemplateResult } from 'lit'
import type { EintragsWahlOption } from '../../core/blocks/BlockDefinition'
import { coerceStatusVariant } from '../shared/statusVariant'
import { tierBild } from '../shared/tierIcon'
import { ZEILEN_HOEHE } from './seitengroesse'

export interface Zuordnung {
  wert: string
  name: string
  bedeutung: string
}

export function findeZuordnung(
  zuordnung: readonly Zuordnung[],
  wert: string,
): Zuordnung | undefined {
  const gesucht = wert.trim().toLowerCase()
  return zuordnung.find((z) => z.wert.trim().toLowerCase() === gesucht)
}

export interface ZusatzFeld {
  key: string

  label: string
}

export interface SpaltenArt {
  wert: string

  name: string

  spur: string

  klasse: string

  zusatzFelder?: readonly ZusatzFeld[]

  hoehe?: (felder: Record<string, string>) => number

  zelle: (
    wert: string,
    zuordnung: readonly Zuordnung[],
    zusatz: Record<string, string>,
  ) => TemplateResult | string
}

export const ART_TEXT = 'text'

export const ART_STATUS = 'status'

export const ART_BILD = 'bild'

const FELD_BILD = 'bild'
const FELD_UNTER = 'unter'

export const ZEILEN_HOEHE_BILD = 44

export const SPALTEN_ARTEN: readonly SpaltenArt[] = [
  {
    wert: ART_TEXT,
    name: 'Text',

    spur: 'minmax(0, 1fr)',
    klasse: '',
    zelle: (wert) => wert,
  },
  {
    wert: 'zahl',
    name: 'Zahl',
    spur: '90px',
    klasse: 'zahl',
    zelle: (wert) => wert,
  },
  {
    wert: 'datum',
    name: 'Datum',
    spur: '100px',
    klasse: 'zahl',
    zelle: (wert) => wert,
  },
  {
    wert: ART_STATUS,
    name: 'Status',
    spur: '120px',
    klasse: 'status',

    zelle: (wert, zuordnung) => {
      const treffer = findeZuordnung(zuordnung, wert)
      if (!treffer) return html`<span class="chip">${wert}</span>`
      return html`<span class="chip v-${coerceStatusVariant(treffer.bedeutung)}">${
        treffer.name.trim() === '' ? wert : treffer.name
      }</span>`
    },
  },
  {
    wert: ART_BILD,
    name: 'Bild + Name',

    spur: 'minmax(0, 1fr)',
    klasse: 'bild',
    zusatzFelder: [
      { key: FELD_BILD, label: 'Bild' },
      { key: FELD_UNTER, label: 'Unterzeile' },
    ],

    hoehe: (felder) =>
      (felder[FELD_BILD] ?? '') !== '' || (felder[FELD_UNTER] ?? '') !== ''
        ? ZEILEN_HOEHE_BILD
        : ZEILEN_HOEHE,

    zelle: (wert, _zuordnung, zusatz) => {
      const bild = tierBild(zusatz[FELD_BILD] ?? '')
      const unter = zusatz[FELD_UNTER] ?? ''
      return html`<div class="bild-name">
        ${bild === undefined ? nothing : html`<span class="bild-zeichen">${bild}</span>`}
        <div class="bild-text">
          <div class="bild-titel">${wert}</div>
          ${unter === '' ? nothing : html`<div class="bild-unter">${unter}</div>`}
        </div>
      </div>`
    },
  },
]

export function zeilenHoeheFuer(
  spalten: readonly { art: string; felder?: Record<string, string> }[],
): number {
  return spalten.reduce((hoch, s) => {
    const art = spaltenArt(s.art)
    return Math.max(hoch, art.hoehe?.(s.felder ?? {}) ?? ZEILEN_HOEHE)
  }, ZEILEN_HOEHE)
}

export function spaltenArt(wert: unknown): SpaltenArt {
  return SPALTEN_ARTEN.find((a) => a.wert === wert) ?? SPALTEN_ARTEN[0]
}

export const SPALTEN_ART_OPTIONEN: readonly EintragsWahlOption[] =
  SPALTEN_ARTEN.map((a) => ({
    wert: a.wert,
    name: a.name,
    ...(a.zusatzFelder ? { felder: a.zusatzFelder } : {}),
  }))

export const FELDER_KEY = 'felder'
