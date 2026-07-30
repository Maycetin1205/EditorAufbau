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
//
// Der Abzug hält Markup + Datenzeilen (window.FF_DATA_SOURCES/FF_RELATIONS)
// fest — OHNE das Runtime-Bündel (entrauscht 2026-07-30). Das Minifikat
// stand hier mit rund 1000 von 1104 Zeilen und überdeckte jeden Diff: ob
// sich die MASKE geändert hatte, war im Commit nicht mehr zu sehen. Das
// Bündel hat eigene Wächter — check:runtime baut es über den echten CLI-Weg
// neu und vergleicht Byte für Byte, export.test.ts prüft das eingebettete
// Skript nach dem ASCII-Escaping auf gültiges JavaScript. Hier stünde es
// nur ein zweites Mal.

import { describe, expect, it } from 'vitest'
// Side-Effect-Import: registriert ALLE echten Bausteine.
import '../blocks/register'
import { referenzMaske } from '../test/referenzMaske'
import { exportMask } from './exportMask'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import { preflightMask } from './preflight'
import { escapeNonAsciiJs, guardScriptContent } from './serializer'
import { failedChecks, validateMaskHtml } from './validator'

// Das Runtime-Bündel aus dem Export-HTML herausschneiden. Der Schnitt ist
// EXAKT, keine Heuristik: entfernt wird genau der String, den exportMask
// einbettet — dieselbe Quelle (?raw), dieselben zwei Escape-Schritte. Steht
// er nicht GENAU EINMAL im HTML, schlägt der Test laut fehl: dann hat sich
// die Einbettung geändert, und dieser Schnitt muss mitziehen.
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
    // .snap-Endung: die Referenz ist ein per toMatchFileSnapshot gefuehrter
    // Abzug, keine Quelldatei.
    await expect(ohneBuendel(html)).toMatchFileSnapshot('./referenz/maske.html.snap')
    await expect(sevariablen).toMatchFileSnapshot('./referenz/maske.sevariablen.json.snap')
  })
})
