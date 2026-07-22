# Code Review: „Feld übernehmen" V2 (Auslöser am Parameter) + sprechende Namen + Kleinputz

**Review Date**: 2026-07-22
**Version**: 0.1.0
**Files Reviewed**:
- `src/editor/zentrale/feldUebernahme.ts` (neu) — Erkennung + POS-/IDBID-Übernahme
- `src/editor/zentrale/FeldUebernahmePicker.tsx` (neu) — zweistufiger Portal-Picker
- `src/editor/zentrale/StepForm.tsx` — Auslöser an den Parameterzeilen, Bestätigung
- `src/editor/zentrale/feldUebernahme.test.ts` (neu) — beide Schreibweisen + echte Nutzer-Syntax
- `src/editor/zentrale/helfer.ts` + `helfer.test.ts` — sprechende Namen; `VERB_LABELS` entfernt
- `src/editor/inspector/Inspector.tsx` — Eigenname im Kopf
- `src/core/blocks/blockRegistry.ts`, `src/core/data/relations.ts` — tote Exporte
- `src/blocks/kanban/KanbanSpalteBlock.ts`, `src/blocks/shared/statusVariant.ts`, `src/design/masken-tokens.css` — `dashboard/`-Kommentare
- `src/blocks/kanban/seRuntime.test.ts` — Testname; `src/ui/molecules/panel.tsx` (gelöscht)
- `docs/logo-rohsatz.png`, `docs/avatare-rohsatz.png` (per `git rm` entfernt)

**Plan**: `docs/1-plans/feld-uebernehmen.plan.md`

---

## Executive Summary

„Feld übernehmen" am Schreib-Schritt: der Auslöser sitzt jetzt direkt an der Parameter-Zeile und erkennt die echte Nutzer-Syntax (nackte Wörter `POS`/`LEN`/`IDBID`) genauso wie die Klammer-Form; ein zweistufiger Picker füllt Position/Länge bzw. Tabelle. Dazu sprechende Namen (Phase 2) und ein huckepack-Kleinputz (tote Exporte/Kommentare/Bilder). Implementiert von Codex (`gpt-5.6-luna`), Diff für Diff von Claude gegengeprüft (Regel 8). Verdict: **APPROVED with observations**.

---

## Changes Overview

V2 verlagert Erkennung + Auslöser vom Sammel-Link (V1) an die einzelne Parameter-Zeile: `feldUebernahmeArt` erkennt einen Ganz-String mit/ohne `{}`, case-insensitiv; der POS-Auslöser (nur wenn POS UND LEN erkannt sind) füllt Position+Länge, der IDBID-Auslöser die Tabelle. Der neue `FeldUebernahmePicker` ist portaliert, zweistufig (Quelle → Feld) und klemmt sich ins Sichtfenster ein. Der Kleinputz entfernt vier tote Exporte + eine Datei, entschärft drei `dashboard/`-Kommentare, neutralisiert einen Testnamen und löscht zwei Roh-Bilder. Export/Runtime bleiben byte-gleich (`check:runtime` „identisch").

---

## Findings

### Critical Issues

None.

### Major Issues

None.

### Minor Issues

- **Picker lief aus dem Sichtfenster** (`FeldUebernahmePicker.tsx`) — im rechts angedockten, schmalen Inspector öffnete das `w-64`-Fenster an der Knopf-Position und ragte rechts (auf Laptop-Breite deutlich) über den Bildschirmrand; halb unlesbar. **Disposition: addressed** — Viewport-Einklemmung per `useLayoutEffect` + `ResizeObserver` (misst, klemmt an 8-px-Rand, deckt Stufenwechsel/Suche mit ab) + `max-w`-Deckel. Vom Nutzer live bestätigt.

### Suggestions

- Die Parameter-Zeile bleibt im 340-px-Panel eng (Label | Quelle | Wert + Auslöser-Symbol nebeneinander). Bei Bedarf Symbol ins Wert-Feld integrieren statt daneben (Preisschild: ~1 h, Editor-UI, kein Export). Nur mit Nutzer-„go" — die Einzeiler-Optik ist 2021 abgenommen.

---

## Checklist

- [x] 1. Functional Requirements — passed (erkennt beide Schreibweisen inkl. echter Nutzer-Syntax; POS/LEN und IDBID getrennt; Wert/Satz-Nummer bleiben beim Bediener)
- [x] 2. Code Quality — passed (reine Funktionen, DRY, bestehende Muster; keine verwaisten Referenzen nach den Löschungen)
- [x] 3. Architectural Compliance — passed (editor-only, nicht im Runtime-Bündel)
- [x] 4. Projekt-Regeln (Aufbau-Editor) — passed (Regel 2 Registry-Daten, Regel 3 Technikwert ≠ Anzeige, Escape-Schichtung window-capture)
- [x] 5. Export & SoftEngine-Laufzeit — passed (`check:runtime` „identisch", Referenzabzug byte-gleich, kein SE-Echttest nötig)
- [x] 6. Error Handling — passed (ungültiger Feldcode → Bindungen unverändert; keine stillen Fehlpfade)
- [x] 7. Security — not applicable (reine Editor-UI)
- [x] 8. Performance — passed (Editor-seitige Listen, kein Laufzeit-/Export-Pfad berührt)

---

## Verdict

**APPROVED with observations**

Kein separater Codex-Code-Review-Lauf (der Nutzer wollte „fertig machen, kein Ausufern"); die Zweitprüfung erfolgte als Claude-Diff-Gegencheck (Regel 8) plus 2× grünes Prüfbündel (tsc · eslint · `check:runtime` „identisch" · 115 vitest · 11 e2e) und Live-Abnahme des Picker-Fixes durch den Nutzer. Import-Zyklen (Kleinputz #5) waren bereits vollständig `import type` — nichts zu ändern. Bewusst offen (kein Blocker): „Feld übernehmen" für Stammtabellen wartet auf einen belegten Stamm-PUT-Kontrakt; die enge Einzeiler-Parameterzeile ist ein optionaler Folgeschliff.
