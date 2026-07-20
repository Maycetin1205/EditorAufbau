# TypeScript strict einschalten — Plan + Protokoll

## Overview

`"strict": true` in beiden Projekt-Configs (`tsconfig.app.json`,
`tsconfig.node.json`) aktivieren. Damit gelten alle strict-Prüfungen
(noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply,
strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables,
alwaysStrict) dauerhaft.

## Befund (gemessen 2026-07-20)

Der Code ist **bereits strict-sauber**: `npx tsc -b --force` mit `strict: true`
meldet **0 Fehler**. Gegenprobe belegt, dass strict danach wirklich greift
(ein eingebauter `strictNullChecks`-Verstoß → TS2322). Kein Code muss
angepasst werden — reiner Schalter.

## Files

1. `tsconfig.app.json` — `"strict": true` ergänzt.
2. `tsconfig.node.json` — `"strict": true` ergänzt.
3. `docs/1-plans/typescript-strict.plan.md` (dieser Plan).

Kein Produktcode, kein Emit (noEmit), Export/Maske unberührt → Referenzabzug
grün ohne Erneuerung, kein SE-Echttest.

## Beweis

Prüfbündel grün: tsc -b (strict, 0 Fehler) + eslint + check:runtime + vitest
(inkl. Referenzabzug) + playwright.

## Codex-Zweitmeinung

Übersprungen — Codex-Nutzungslimit erreicht (bis 25.07.). Bei einem reinen,
0-Fehler-Schalter mit grünem Prüfbündel + Gegenprobe vertretbar; im
Abschlussbericht geflaggt.
