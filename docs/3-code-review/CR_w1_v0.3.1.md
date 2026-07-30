# Code Review: Aufraeumen nach v0.3.0 (Verknuepfungs-Bibliothek raus, Referenzabzug entrauscht, Inspector-Auswahlfelder)

**Review Date**: 2026-07-30
**Version**: 0.3.1
**Files Reviewed**:
- src/editor/zentrale/Kommandozentrale.tsx (+ geloescht: VerknuepfungBereich.tsx)
- src/state/maskenDatei.ts + maskenDatei.test.ts (+ geloescht: SourceLinkStore.ts, useSourceLinks.ts)
- src/core/data/sourceLinks.ts + sourceLinks.test.ts
- src/editor/shell/Toolbar.tsx
- src/export/referenzabzug.test.ts + src/export/referenz/maske.html.snap
- src/editor/inspector/QuellenListe.tsx · src/ui/atoms/schritt-select.tsx (Umzug aus zentrale/) · StepForm.tsx · ParameterZeile.tsx
- docs/ARCHI.md · docs/FAHRPLAN.md · docs/2-changelog/w1_v0.3.1.md · package.json

**Plan**: kein Plan-Dokument — unplanned change; Auftrag = die drei Aufraeum-Punkte
aus dem v0.3.0-Abschlussbericht (Nutzer-Prompt), Soll-Beschreibung in
docs/2-changelog/w1_v0.3.1.md.

---

## Executive Summary

Die drei Aufraeum-Punkte nach v0.3.0: verworfene Verknuepfungs-Bibliothek
restlos entfernt (Maskendatei-Version 1 → 2, Bestandsdateien laden weiter),
Referenzabzug um das Runtime-Buendel entrauscht (1104 → 103 Zeilen, exakter
String-Schnitt), Inspector-Auswahlfelder an die Nachbarfelder angeglichen
(SchrittSelect nach ui/atoms, zweiter Benutzer). Reviewer: Codex CLI
(gpt-5.6-sol, effort xhigh), zwei Runden. **APPROVED**

---

## Changes Overview

Commit-Bereich 3ca6ae8..5c97056 (vier Commits, je Aufgabe einer + Release).
Kein Export-Byte geaendert: der Referenzabzug blieb bei Aufgabe 1 und 3 ohne
Erneuerung gruen; bei Aufgabe 2 aenderte sich nur die Form des Waechters
(Buendel herausgeschnitten), belegt per Gegenprobe (verfaelschtes
Markup-Byte und verfaelschte Datenzeile machen ihn jeweils rot).

---

## Findings

### Critical Issues

None.

### Major Issues

None.

### Minor Issues

- **Toolbar-Hovertext nannte den entfernten Bereich** — src/editor/shell/Toolbar.tsx:140:
  „Steuerung — Datenquellen, Verknuepfungen und Relationen der Maske".
  Disposition: **addressed** — Text nennt jetzt nur Datenquellen und Relationen.
  Beim Nachziehen per Suche zwei weitere veraltete Kommentare gefunden und
  mitgefixt (src/state/history.ts „drei Bibliotheken", src/state/notfallkopie.ts
  „Vier Faelle") — reine Kommentare, kein Verhalten.

### Suggestions

None.

---

## Checklist

- [x] 1. Functional Requirements — passed (v1-Dateien mit beliebigem verknuepfungen-Abschnitt bleiben ladbar)
- [x] 2. Code Quality — passed (nach Kommentar-Nachzug)
- [x] 3. Architectural Compliance — passed
- [x] 4. Projekt-Regeln (Aufbau-Editor) — passed (keine Sonderpfade, Design-Welten getrennt)
- [x] 5. Export & SoftEngine-Laufzeit — passed (Export unveraendert; Buendel anderweitig bewacht)
- [x] 6. Error Handling — passed
- [x] 7. Security — passed (keine relevanten Aenderungen)
- [x] 8. Performance — passed (keine relevanten Aenderungen)

---

## Verdict

**APPROVED**

Runde 1: REQUEST_CHANGES mit genau einem Minor-Fund (Hovertext), Runde 2:
APPROVED. Pruefbuendel beider Staende gruen (tsc · eslint · check:regeln ·
check:runtime · check:docs · 257 Tests / 22 Dateien). Kein SE-Echttest
noetig — Export byte-gleich. Offene Folgearbeit: keine aus dem Review;
die drei „Aufgefallen unterwegs"-Punkte des Abschlussberichts (veraltete
changelog_table.md, widerspruechlicher ARCHI-Satz zur Bedienpruefung,
verwaister Browser-Speicher-Schluessel) warten auf Nutzer-Go.
