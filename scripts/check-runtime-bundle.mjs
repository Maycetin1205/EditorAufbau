// Bündel-Wächter (Nutzer-Entscheidung 2026-07-20, Option A): prüft, ob das
// eingecheckte src/export/generated/ff-runtime.js ein frischer Build der
// aktuellen Laufzeit-Quelle ist. Fängt BELIEBIGE Bündel-Drift (jemand hat eine
// Web-Component / die SoftEngine-Schicht geändert, aber `npm run build:runtime`
// vergessen → die exportierte Maske verhielte sich anders als der Editor,
// WYSIWYG-Bruch, Regel 1) — schärfer als der Marker-Wächter in
// src/export/export.test.ts, der nur bekannte Tags/Marker prüft.
//
// BEWUSST KEIN vitest-Test, sondern ein eigener Prüfbündel-Schritt (empirisch
// erarbeitet 2026-07-20):
//   1. Nur der echte CLI-Build in den STANDARD-outDir (src/export/generated)
//      reproduziert das Bündel byte-genau. Ein Build in ein anderes Verzeichnis
//      ODER unter vitests NODE_ENV=test kippt Lit in seinen Dev-Zweig →
//      Fehlalarm. Darum: der echte vite-Build in place, NODE_ENV bereinigt.
//   2. In-Place-Bauen WÄHREND vitest liefe, würde die von export.test.ts per
//      ?raw gelesene Datei mitten im Lauf umschreiben (Race → Flake). Als
//      eigener, sequenzieller Schritt (tsc → eslint → check:runtime → vitest →
//      playwright) ist es rennfrei.
// Selbstheilend: bei echter Abweichung bleibt das frisch gebaute Bündel liegen
// — den Diff ansehen und bewusst mitcommitten.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const bundle = 'src/export/generated/ff-runtime.js'

// Ausgangsstand der Working-Copy exakt als Bytes sichern. Grundlage für
// Vergleich UND Wiederherstellung — kein git checkout (das käme aus dem Index
// und wäre inkonsistent zum Vergleich; Codex-Review 2026-07-20).
const vorher = readFileSync(bundle)

// NODE_ENV bereinigen: das committed Bündel entsteht ohne gesetztes NODE_ENV;
// ein von außen gesetztes test/production würde einen anderen (Dev-)Build
// erzeugen und Fehlalarm auslösen.
const env = { ...process.env }
delete env.NODE_ENV

// Direkt node → vite-Binärdatei (== `npm run build:runtime`; kein .cmd → kein
// EINVAL unter Node 25, kein shell:true nötig). Fehlschlag abfangen: mit
// emptyOutDir:true (vite.runtime.config.ts) könnte ein Build-Fehler das
// eingecheckte Bündel löschen/verkürzen — dann Ausgangsstand zurück und klar
// melden (Codex-Review 2026-07-20).
try {
  execFileSync(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'build', '--config', 'vite.runtime.config.ts'],
    { stdio: 'inherit', env },
  )
} catch {
  writeFileSync(bundle, vorher)
  console.error(
    `\nBündel-Wächter: der Runtime-Build ist fehlgeschlagen (siehe oben). `
    + `Eingecheckter Stand von ${bundle} wiederhergestellt — erst den Build reparieren.`,
  )
  process.exit(1)
}

// Nur CRLF→LF + EINE abschließende Newline normalisieren (NICHT trimEnd — das
// würde echte Drift in abschließenden Leerzeichen/Leerzeilen maskieren;
// Codex-Review 2026-07-20). Damit zählt nur echter Inhalt, ohne Windows-
// Zeilenenden-Fehlalarm.
const norm = (s) => s.replace(/\r\n/g, '\n').replace(/\n$/, '')
const frisch = readFileSync(bundle, 'utf8')

if (norm(frisch) === norm(vorher.toString('utf8'))) {
  // Inhalt identisch: exakten Ausgangsstand zurückschreiben, damit keine reine
  // Zeilenenden-Normalisierung (autocrlf) als "modified" hängen bleibt.
  writeFileSync(bundle, vorher)
  console.log(`\nBündel aktuell: ${bundle} == frischer Build.`)
} else {
  // Selbstheilend: frisch gebautes Bündel liegen lassen.
  console.error(
    `\nBündel war veraltet — soeben frisch gebaut, liegt jetzt in ${bundle}. `
    + `Den Diff ansehen und bewusst mitcommitten (die Laufzeit-Quelle hat sich `
    + `geändert, das eingecheckte Bündel hinkte hinterher).`,
  )
  process.exit(1)
}
