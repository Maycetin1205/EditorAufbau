// check-docs
// Doku-Waechter: prueft die DOKU gegen den echten Code.
// Die fuenf anderen Waechter bewachen Export und Laufzeit -- dieser hier
// bewacht ARCHI.md, weil in einem KI-gefuehrten Projekt die Doku das
// einzige Instrument des Menschen ist. Eine Doku, die luegt, ist
// schlechter als gar keine.
//
// Zwei Pruefungen (bewusst nur zwei -- Regel 10, nichts auf Verdacht):
//   1. Versionsnummer in ARCHI.md == package.json
//   2. Jedes in der Doku genannte npm-Script existiert wirklich
//
// Aufruf: node scripts/check-docs.mjs

import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const archi = readFileSync('docs/ARCHI.md', 'utf8')

const fehler = []

// --- 1. Version -------------------------------------------------------
// ARCHI.md Abschnitt 2 nennt die Version in Backticks, z. B. (`0.1.0`).
const versionen = [...archi.matchAll(/`(\d+\.\d+\.\d+)`/g)].map((m) => m[1])
for (const v of new Set(versionen)) {
  if (v !== pkg.version) {
    fehler.push(`Version: ARCHI.md nennt \`${v}\`, package.json sagt \`${pkg.version}\``)
  }
}

// --- 2. npm-Scripts ---------------------------------------------------
// Alles, was in der Doku als `npm run X` steht, muss es auch geben.
const genannt = new Set([...archi.matchAll(/npm run ([a-z][\w:-]*)/g)].map((m) => m[1]))
const vorhanden = new Set(Object.keys(pkg.scripts ?? {}))
for (const s of [...genannt].sort()) {
  if (!vorhanden.has(s)) {
    fehler.push(`Script: ARCHI.md nennt \`npm run ${s}\`, package.json hat es nicht`)
  }
}

// --- Ergebnis ---------------------------------------------------------
if (fehler.length === 0) {
  console.log('check-docs: ok (Version + Scripts stimmen)')
  process.exit(0)
}

console.error('check-docs: FEHLER -- Doku und Code laufen auseinander\n')
for (const f of fehler) console.error('  - ' + f)
console.error('\nEntweder die Doku nachziehen oder den Code -- aber nicht stehen lassen.')
process.exit(1)
