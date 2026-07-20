# Architecture Documentation Rules

[ARCHI.md](ARCHI.md) dokumentiert die Architektur des Aufbau-Editors. Nach
jedem Paket (Feature, Umbau, Fix) prüfen, ob ARCHI.md nachziehen muss.

**Rollenteilung:** ARCHI.md = Architektur-Karte (WAS liegt wo, WIE spielt es
zusammen). `CLAUDE.md` = Regeln, Entscheidungen, Stand, Merkliste — gewinnt
bei Widerspruch. Entscheidungs-Begründungen und Historie gehören NICHT in
ARCHI.md (dafür: CLAUDE.md, `docs/decisions/`).

## When to Update

Nach JEDER Änderung, die Folgendes verschiebt:

- Projektstruktur — neue Ordner/Bausteine/Fächer, verschobene Dateien (Abschnitt 3)
- Technologie-Stack — neue Abhängigkeiten, Versionssprünge (Abschnitt 2)
- Zustand/Seiten/Persistenz — Schema-Migrationen, Seiten-Modell (Abschnitt 5)
- SoftEngine-Schicht — NEU BELEGTE Kontrakte, neue Quellen-Arten (Abschnitt 6)
- Aktionsketten — neue Schritt-Arten oder Parameterquellen (Abschnitt 7)
- Export-Pipeline — SEvariablen-Formen, serializer, ff-runtime (Abschnitt 8)
- Test-Strategie — nur bei Nutzer-Entscheidung (Wächter sind fixiert) (Abschnitt 9)
- Datenfluss (Abschnitt 11) und bewusste Grenzen (Abschnitt 13 — Grenze gefallen oder neu)

## How to Update by Change Type

### Neuer Baustein / neue Ketten-Schritt-Art (Major)

Prüfen: 3 (Struktur), 7 (Ketten), 8 (Export), 11 (Datenfluss), 13 (Grenzen)

### Kleines Feature / reines Bedienpaket

Prüfen: 3 (Struktur) — Editor-Bedienung ohne Strukturwirkung braucht meist NICHTS

### Bug Fix

Meist nichts — außer der Fix belegt oder korrigiert einen SE-Kontrakt (6)

### Abhängigkeiten

Prüfen: 2 (Technologie-Stack)

## Guidelines

- Präzise und faktisch — den echten Code abbilden, nichts Idealisiertes
- Knapp — Verständnis ja, Implementierungsdetails nein (deutlich unter ~20k Tokens halten; Prüfung: `bash .claude/skills/TRIP-compact/count-tokens.sh docs/ARCHI.md`)
- Diagramme nachziehen, wenn sich der Datenfluss ändert
- Echte Dateipfade nennen
