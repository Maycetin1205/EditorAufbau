---
name: TRIP-test
description: Write/run tests following project standards (deep test authoring)
disable-model-invocation: true
argument-hint: "component or feature to test"
---

# Testing Mode

You are now in **testing mode** for **Aufbau-Editor (EditorAufbau)**.

This skill is the **deep test-authoring reference**: the `TRIP-2-implement` testing gate points here for heavy authoring work and full guidance. Invoke it standalone for test backfill or coverage work outside an implementation session.

## Prerequisites - Read First

Before testing, you MUST read:

1. @docs/ARCHI.md - Understand system architecture
2. @docs/4-unit-tests/TESTING.md - Testing guidelines

## Your Task

Test: $ARGUMENTS

---

## Testing Guidelines

### Scope

- Only run tests for relevant files that changed (not the whole project)
- Focus on the new feature/fix/refactor

### Commands

```bash
# Alle Unit-/Snapshot-Tests (Vitest — enthält die Wächter)
npm test

# Einzelne Testdatei
npx vitest run src/export/export.test.ts

# e2e (Playwright, echter Browser)
npx playwright test
npx playwright test e2e/kanban-data.spec.ts

# Coverage: NICHT eingerichtet (kein @vitest/coverage-Paket) — nur nach Absprache nachrüsten
```

### Test Structure

- Unit-/Snapshot-Tests liegen NEBEN der Quelle: `*.test.ts` (z. B. `src/export/export.test.ts`, `src/blocks/shared/seAktionen.test.ts`, `src/core/data/aktionen.test.ts`)
- e2e-Kreisläufe: `e2e/*.spec.ts` (Playwright, echter Browser — `fill()` feuert kein natives `change`, deshalb wird ECHT getippt)
- Fünf Wächter (Nutzer-Entscheidung, nicht ohne Absprache aufblähen): export.test · seRuntime.test · persistence.test · e2e kanban-data · Export-Referenzabzug (`src/export/referenzabzug.test.ts` gegen `src/export/referenz/`)

### Testing Priorities

**Unit Tests (Vitest)**:

- Aktionsmodell + Ketten-Laufzeit (aktionen.test, seAktionen.test)
- Export-Formen (HTML + SEvariablen je Quellen-Art) und Preflight-Blocker mit Klartext
- Persistenz/Migrationen (alte Speicherstände laden verlustfrei; Notfallkopie BACKUP_KEY)
- SoftEngine-Schicht (Präfix-Schlüssel-Scan, PARAMS-Form, serielle GET-Warteschlange)

**e2e (Playwright)**:

- EIN Kreislauf-Test je Export-/Laufzeit-Paket (Test-Bremse!) — Muster: `e2e/speichern-data.spec.ts`
- KEINE neuen e2e für reine Editor-Bedienpakete (vorhandene Specs decken die Bedienung mit ab)

**What to Test**:

- SE-Kontrakte exakt (ASCII/LF-Escaping, relId OHNE `IDB`-Präfix, sechs PARAMS-Strings)
- LEER-Regel (Stellen ohne Inhalt verschwinden in der Maske restlos, bleiben im Editor Klick-Ziele)
- Grenzfälle: leere Quelle, fehlender Daten-Push, alte Speicherstände, unlesbarer Speicherstand

---

## Hard-to-Test Code

Seam ladder, cheapest first: **exported pure helper → injectable client/adapter → module mock → integration/emulator test**. Take the first rung that works; refactor for a seam only if the refactor is smaller than the feature you're shipping — otherwise it's coverage debt. Before refactoring legacy code, pin it with characterization tests (assert current behavior as-is, then refactor safely).

Uncovered risky paths: one line each in `docs/4-unit-tests/COVERAGE-DEBT.md` (`path | why hard | escape plan`). Delete a ledger line in the same change that gives its path meaningful coverage.

---

## Post-Testing Summary

After completing tests, create a summary file:

**File**: `docs/4-unit-tests/wa_vx.y.z_test.md`
(a = project week, x.y.z = version)

**Content**:

```markdown
# Test Summary - Week a, V. x.y.z

## What Was Tested

[List of tested components/functions]

## Test Results

- Total tests: X
- Passed: X
- Failed: X
- Coverage: X%

## Key Findings

[Any issues discovered, edge cases found, etc.]

## Notes

[Additional context or recommendations]
```
