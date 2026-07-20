// Export-Referenzabzug — 5. Wächter (Nutzer-Go 2026-07-17).
// Exportiert die feste Referenzmaske (src/test/referenzMaske.ts) mit den
// ECHTEN Bausteinen und vergleicht HTML + SEvariablen BYTE FÜR BYTE gegen
// die festgeschriebene Referenz in export/referenz/.
//
// Zweck: kein Umbau ändert den Export unbemerkt. Wird der Wächter rot,
// gibt es genau zwei ehrliche Wege:
//   - UNGEWOLLT (Aufräumen/Umbau sollte verhaltensgleich sein):
//     der Umbau ist falsch — Umbau korrigieren, NIE die Referenz.
//   - GEWOLLT (neue Funktion ändert die Maske absichtlich):
//     Referenz mit `npx vitest run -u` erneuern — der Datei-Diff der
//     Referenz zeigt die Export-Änderung sichtbar im Commit, und es gilt
//     Regel 9: Export berührt → SE-Echttest durch den Nutzer.
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Import: registriert ALLE echten Bausteine.
import '../blocks/register'
import { referenzMaske } from '../test/referenzMaske'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks, validateMaskHtml } from './validator'

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
    // .snap-Endung: die Referenz ist ein per toMatchFileSnapshot gefuehrter
    // Abzug, keine Quelldatei.
    await expect(html).toMatchFileSnapshot('./referenz/maske.html.snap')
    await expect(sevariablen).toMatchFileSnapshot('./referenz/maske.sevariablen.json.snap')
  })
})
