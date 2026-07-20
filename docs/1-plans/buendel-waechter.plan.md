# Bündel-Wächter — Plan + Umsetzungsprotokoll

## Overview

Ein Wächter, der sicherstellt, dass das eingecheckte
`src/export/generated/ff-runtime.js` ein **frischer Build der aktuellen
Laufzeit-Quelle** ist. Weicht es ab → rot mit Klartext „Bündel veraltet".
Fängt BELIEBIGE Bündel-Drift, nicht nur die bekannten Marker des vorhandenen
Wächters in `src/export/export.test.ts` (der bleibt als billiger Sanity-Check).

## Problem Statement

Ändert jemand eine Web-Component / die SoftEngine-Schicht und vergisst
`npm run build:runtime`, ist das eingecheckte Bündel veraltet und die
exportierte Maske verhält sich anders als der Editor (WYSIWYG-Bruch, Regel 1)
— ohne dass ein Test rot wird. Der Marker-Wächter prüft nur bekannte Tags/
Marker, keine beliebige Drift.

## Entscheidung (Nutzer, 2026-07-20): Option A — npm-Skript statt vitest-Test

Die Planungs-Nagelprobe (Codex-Plan-Review + empirische Messung) hat die
ursprüngliche Idee „vitest-Test baut in-memory neu, Byte-Vergleich" WIDERLEGT:

1. **Nur der echte CLI-Build in den STANDARD-outDir reproduziert byte-genau.**
   Build in ein anderes Verzeichnis ODER `build({write:false})` ODER unter
   vitests `NODE_ENV=test` kippt Lit in seinen Dev-Zweig (zusätzliches
   `var e=!1…`) → Fehlalarm. Belegt am 2026-07-20 durch eine Bau-Matrix.
2. **In-Place-Bauen während vitest liefe = Race-Falle:** `export.test.ts` liest
   dieselbe `ff-runtime.js` per `?raw`; ein Wächter, der die Datei mitten im
   Lauf umschreibt, macht andere Tests flaky.

Deshalb: eigener, sequenzieller Prüfbündel-Schritt `npm run check:runtime`
(`scripts/check-runtime-bundle.mjs`), NICHT im vitest-Graph.

## Umsetzung (gebaut + verifiziert)

`scripts/check-runtime-bundle.mjs`:

- baut über `node node_modules/vite/bin/vite.js build --config
  vite.runtime.config.ts` (== `npm run build:runtime`, kein `.cmd`-Aufruf →
  kein EINVAL unter Node 25) **in place**, mit **bereinigtem `NODE_ENV`** (so
  wie das committed Bündel entsteht);
- vergleicht den frischen Build inhaltlich (LF-normalisiert) gegen den
  kanonischen HEAD-Blob (`git show HEAD:…`) — umgeht die autocrlf-Zeilenenden-
  Quirks von `git diff` unter Windows;
- **grün:** setzt die Working-Copy zurück (kein eol-Rauschen), meldet „Bündel
  aktuell", exit 0;
- **rot:** lässt das frisch gebaute Bündel liegen (selbstheilend), meldet
  „Bündel war veraltet — Diff ansehen und bewusst mitcommitten", exit 1.

Prüfbündel-Reihenfolge NEU: `tsc → eslint → check:runtime → vitest →
playwright` (check VOR vitest, damit nichts die `?raw`-Leser stört).

## Files

1. `scripts/check-runtime-bundle.mjs` (neu) — der Wächter.
2. `package.json` — Skript `check:runtime`.
3. `CLAUDE.md` — Regel 9 (Prüfbündel-Reihenfolge + sechster Wächter,
   Nutzer-genehmigt 2026-07-20).
4. `docs/ARCHI.md` §9, `docs/4-unit-tests/TESTING.md` — Prüfbündel + Wächter.
5. `.claude/skills/TRIP-2-implement`, `TRIP-3-release` — Gate-Befehle.
6. `docs/1-plans/buendel-waechter.plan.md` (dieser Plan).

Kein Produktcode, Export/Maske Byte-identisch → kein SE-Echttest, Referenzabzug
bleibt grün ohne Erneuerung.

## Verifikation (belegt 2026-07-20)

- GRÜN: `npm run check:runtime` → exit 0, „Bündel aktuell", Baum sauber.
- GEGENPROBE: eine Zeile in `src/export/runtime-entry.ts` → exit 1, „Bündel war
  veraltet…"; nach `git checkout` wieder sauber.
- Codex-Plan-Review (GPT 5.6 Sol): 1 Runde, 3 Findings adressiert.

## Aufgefallen unterwegs (für den Abschlussbericht)

Der Runtime-Build ist gegenüber Output-Lage UND `NODE_ENV` empfindlich (Lit
Dev/Prod-Export-Condition): nur `build:runtime` in den Standard-outDir mit
leerem `NODE_ENV` erzeugt das committed Bündel. Latente Fragilität — ein
Härten des Builds (z. B. `mode`/Conditions fest verdrahten) wäre ein eigenes
kleines Paket.
