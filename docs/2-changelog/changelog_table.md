# Changelog Table

| Version | Week | Commit Message |
| ------- | ---- | -------------- |
| `0.3.1` | 1    | chore(release): v0.3.1 — Aufraeumen nach v0.3.0 (drei Aufgaben-Commits + Codex-Review-Nachzug) |
| `0.3.0` | 1    | feat(quellen): mehrere Datenquellen je Baustein (v0.3.0) |
| `0.2.0` | 1    | feat(maske): Maske als Datei speichern und laden |
| `0.1.2` | 1    | fix(tabelle,state,waechter): vier Befunde aus der Gesamtanalyse |
| `0.1.1` | 1    | fix: StepForm-Feinschliff — schmalere Quelle-Box, Trennlinien in der Relations-Liste (Nutzer-Fund) |
| `0.1.0` | 1    | feat: „Feld übernehmen" am Schreib-Schritt (Auslöser am Parameter, V2) + sprechende Namen + Kleinputz |
| `0.0.1` | 1    | chore: TRIP-Workflow eingerichtet (Skills, ARCHI.md, Codex-Anbindung) |

# Changelog Summary

- **v0.3.1 (Aufraeumen nach v0.3.0 — Woche 1, 30-07-2026)**:
  Verknuepfungs-Bibliothek der Kommandozentrale restlos entfernt
  (Maskendatei-Version 1 → 2, Bestandsdateien laden weiter) · Referenzabzug
  entrauscht (1104 → 103 Zeilen, Runtime-Buendel exakt herausgeschnitten) ·
  Inspector-Auswahlfelder angeglichen (SchrittSelect nach ui/atoms).
  Codex-Review APPROVED (`docs/3-code-review/CR_w1_v0.3.1.md`). Export
  unberuehrt. Details: `w1_v0.3.1.md`
- **v0.3.0 (Mehrere Datenquellen je Baustein — Woche 1, 28-07-2026)**:
  Quellen-Liste am Baustein (Inspector, „+ Datenquelle", Schluesselregel ab
  Eintrag 2), Gruppen im Feld-Picker, Partnerzeile zur Laufzeit
  (`fremdeQuellen`), weitere Quellen in der SEFILELOOP. Export beruehrt →
  SE-Echttest beim Nutzer offen. Details: `w1_v0.3.0.md`
- **v0.2.0 (Maske als Datei speichern und laden — Woche 1, 28-07-2026)**:
  Maskendatei = Bauplan (Baum + Bibliotheken) mit strenger Verlust-Kontrolle:
  eine beschaedigte Datei wird abgelehnt statt still erleichtert; Laden
  ersetzt alles und leert die Historie. Details: `w1_v0.2.0.md`
- **v0.1.2 (Befunde B1–B5 aus der Gesamtanalyse — Woche 1, 28-07-2026)**:
  vier stille Fehler behoben (Tabelle/State/Waechter), Befund B4
  (Interface-Anschluss) als Doku-Klaerung in Folgecommits.
  Details: `w1_v0.1.2.md`
- **v0.1.1 (StepForm-Feinschliff — Woche 1, 22-07-2026)**:
  - **Fix (Nutzer-Fund „1995-Look")**: Parameterzeilen passen jetzt in die 340-px-Spalte — Quelle-Box `w-32`→`w-24`, Label enger, Gaps kleiner (die „Fest"-Boxen waren viel zu breit). Relations-Einträge mit feinen Trennlinien (`divide-y`) getrennt. Rein Editor-UI, Export „identisch", keine neuen Tests.
- **v0.1.0 („Feld übernehmen" V2 + sprechende Namen + Kleinputz — Woche 1, 22-07-2026)**:
  - **Feld übernehmen (V2)**: Auslöser AN der Parameter-Zeile, erkennt POS/LEN/IDBID mit UND ohne `{}` (behebt: bei der echten Nutzer-Vorlage mit nackten Wörtern erschien er nie); POS füllt Position+Länge, IDBID die Tabelle; Wert/Satz-Nummer bleiben beim Bediener. Zweistufiger Picker mit Viewport-Einklemmung (Nutzer-Fund) + Escape-Schichtung.
  - **Sprechende Namen**: `eigenerText` liest `placeholder`, default-bewusst (frisches Formularfeld bleibt „Formularfeld").
  - **Kleinputz**: tote Exporte (`getRegisteredBlockTypes`, `RelationPlaceholder`, `VERB_LABELS`, `Panel`/panel.tsx), `dashboard/`-Kommentare entschärft, Testname „Buddy"→„Testname", 2 Roh-Bilder (~6 MB) entfernt; Import-Zyklen waren schon `import type`.
  - **Nachweis**: editor-only, Prüfbündel grün (tsc·eslint·check:runtime „identisch"·115 vitest·11 e2e), kein SE-Echttest.
- **v0.0.1 (TRIP-Einrichtung — Woche 1, 20-07-2026)**:
  - **Setup**: TRIP-Workflow eingezogen — docs-Struktur, 14 Skills unter `.claude/skills/`, alle Platzhalter auf die Projektregeln zugeschnitten (Prüfbündel als Testing-Gate, Test-Bremse, Referenzabzug, SE-Echttest gebündelt, Klartext-go statt Datei-Reviews)
  - **Dokumentation**: `docs/ARCHI.md` erzeugt (Architektur-Karte: Web-Frontend + Export-Pipeline als gleichwertige Säule); Pflegeregeln `docs/ARCHI-rules.md`; `docs/4-unit-tests/TESTING.md`
  - **Multi-Agent**: Codex CLI (GPT 5.6) als Zweitmeinung und Batch-Implementierer angebunden; CLAUDE.md-Regel 8 dafür erweitert (Nutzer-Entscheidung 2026-07-20) — sequenziell in EINER Sitzung, jeder Codex-Diff wird von Claude geprüft
  - **Files Added**: docs/ARCHI.md, docs/ARCHI-rules.md, docs/2-changelog/changelog_table.md, docs/4-unit-tests/TESTING.md, .claude/skills/*
