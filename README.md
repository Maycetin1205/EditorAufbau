# Aufbau-Editor

Visueller Baukasten für SoftEngine-ERP-Masken: Bausteine (Formularfelder,
Tabelle, Kanban, Navigation, Popups) auf eine Fläche ziehen, an ERP-Daten
binden, als fertiges Masken-Paar exportieren — `index.basis.source.html` +
`index.basis.SEvariablen.json`. Die Maske läuft in SoftEngine (BüroWARE/
WEBWARE) ohne Nacharbeit von Hand. **Was im Editor zu sehen ist, IST der
Export**: dieselben Web Components rendern im Editor und in der Maske.

## Starten

```
npm install
npm run dev        # Editor im Browser (Vite)
```

## Prüfen

```
npm run check      # das komplette Pflicht-Bündel vor jedem Commit:
                   # tsc -b · eslint src · check:regeln · check:runtime · vitest
```

Einzeln: `npm run check:regeln` (Architektur-Wächter) ·
`npm run check:runtime` (eingechecktes Runtime-Bündel == frischer Build) ·
`npm test`. Ändert ein Commit absichtlich die Masken-Laufzeit:
`npm run build:runtime` und den byte-genauen Referenzabzug mit
`npx vitest run -u` erneuern — der Diff gehört sichtbar in den Commit.

## Orientierung

| Ort | Inhalt |
| --- | --- |
| `src/blocks/` | die Bausteine (Lit Web Components, laufen im Editor UND im Export) |
| `src/core/` | Registry-Konzepte und Daten-/Aktionsmodell — kennt keinen konkreten Baustein |
| `src/editor/` | die Bedienoberfläche (React): Canvas, Inspector, Datencenter |
| `src/state/` | der Editor-Zustand: Baum, Undo, Speichern, Migrationen |
| `src/export/` | deterministischer Export, Validator, Referenzabzug |
| `src/softengine/` | die Brücke zum ERP (Anmeldung, Daten, Relationen) — kennt keinen Baustein |
| `designsprache/` | der eingecheckte Musterbogen: abschreiben statt gestalten |
| `docs/` | Belege: zwei echte Referenzmasken + gesammeltes SoftEngine-Wissen |

## Regeln und Arbeit

- **`CLAUDE.md`** ist das Regel- und Entscheidungsbuch — zuerst lesen.
  Kernregeln: Fähigkeiten sind Registry-Einträge, kein Typ-Sondercode ·
  eine Render-Quelle · SE-Kontrakte nur aus belegten Originalquellen ·
  Dateien ≤ 500 Zeilen · Prüfbündel vor jedem Commit.
- **`UMBAU-PLAN-V6.md`** ist der aktuelle Bauauftrag: was offen ist, was
  entschieden ist, was bewusst gestrichen wurde.
- Die Chronik („was wann gebaut wurde") steht ausschließlich in der
  git-Historie.
