import { html, type TemplateResult } from 'lit'
import { pfoteIcon } from './pfote'

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

/* Die Bilder selbst stehen NICHT hier. Sie sind Daten (10 PNGs, 29,7 KB) und
   lagen bis 2026-08-21 als Modul im Laufzeit-Buendel — damit trug JEDE
   exportierte Maske sie mit, auch eine ohne ein einziges Tierbild. Jetzt legt
   sie hin, wer sie braucht: der Editor beim Start (main.tsx) und der Export
   nur dann, wenn ein Baustein im Baum sie laut Registry zeigt
   (`brauchtTierbilder`, gesammelt in export/tierbilder.ts).
   Fehlt der Vorrat, zeigt tierIcon die Pfote — dasselbe Bild wie bei einem
   Wert, der zu keiner Art passt. */
function bildQuelle(name: string): string | undefined {
  if (name === '') return undefined
  const roh: unknown = (globalThis as { FF_TIER_BILDER?: unknown }).FF_TIER_BILDER
  if (typeof roh !== 'object' || roh === null) return undefined
  const wert: unknown = (roh as Record<string, unknown>)[name]
  return typeof wert === 'string' && wert !== '' ? wert : undefined
}

export function tierBild(wert: string): TemplateResult | undefined {
  const quelle = bildQuelle(tierBildName(wert))
  if (quelle === undefined) return undefined

  return html`<img src=${quelle} alt="" aria-hidden="true" />`
}

export function tierIcon(wert: string): TemplateResult {
  return tierBild(wert) ?? pfoteIcon()
}
