const ANZEIGE_MS = 8000

let balken: HTMLElement | null = null
let ausblenden: ReturnType<typeof setTimeout> | null = null

function baueBalken(): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('data-ff-meldung', '')
  el.setAttribute('role', 'alert')
  el.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:2147483647',
    'padding:7px 12px',
    'background:var(--se-red-soft,#fbe7e6)',
    'color:var(--se-red,#c0201a)',
    'border-bottom:1px solid var(--se-red,#c0201a)',
    'font:500 12px/1.4 system-ui,sans-serif',
    'cursor:pointer',
  ].join(';')
  el.title = 'Klicken zum Schließen'
  el.addEventListener('click', schliesse)
  return el
}

function schliesse(): void {
  if (ausblenden) { clearTimeout(ausblenden); ausblenden = null }
  balken?.remove()
  balken = null
}

export function meldeFehler(text: string): void {
  if (typeof document === 'undefined' || !document.body) return
  if (!balken) {
    balken = baueBalken()
    document.body.appendChild(balken)
  }
  balken.textContent = text
  if (ausblenden) clearTimeout(ausblenden)
  ausblenden = setTimeout(schliesse, ANZEIGE_MS)
}
