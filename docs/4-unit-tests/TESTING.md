# Testing Guidelines — Aufbau-Editor

## Test-Frameworks

- **Vitest 4** — Unit-/Snapshot-Tests, liegen NEBEN der Quelle (`src/**/name.test.ts`)
- **Playwright** — e2e-Kreisläufe im echten Browser (`e2e/*.spec.ts`)

## Befehle

```bash
npm test                                    # alle Vitest-Tests (inkl. Wächter)
npx vitest run src/export/export.test.ts    # einzelne Datei
npx vitest run -u                           # Referenz/Snapshots ABSICHTLICH erneuern (Diff im Commit sichtbar!)
npx playwright test                         # alle e2e
npx playwright test e2e/kanban-data.spec.ts # einzelner e2e
```

**Prüfbündel (Regel 9) — EINMAL gebündelt vor dem Commit, nie zwischendurch:**
`npx tsc -b` + `npx eslint src` + `npm test` + `npx playwright test`

## Aufbau & Konventionen

- e2e-Tests fahren den ECHTEN Browser und tippen echt — `fill()` feuert kein
  natives `change`; `change` ist nicht composed und stirbt an der
  Schattengrenze (gelernter Kontrakt, s. CLAUDE.md Schritt 4).
- **Fünf Wächter** (Nutzer-Entscheidung, nicht ohne Absprache aufblähen):
  export.test · seRuntime.test · persistence.test · e2e kanban-data ·
  Export-Referenzabzug (`src/export/referenzabzug.test.ts` gegen `src/export/referenz/`).

## Test-Bremse (Nutzer-Entscheidung 2026-07-17)

Neue Browser-Tests NUR, wenn ein Paket Export/Laufzeit berührt — dann EIN
schlanker Kreislauf-Test statt vieler Einzeltests (Muster:
`e2e/speichern-data.spec.ts`). Reine Editor-Bedienpakete bekommen KEINE
neuen e2e.

## Export berührt?

- Referenzabzug muss grün bleiben; ABSICHTLICHE Export-Änderung → Referenz
  mit `npx vitest run -u` erneuern (der Datei-Diff macht die Maskenänderung
  im Commit sichtbar).
- Masken-Laufzeit geändert → `npm run build:runtime` (Veralten-Wächter im
  export.test schlägt sonst an).
- Zusätzlich **SE-Echttest durch den Nutzer** in echter SoftEngine-Umgebung
  (wird auf Nutzer-Wunsch gebündelt, nie einzeln nachfassen).

## Coverage

NICHT eingerichtet (kein @vitest/coverage-Paket, keine Schwellen) — nur nach
Absprache nachrüsten. Schwer testbarer Code: Einzeiler in
`docs/4-unit-tests/COVERAGE-DEBT.md` (`Pfad | warum schwer | Ausweg`);
kritisches Verhalten (Persistenz, Schreiben nach SoftEngine) behält immer
mindestens einen Verhaltens-Test.
