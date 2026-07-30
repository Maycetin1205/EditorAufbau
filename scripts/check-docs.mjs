// check-docs
// Doku-Waechter: prueft die DOKU gegen den echten Code.
// Die fuenf anderen Waechter bewachen Export und Laufzeit -- dieser hier
// bewacht ARCHI.md, weil in einem KI-gefuehrten Projekt die Doku das
// einzige Instrument des Menschen ist. Eine Doku, die luegt, ist
// schlechter als gar keine.
//
// Drei Pruefungen (bewusst nur drei -- Regel 10, nichts auf Verdacht):
//   1. Versionsnummer in ARCHI.md == package.json
//   2. Jedes in der Doku genannte npm-Script existiert wirklich
//   3. Die aktuelle Version steht in der Changelog-Tabelle
//      (Nutzer-Go 2026-07-30: die Tabelle war vier Versionen im
//      Rueckstand, weil Releases ohne den TRIP-3-Skill liefen -- genau
//      dieses stille Veralten faengt die Pruefung ab jetzt)
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

// --- 3. Changelog-Tabelle ---------------------------------------------
// Die Tabelle buendelt alle Versionen an einer Stelle. Ohne Waechter
// veraltet sie still, sobald ein Release am TRIP-3-Skill vorbei laeuft.
const tabelle = readFileSync('docs/2-changelog/changelog_table.md', 'utf8')
if (!tabelle.includes('`' + pkg.version + '`')) {
  fehler.push(
    `Changelog: docs/2-changelog/changelog_table.md kennt Version \`${pkg.version}\` nicht -- `
    + 'ohne Zeile dort veraltet die Tabelle still (am 2026-07-30 fehlten so vier Versionen)',
  )
}

// --- Ergebnis ---------------------------------------------------------
if (fehler.length === 0) {
  console.log('check-docs: ok (Version + Scripts + Changelog-Tabelle stimmen)')
  process.exit(0)
}

console.error('check-docs: FEHLER -- Doku und Code laufen auseinander\n')
for (const f of fehler) console.error('  - ' + f)
console.error('\nEntweder die Doku nachziehen oder den Code -- aber nicht stehen lassen.')
process.exit(1)
