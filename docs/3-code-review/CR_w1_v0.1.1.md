# Code Review: StepForm-Feinschliff (Parameterzeilen + Relations-Liste)

**Review Date**: 2026-07-22
**Version**: 0.1.1
**Files Reviewed**:
- `src/editor/zentrale/StepForm.tsx` — Quelle-Box `w-32`→`w-24`, Label `w-16`→`w-14`, Container-Gaps enger; Relations-Liste mit `divide-y`-Trennlinien statt `py-1`

**Plan**: kein Plan — ungeplanter UI-Fix auf Nutzer-Fund („passt nicht ins Fenster / 1995-Look")

---

## Executive Summary

Reiner Editor-UI-Feinschliff am Schritt-Formular: die Quelle-Auswahl belegt keine überbreite feste Box mehr, die Parameterzeile passt sicher in die 340-px-Spalte, und die Relations-Einträge sind mit feinen Trennlinien getrennt. Kein Logik-/Modell-/Export-Eingriff. Verdict: **APPROVED with observations**.

---

## Changes Overview

Nur CSS-Klassen in `StepForm.tsx`: `BindingRow` (Container-Gap `1.5`→`1`, Label `w-16`→`w-14`, Quelle-Select `w-32`→`w-24`) und die Relations-Liste (`divide-y divide-border` statt `py-1`). Keine DOM-Struktur-, aria- oder Verhaltensänderung — die e2e-Wächter zielen unverändert und bleiben grün.

---

## Findings

### Critical Issues
None.

### Major Issues
None.

### Minor Issues
None.

### Suggestions
- Der „1995-Look" ist entschärft, aber nicht restlos: die native `<select>`-Aufklappliste bleibt OS-Chrome. Falls störend, späterer Wechsel auf das bereits vorhandene radix-basierte `SelectControl` (Preis: mittel, Editor-UI, Keyboard-/Portal-Verhalten + Enter-Auslöser-Interaktion prüfen). Nur mit go.

---

## Checklist

- [x] 1. Functional Requirements — passed (Verhalten unverändert, nur Layout)
- [x] 2. Code Quality — passed
- [x] 3. Architectural Compliance — passed (editor-only)
- [x] 4. Projekt-Regeln (Aufbau-Editor) — passed (feine Trennlinien wie R2/R3)
- [x] 5. Export & SoftEngine-Laufzeit — passed (`check:runtime` „identisch")
- [x] 6. Error Handling — not applicable
- [x] 7. Security — not applicable
- [x] 8. Performance — passed

---

## Verdict

**APPROVED with observations**

Trivialer UI-Feinschliff, vom Nutzer freigegeben (commit); Prüfbündel grün (tsc · eslint · check:runtime „identisch" · 115 vitest · 11 e2e). Kein separater Codex-Review (Umfang trivial). Offen als Vorschlag: native Select-Aufklappliste später auf radix umstellen.
