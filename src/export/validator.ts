// validator
// Eingebaute Export-Prüfung (Kap. 3, Vorbild: behandlung-umbau/pruefung.mjs).
// JEDER Export läuft hier durch, BEVOR er SoftEngine sieht — schlägt ein
// Check fehl, wird keine Datei ausgegeben. Die Checks spiegeln die
// NO-TOUCH-Regeln aus SE-INVENTAR.md.

export const START_MARKER = '<!--SOFTENGINE-VAR!JWHtmlStart-->'
export const END_MARKER = '<!--SOFTENGINE-VAR!JWHtmlEnde-->'

export interface CheckResult {
  name: string
  ok: boolean
  detail: string
}

export function validateMaskHtml(html: string): CheckResult[] {
  const results: CheckResult[] = []
  const check = (name: string, ok: boolean, detail = '') => {
    results.push({ name, ok, detail })
  }

  // 1. Zeilenenden: LF-only
  const crlf = (html.match(/\r/g) ?? []).length
  check('LF-only', crlf === 0, crlf ? `${crlf} CR-Zeichen gefunden` : '')

  // 2. Marker erste / letzte (nicht-leere) Zeile
  const lines = html.split('\n')
  check('Start-Marker Zeile 1', lines[0] === START_MARKER, lines[0] ?? '(leer)')
  const lastNonEmpty = [...lines].reverse().find((l) => l.trim() !== '') ?? ''
  check('Ende-Marker letzte Zeile', lastNonEmpty === END_MARKER, lastNonEmpty)

  // 3. Nur ASCII (plus \n und \t)
  const badChar = /[^\n\t\x20-\x7E]/.exec(html)
  check(
    'ASCII-only',
    badChar === null,
    badChar ? `Zeichen U+${badChar[0].codePointAt(0)!.toString(16).toUpperCase()} an Position ${badChar.index}` : '',
  )

  // 4. Blockstruktur des Mini-Exports: genau 1 <style> + 1 <script>
  const styles = (html.match(/<style[\s>]/g) ?? []).length
  const scripts = (html.match(/<script[\s>]/g) ?? []).length
  check('genau 1 <style>', styles === 1, `gefunden: ${styles}`)
  check('genau 1 <script>', scripts === 1, `gefunden: ${scripts}`)

  // 5. Grundgerüst
  check('DOCTYPE vorhanden', html.includes('<!DOCTYPE html>'))
  check('Wurzel-Fluss vorhanden', html.includes('class="ff-root"'))
  check('Masken-Tokens eingebettet', html.includes('--se-accent:'))

  return results
}

export function failedChecks(results: CheckResult[]): CheckResult[] {
  return results.filter((r) => !r.ok)
}
