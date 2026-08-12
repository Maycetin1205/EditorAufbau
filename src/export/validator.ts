// validator
// Eingebaute Export-Prüfung.
// JEDER Export läuft hier durch, BEVOR er SoftEngine sieht — schlägt ein
// Check fehl, wird keine Datei ausgegeben. Die Checks spiegeln die
// NO-TOUCH-Regeln aus SE-INVENTAR.md.

export const START_MARKER = '<!--SOFTENGINE-VAR!JWHtmlStart-->'
export const END_MARKER = '<!--SOFTENGINE-VAR!JWHtmlEnde-->'

export interface CheckResult {
  name: string
  ok: boolean
  detail: string
  // WARNUNG statt Blockade (2026-08-06). Bis dahin hatte jeder Befund nur
  // einen Zustand: nicht ok = kein Export. Das passt fuer alles, was KAPUTT
  // ist (geloeschte Quelle, Bindung ins Leere) — aber nicht fuer einen
  // Zustand, den der Bauer ausdruecklich waehlen DARF. Erster Fall: eine
  // Status-Spalte ohne Zuordnung. Die ist freiwillig (Nutzer-Entscheidung
  // 2026-08-06), die Marke zeigt dann den Rohwert grau; sie zu blocken hiesse,
  // eine erlaubte Maske fuer unbaubar zu erklaeren. Sie zu VERSCHWEIGEN waere
  // aber genauso falsch (Regel 4) — also: gemeldet, nicht gestoppt.
  // Der Aufrufer trennt: blockend sind nur Befunde OHNE dieses Kennzeichen.
  warnung?: boolean
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

  // 4. Blockstruktur des Mini-Exports: genau 1 <style>, genau das offizielle
  // SoftEngine-Interface und genau 1 eigene Inline-Runtime. Das Interface
  // muss explizit mitreisen: BüroWARE injiziert es teils, WEBWARE nicht.
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
  // Ein formal vorhandener, aber leerer Inline-Skriptblock liess 2026-07-22
  // alle <ff-...>-Elemente unsichtbar. Die Komponenten-Registrierung ist ein
  // stabiler Marker des echten Runtime-Buendels; Globals allein reichen nicht.
  const inlineBody = /<script>\n([\s\S]*?)\n<\/script>/.exec(html)?.[1] ?? ''
  check(
    'Runtime-Buendel eingebettet',
    inlineBody.includes('customElements.define'),
    'Web-Component-Registrierung fehlt',
  )

  // 5. Grundgerüst
  check('DOCTYPE vorhanden', html.includes('<!DOCTYPE html>'))
  check('Wurzel-Fluss vorhanden', html.includes('class="ff-root"'))
  check('Masken-Tokens eingebettet', html.includes('--se-accent:'))

  return results
}

// Die BLOCKIERENDEN Befunde: nicht ok und keine blosse Warnung. Der Name
// bleibt, weil ihn viele Tests und beide Aufrufer benutzen — die Bedeutung ist
// unveraendert „was den Export verhindert".
export function failedChecks(results: CheckResult[]): CheckResult[] {
  return results.filter((r) => !r.ok && r.warnung !== true)
}

// Ein Gegenstueck `warnChecks` gab es hier bis U3 (2026-08-12). Seit der
// Preflight nicht mehr blockt (Regel 4, Nutzer-Ansage 2026-08-10) hatte es
// keinen Aufrufer mehr ausser einem Test, der sich selbst pruefte. Wer die
// Warnungen wieder braucht, filtert `r.warnung === true` — das ist eine Zeile,
// keine Funktion auf Vorrat (Regel 10). Warn-ANZEIGEN sind ohnehin gestrichen.
