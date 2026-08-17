export const START_MARKER = '<!--SOFTENGINE-VAR!JWHtmlStart-->'
export const END_MARKER = '<!--SOFTENGINE-VAR!JWHtmlEnde-->'

export interface CheckResult {
  name: string
  ok: boolean
  detail: string

  warnung?: boolean
}

export function validateMaskHtml(html: string): CheckResult[] {
  const results: CheckResult[] = []
  const check = (name: string, ok: boolean, detail = '') => {
    results.push({ name, ok, detail })
  }

  const crlf = (html.match(/\r/g) ?? []).length
  check('LF-only', crlf === 0, crlf ? `${crlf} CR-Zeichen gefunden` : '')

  const lines = html.split('\n')
  check('Start-Marker Zeile 1', lines[0] === START_MARKER, lines[0] ?? '(leer)')
  const lastNonEmpty = [...lines].reverse().find((l) => l.trim() !== '') ?? ''
  check('Ende-Marker letzte Zeile', lastNonEmpty === END_MARKER, lastNonEmpty)

  const badChar = /[^\n\t\x20-\x7E]/.exec(html)
  check(
    'ASCII-only',
    badChar === null,
    badChar ? `Zeichen U+${badChar[0].codePointAt(0)!.toString(16).toUpperCase()} an Position ${badChar.index}` : '',
  )

  const styles = (html.match(/<style[\s>]/g) ?? []).length
  const scripts = (html.match(/<script[\s>]/g) ?? []).length
  const interfaceScripts = (html.match(
    /<script src="<!--SOFTENGINE-VAR!EditorPfad-->\/JS\/JS\/basis\.html\.interface\.js"><\/script>/g,
  ) ?? []).length
  const inlineScripts = (html.match(/<script>/g) ?? []).length
  check('genau 1 <style>', styles === 1, `gefunden: ${styles}`)
  check('genau 2 <script>', scripts === 2, `gefunden: ${scripts}`)
  check('SoftEngine-Interface vorhanden', interfaceScripts === 1, `gefunden: ${interfaceScripts}`)
  check('genau 1 eigene Runtime', inlineScripts === 1, `gefunden: ${inlineScripts}`)

  const inlineBody = /<script>\n([\s\S]*?)\n<\/script>/.exec(html)?.[1] ?? ''
  check(
    'Runtime-Buendel eingebettet',
    inlineBody.includes('customElements.define'),
    'Web-Component-Registrierung fehlt',
  )

  check('DOCTYPE vorhanden', html.includes('<!DOCTYPE html>'))
  check('Wurzel-Fluss vorhanden', html.includes('class="ff-root"'))
  check('Masken-Tokens eingebettet', html.includes('--se-accent:'))

  return results
}

export function failedChecks(results: CheckResult[]): CheckResult[] {
  return results.filter((r) => !r.ok && r.warnung !== true)
}

