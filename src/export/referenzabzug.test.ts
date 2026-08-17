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

    await expect(ohneBuendel(html)).toMatchFileSnapshot('./referenz/maske.html.snap')
    await expect(sevariablen).toMatchFileSnapshot('./referenz/maske.sevariablen.json.snap')
  })
})
