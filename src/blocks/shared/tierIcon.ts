import { html, type TemplateResult } from 'lit'
import { pfoteIcon } from './pfote'
import { TIER_BILDER } from './tierBilder'

const TIER_KEY: ReadonlyArray<readonly [string, string]> = [
  ['welpe', 'hund'], ['hund', 'hund'],
  ['kater', 'katze'], ['katze', 'katze'],
  ['kaninchen', 'kaninchen'], ['hase', 'kaninchen'],

  ['meerschwein', 'meerschweinchen'],
  ['hamster', 'hamster'], ['ratte', 'hamster'], ['maus', 'hamster'],
  ['wellensittich', 'vogel'], ['sittich', 'vogel'], ['papagei', 'vogel'], ['vogel', 'vogel'],

  ['schildkr', 'schildkroete'],
  ['schlange', 'schlange'], ['natter', 'schlange'], ['python', 'schlange'],
  ['echse', 'schlange'], ['gecko', 'schlange'], ['reptil', 'schlange'],
  ['fisch', 'fisch'], ['koi', 'fisch'],
  ['pferd', 'pferd'], ['pony', 'pferd'], ['fohlen', 'pferd'],
]

export function tierBildName(wert: string): string {
  const a = wert.toLowerCase()
  for (const [wort, bild] of TIER_KEY) {
    if (a.includes(wort)) return bild
  }
  return ''
}

export function tierBild(wert: string): TemplateResult | undefined {
  const bild = tierBildName(wert)
  const quelle = bild === '' ? undefined : TIER_BILDER[bild]
  if (quelle === undefined) return undefined

  return html`<img src=${quelle} alt="" aria-hidden="true" />`
}

export function tierIcon(wert: string): TemplateResult {
  return tierBild(wert) ?? pfoteIcon()
}
