// serializer
// Die EINE Stelle für die Zeichen-Regeln des Exports (Aufräumen A6 —
// wörtlich aus exportMask.ts gezogen). Hier ist festgelegt, WIE Text in
// die SoftEngine-Maske serialisiert wird:
//   - ASCII-Regel: Nicht-ASCII wird maschinell escaped — Umlaute als
//     &#x…; im HTML, \uXXXX in JS/JSON (SE-INVENTAR, LF-only + ASCII
//     prüft der Validator nach).
//   - Skript-Schutz: '</script>' im eingebetteten Bündel würde den
//     Skriptblock sprengen.
//   - CSS: Kommentare raus (enthalten Umlaute/Gedankenstriche), Werte
//     selbst sind ASCII.
// Der Exporter (exportMask) baut Markup/Reihenfolge und benutzt für jedes
// Zeichen diese Helfer — nirgendwo sonst wird escaped.

function escapeNonAsciiHtml(s: string): string {
  // Array.from laeuft ueber CODEPOINTS — Surrogatpaare (Emoji) bleiben ganz.
  // Das fruehere Regex ohne u-Flag zerlegte sie in Haelften und erzeugte
  // ungueltige Referenzen (&#xD83D;&#xDE00; statt &#x1F600;), aus denen der
  // Browser Ersatzzeichen macht. Fuer ASCII/Umlaute ist die Ausgabe
  // byte-identisch zu vorher (je ein BMP-Zeichen pro Durchlauf) — der
  // Referenzabzug bleibt gruen.
  return Array.from(s)
    .map((c) => (/^[\n\t\x20-\x7E]$/.test(c) ? c : `&#x${c.codePointAt(0)!.toString(16).toUpperCase()};`))
    .join('')
}

export function escapeHtmlText(s: string): string {
  return escapeNonAsciiHtml(
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  )
}

export function escapeHtmlAttr(s: string): string {
  return escapeHtmlText(s).replace(/"/g, '&quot;')
}

export function escapeNonAsciiJs(s: string): string {
  // Nicht-ASCII in JS-Bündeln steht praktisch nur in String-Literalen —
  // \uXXXX ist dort immer gültig. Ein Test kompiliert das Ergebnis zur
  // Sicherheit (export.test.ts).
  return s.replace(/[^\n\t\x20-\x7E]/g, (c) => {
    const code = c.charCodeAt(0)
    return '\\u' + code.toString(16).toUpperCase().padStart(4, '0')
  })
}

// '</script>' im eingebetteten Bündel würde den Skriptblock sprengen.
export function guardScriptContent(js: string): string {
  return js.replace(/<\/script/gi, '<\\/script')
}

// CSS: Kommentare raus (enthalten Umlaute/Gedankenstriche), dann ASCII-Check
// durch den Validator. Werte selbst sind ASCII.
export function stripCssComments(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l, i, arr) => l !== '' || (arr[i - 1] ?? '') !== '')
    .join('\n')
    .trim()
}
