import { describe, expect, it } from 'vitest'

import '../blocks/register'
import { referenzMaske } from '../test/referenzMaske'
import { exportMask } from './exportMask'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import { preflightMask } from './preflight'
import { escapeNonAsciiJs, guardScriptContent } from './serializer'
import { failedChecks, validateMaskHtml } from './validator'

function ohneBuendel(html: string): string {
  const eingebettet = guardScriptContent(escapeNonAsciiJs(runtimeJsRaw.trim()))
  const teile = html.split(eingebettet)
  expect(teile, 'Runtime-Bündel nicht exakt EINMAL im Export gefunden — Einbettung geändert? Dann ohneBuendel() anpassen.').toHaveLength(2)
  return teile.join('/* Runtime-Buendel herausgeschnitten - bewacht von check:runtime + export.test.ts */')
}

/* Dieselbe Ueberlegung wie beim Buendel: die Tierbilder sind ein 29,7-KB-Block
   konstanter Daten. Im Abzug soll sichtbar bleiben, DASS die Maske sie
   bestellt (die Referenzmaske hat eine Karte mit Avatar), nicht ihr Inhalt --
   sonst ertraenkt ein Konstanten-Blob jede echte Maskenaenderung im Diff. */
function ohneBilder(html: string): string {
  return html.replace(
    /window\.FF_TIER_BILDER = \{.*?\};/,
    (treffer) => `/* window.FF_TIER_BILDER herausgeschnitten (${String(treffer.length)} Zeichen Bilddaten) */`,
  )
}

describe('Export-Referenzabzug (Byte-Wächter)', () => {
  it('Referenzmaske besteht Preflight + Validator', () => {
    const { tree, sources, relations } = referenzMaske()
    expect(preflightMask(tree, sources, relations)).toEqual([])
    const { html } = exportMask(tree, referenzMaske().titel, sources, relations)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Referenzmaske exportiert Byte für Byte wie festgeschrieben', async () => {
    const { titel, tree, sources, relations } = referenzMaske()
    const { html, sevariablen } = exportMask(tree, titel, sources, relations)

    await expect(ohneBilder(ohneBuendel(html))).toMatchFileSnapshot('./referenz/maske.html.snap')
    await expect(sevariablen).toMatchFileSnapshot('./referenz/maske.sevariablen.json.snap')
  })
})
