# Changelog Table

| Version | Week | Commit Message |
| ------- | ---- | -------------- |
| `0.0.1` | 1    | chore: TRIP-Workflow eingerichtet (Skills, ARCHI.md, Codex-Anbindung) |

# Changelog Summary

- **v0.0.1 (TRIP-Einrichtung — Woche 1, 20-07-2026)**:
  - **Setup**: TRIP-Workflow eingezogen — docs-Struktur, 14 Skills unter `.claude/skills/`, alle Platzhalter auf die Projektregeln zugeschnitten (Prüfbündel als Testing-Gate, Test-Bremse, Referenzabzug, SE-Echttest gebündelt, Klartext-go statt Datei-Reviews)
  - **Dokumentation**: `docs/ARCHI.md` erzeugt (Architektur-Karte: Web-Frontend + Export-Pipeline als gleichwertige Säule); Pflegeregeln `docs/ARCHI-rules.md`; `docs/4-unit-tests/TESTING.md`
  - **Multi-Agent**: Codex CLI (GPT 5.6) als Zweitmeinung und Batch-Implementierer angebunden; CLAUDE.md-Regel 8 dafür erweitert (Nutzer-Entscheidung 2026-07-20) — sequenziell in EINER Sitzung, jeder Codex-Diff wird von Claude geprüft
  - **Files Added**: docs/ARCHI.md, docs/ARCHI-rules.md, docs/2-changelog/changelog_table.md, docs/4-unit-tests/TESTING.md, .claude/skills/*
